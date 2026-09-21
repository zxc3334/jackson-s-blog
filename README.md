# personal-blog

个人博客系统：Markdown 写作 + GitHub Actions 自动发布。

线上地址：<https://zxc3334.github.io/jackson-s-blog/>

## 快速开始

```bash
pnpm install
pnpm dev      # 本地预览 http://localhost:4321/jackson-s-blog
pnpm build    # 构建静态产物到 dist/
pnpm check    # 构建产物审计（死链、RSS、草稿隔离、主题脚本）
```

## 自动发布

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布到 GitHub Pages。

首次使用需要在仓库 Settings → Pages 中把 Source 设为 **GitHub Actions**。

```
写文章 / 改代码 → pnpm build 本地校验 → git push main → GitHub Actions → dist/ → GitHub Pages
```

## 目录结构

```
content/            文章（Markdown + front matter，draft: true 不参与生产构建）
src/content.config.ts  内容集合与 front matter 校验（zod，缺字段直接构建失败）
src/layouts/        页面骨架（含主题初始化脚本与导航）
src/components/     文章列表等复用片段
src/lib/            URL 拼接、草稿过滤、标签聚合、摘要与阅读时长
src/pages/          路由：/ /about /posts /posts/[id] /tags /tags/[tag] /search /rss.xml 404
src/styles/global.css  原生 CSS 排版与亮暗主题变量
scripts/check-dist.mjs 产物审计脚本
public/             直接拷贝到 dist 的静态资源
dist/               构建产物（不入库）
```

## 写作约定

文章放在 `content/` 下（支持子目录），每篇必须有 front matter：

```markdown
---
title: 文章标题      # 必填
date: 2026-01-01    # 必填
tags: [标签]        # 必填
draft: false       # 必填；true 时生产构建整体剔除
description: 摘要   # 可选，用于列表、搜索与 RSS
---
```

`draft: true` 的文章在 `pnpm dev` 下可见（方便预览），在 `pnpm build` 下不会生成页面，
也不会出现在首页、标签页、搜索索引与 `rss.xml` 中。

## 部署配置

站点地址由 `astro.config.mjs` 的 `site` + `base` 决定，`src/lib/site.ts` 的 `url()`
负责拼接站内路径。绑定自定义域名时需要同时改这两处，并移除 `base`。
