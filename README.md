# Auto Deploy to GitHub Pages 🚀

> 一键部署静态网站到 GitHub Pages，支持 Jekyll 构建、资源优化和 SEO 增强
> One-click deployment of static sites to GitHub Pages with Jekyll support, asset optimization, and SEO enhancements.

---

## ✨ 功能 / Features

- ✅ **Jekyll 构建** / Jekyll Build — 自动检测并构建 Jekyll 站点
- ✅ **图片压缩** / Image Compression — 部署前自动优化图片
- ✅ **HTML 压缩** / HTML Minification — 减小页面体积，加载更快
- ✅ **自定义域名** / Custom Domain — 支持 CNAME 自定义域名
- ✅ **SEO 增强** / SEO Enhancements — 自动生成 sitemap 和 meta 标签
- ✅ **快速部署** / Fast Deployment — 60 秒内完成部署

---

## 📦 用法 / Usage

### 基础用法 / Basic

```yaml
- name: Deploy to GitHub Pages
  uses: WDSEGA/auto-deploy-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 完整配置 / Full Configuration

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

---

## ⚙️ 输入参数 / Inputs

| 参数 Input | 说明 Description | 必填 Required | 默认值 Default |
|-----------|-----------------|---------------|--------------|
| `github-token` | GitHub Personal Access Token（需 repo 权限） | 是 | - |
| `source-dir` | 站点源文件目录 | 否 | `.` |
| `jekyll-build` | 是否启用 Jekyll 构建 | 否 | `true` |
| `cname` | 自定义域名 | 否 | `` |
| `compress-images` | 是否压缩图片 | 否 | `true` |
| `minify-html` | 是否压缩 HTML | 否 | `true` |

## 📤 输出 / Outputs

| 输出 Output | 说明 Description |
|------------|-----------------|
| `site-url` | 部署后的站点 URL |
| `deploy-status` | 部署状态（success / failed） |

---

## 🚀 完整 Workflow 示例 / Example Workflow

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

---

## 🛠 更多资源 / More Resources

- 📦 **AI Coder's Toolkit** — Cursor 配置 + 25+ 开源 AI 模型模板 → [Gumroad](https://segauser.gumroad.com/l/vagxc)
- 📝 **技术博客** → [wdsega.github.io](https://wdsega.github.io)

---

## 📄 License

MIT License
