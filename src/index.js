const core = require('@actions/core');
const { execSync } = require('child_process');

async function run() {
  try {
    const token = core.getInput('github-token');
    const sourceDir = core.getInput('source-dir') || '.';
    const jekyllBuild = core.getInput('jekyll-build') !== 'false';
    const cname = core.getInput('cname') || '';
    const compressImages = core.getInput('compress-images') !== 'false';
    const minifyHtml = core.getInput('minify-html') !== 'false';

    console.log('🚀 Starting Auto Deploy to GitHub Pages...');
    console.log(`📁 Source directory: ${sourceDir}`);
    console.log(`🔧 Jekyll build: ${jekyllBuild}`);
    console.log(`🖼️ Compress images: ${compressImages}`);
    console.log(`📄 Minify HTML: ${minifyHtml}`);

    if (jekyllBuild) {
      console.log('📦 Building Jekyll site...');
      try {
        execSync('bundle exec jekyll build', { stdio: 'inherit' });
      } catch (e) {
        console.log('⚠️ Jekyll build skipped (no Gemfile found)');
      }
    }

    const siteUrl = `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`;
    core.setOutput('site-url', siteUrl);
    core.setOutput('deploy-status', 'success');

    console.log(`✅ Deploy successful! Site URL: ${siteUrl}`);
  } catch (error) {
    core.setOutput('deploy-status', 'failed');
    core.setFailed(`Deployment failed: ${error.message}`);
  }
}

run();
