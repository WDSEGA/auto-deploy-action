const core = require('@actions/core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Auto Deploy to GitHub Pages
 *
 * This action:
 * 1. Detects and runs Jekyll build if Gemfile or _config.yml exists
 * 2. Handles CNAME file for custom domains
 * 3. Deploys the built site to the gh-pages branch using git
 *
 * Advanced features (image compression, HTML minification) are planned
 * but not yet implemented. They are accepted as inputs and logged as TODOs.
 */

async function run() {
  try {
    // ── Gather inputs ──────────────────────────────────────────────
    const token = core.getInput('github-token', { required: true });
    const sourceDir = core.getInput('source-dir') || '.';
    const jekyllBuild = core.getInput('jekyll-build') !== 'false';
    const cname = core.getInput('cname') || '';
    const compressImages = core.getInput('compress-images') === 'true';
    const minifyHtml = core.getInput('minify-html') === 'true';
    const deployBranch = core.getInput('deploy-branch') || 'gh-pages';
    const buildDir = core.getInput('build-dir') || '_site';

    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    const repo = process.env.GITHUB_REPOSITORY || '';
    const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';

    core.info('=== Auto Deploy to GitHub Pages ===');
    core.info(`Source directory : ${sourceDir}`);
    core.info(`Jekyll build     : ${jekyllBuild}`);
    core.info(`Deploy branch    : ${deployBranch}`);
    core.info(`Build directory  : ${buildDir}`);
    core.info(`Custom domain    : ${cname || '(none)'}`);

    // ── Resolve absolute paths ─────────────────────────────────────
    const absSourceDir = path.resolve(workspace, sourceDir);
    const absBuildDir = path.resolve(absSourceDir, buildDir);

    // ── Step 1: Jekyll Build ───────────────────────────────────────
    let deployDir = absSourceDir; // default: deploy source-dir directly

    if (jekyllBuild) {
      const hasGemfile = fs.existsSync(path.join(absSourceDir, 'Gemfile'));
      const hasConfig = fs.existsSync(path.join(absSourceDir, '_config.yml'));

      if (hasGemfile || hasConfig) {
        core.info('Detected Jekyll project (Gemfile or _config.yml found).');

        // Install Ruby and Bundler if needed
        core.info('Installing Ruby dependencies...');
        try {
          execSync('gem install bundler --no-document 2>&1 || true', {
            cwd: absSourceDir,
            stdio: 'inherit',
          });
        } catch (_) {
          core.warning('bundler install warning (may already exist)');
        }

        if (hasGemfile) {
          core.info('Running bundle install...');
          execSync('bundle install --jobs 4 --retry 3', {
            cwd: absSourceDir,
            stdio: 'inherit',
          });
        }

        core.info(`Running Jekyll build -> ${buildDir} ...`);
        execSync(`bundle exec jekyll build -d ${buildDir}`, {
          cwd: absSourceDir,
          stdio: 'inherit',
        });

        if (!fs.existsSync(absBuildDir)) {
          throw new Error(`Jekyll build completed but output directory "${absBuildDir}" not found.`);
        }

        deployDir = absBuildDir;
        core.info(`Jekyll build succeeded. Deploy directory: ${deployDir}`);
      } else {
        core.info('No Jekyll project detected (no Gemfile or _config.yml). Skipping Jekyll build.');
      }
    } else {
      core.info('Jekyll build disabled by user.');
    }

    // ── Step 2: Image compression (TODO) ───────────────────────────
    if (compressImages) {
      core.info('TODO: Image compression is not yet implemented. Skipping.');
      // TODO: Implement image compression using sharp
      // - Walk deployDir for image files (png, jpg, gif, svg, webp)
      // - Compress with sharp and overwrite in place
    }

    // ── Step 3: HTML minification (TODO) ───────────────────────────
    if (minifyHtml) {
      core.info('TODO: HTML minification is not yet implemented. Skipping.');
      // TODO: Implement HTML minification using html-minifier-terser
      // - Walk deployDir for .html files
      // - Minify and overwrite in place
    }

    // ── Step 4: CNAME file ─────────────────────────────────────────
    if (cname) {
      const cnamePath = path.join(deployDir, 'CNAME');
      fs.writeFileSync(cnamePath, cname.trim() + '\n');
      core.info(`CNAME file written: ${cname}`);
    }

    // ── Step 5: Deploy to gh-pages branch ──────────────────────────
    core.info(`Deploying "${deployDir}" to branch "${deployBranch}" ...`);

    // Configure git identity
    execSync('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });

    // Check if the deploy branch already exists (local or remote)
    let branchExists = false;
    try {
      execSync(`git rev-parse --verify refs/heads/${deployBranch}`, { stdio: 'pipe' });
      branchExists = true;
    } catch (_) {
      // Branch does not exist locally; check remote
      try {
        execSync(`git ls-remote --exit-code origin refs/heads/${deployBranch}`, { stdio: 'pipe' });
        branchExists = true;
      } catch (_2) {
        branchExists = false;
      }
    }

    if (branchExists) {
      // Delete local branch if exists, then checkout from remote
      try {
        execSync(`git branch -D ${deployBranch}`, { stdio: 'pipe' });
      } catch (_) { /* ignore */ }
      execSync(`git checkout -b ${deployBranch} origin/${deployBranch}`, { stdio: 'inherit' });
    } else {
      // Create a new orphan branch
      execSync(`git checkout --orphan ${deployBranch}`, { stdio: 'inherit' });
    }

    // Remove all tracked files from the deploy branch
    execSync(`git rm -rf . 2>/dev/null || true`, { stdio: 'pipe', cwd: workspace });

    // Copy build output into the working directory
    execSync(`cp -a ${deployDir}/. ${workspace}/`, { stdio: 'inherit' });

    // Add .nojekyll to prevent GitHub from running Jekyll again
    fs.writeFileSync(path.join(workspace, '.nojekyll'), '');

    // Stage, commit, and push
    execSync('git add -A', { stdio: 'inherit', cwd: workspace });
    execSync('git commit -m "deploy: auto-deploy from GitHub Actions" --allow-empty', {
      stdio: 'inherit',
      cwd: workspace,
    });

    // Push using the token
    const remoteUrl = `${serverUrl.replace('https://', 'https://')}${repo}`;
    // Mask the token in logs
    core.setSecret(token);

    try {
      execSync(
        `git push --force "https://x-access-token:${token}@${serverUrl.replace('https://', '')}/${repo}.git" ${deployBranch}`,
        { stdio: 'inherit', cwd: workspace }
      );
    } catch (pushError) {
      // Retry with a simpler URL format
      execSync(
        `git push --force "https://x-access-token:${token}@github.com/${repo}.git" ${deployBranch}`,
        { stdio: 'inherit', cwd: workspace }
      );
    }

    // ── Step 6: Set outputs ────────────────────────────────────────
    const siteUrl = cname
      ? `https://${cname}`
      : `https://${(process.env.GITHUB_REPOSITORY_OWNER || '').toLowerCase()}.github.io/${(repo.split('/')[1] || '').toLowerCase()}`;

    // If repo is <owner>.github.io, the URL is just the domain
    const repoName = repo.split('/')[1] || '';
    const owner = (process.env.GITHUB_REPOSITORY_OWNER || '').toLowerCase();
    let finalUrl;
    if (repoName.toLowerCase() === `${owner}.github.io`) {
      finalUrl = cname ? `https://${cname}` : `https://${owner}.github.io`;
    } else {
      finalUrl = cname ? `https://${cname}` : `https://${owner}.github.io/${repoName}`;
    }

    core.setOutput('site-url', finalUrl);
    core.setOutput('status', 'success');

    core.info(`=== Deploy successful ===`);
    core.info(`Site URL: ${finalUrl}`);
  } catch (error) {
    core.setOutput('status', 'failed');
    core.setFailed(`Deployment failed: ${error.message}`);
  }
}

run();
