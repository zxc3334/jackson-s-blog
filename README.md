# personal-blog

个人博客系统：Markdown 写作 + GitHub Actions 自动发布。

## 快速开始

```bash
pnpm install
pnpm dev      # 本地预览
pnpm build    # 构建静态产物到 dist/
```

## 自动发布

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布到 GitHub Pages。

首次使用需要在仓库 Settings → Pages 中把 Source 设为 **GitHub Actions**。

## 目录结构

```
content/   文章（Markdown + front matter）
src/       站点代码
public/    静态资源
dist/      构建产物（不入库）
```

## 写作约定

每篇文章必须有 front matter：

```markdown
---
title: 文章标题
date: 2026-01-01
tags: [标签]
draft: false
---
```
