# Auto Deploy to GitHub Pages 🚀

One-click deployment of static sites to GitHub Pages with Jekyll support, asset optimization, and SEO enhancements.

## Features

- ✅ **Jekyll Build Support** - Automatically build Jekyll sites
- ✅ **Image Compression** - Optimize images before deployment
- ✅ **HTML Minification** - Reduce page size for faster loading
- ✅ **Custom Domain** - Support for custom domain names
- ✅ **SEO Enhancements** - Auto-generate sitemap and meta tags
- ✅ **Fast Deployment** - Deploy in under 60 seconds

## Usage

### Basic Usage

```yaml
- name: Deploy to GitHub Pages
  uses: WDSEGA/auto-deploy-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Full Configuration

```yaml
- name: Deploy to GitHub Pages
  uses: WDSEGA/auto-deploy-action@v1
  with:
    github-token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
    source-dir: './site'
    jekyll-build: 'true'
    cname: 'www.example.com'
    compress-images: 'true'
    minify-html: 'true'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub Personal Access Token with repo permissions | Yes | - |
| `source-dir` | Directory containing your site source files | No | `.` |
| `jekyll-build` | Enable Jekyll build | No | `true` |
| `cname` | Custom domain name | No | `` |
| `compress-images` | Compress images before deployment | No | `true` |
| `minify-html` | Minify HTML output | No | `true` |

## Outputs

| Output | Description |
|--------|-------------|
| `site-url` | The URL of the deployed site |
| `deploy-status` | Deployment status (success/failed) |

## Example Workflow

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to GitHub Pages
        uses: WDSEGA/auto-deploy-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          jekyll-build: 'true'
          compress-images: 'true'
          minify-html: 'true'
```

## License

MIT License
