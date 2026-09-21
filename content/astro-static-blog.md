---
title: 用 Astro 搭一个几乎不用维护的静态博客
date: 2026-02-18
tags: [Astro, 前端]
draft: false
description: 为什么这个站点选择 Astro + 原生 CSS + GitHub Actions 这三件套。
---

动态博客的维护成本大多花在不需要的地方：数据库、服务端补丁、插件升级。
这个站点把整条链路压到只剩三件东西。

## 技术选型

- **Astro** 负责静态生成，产物是扁平的 HTML 与少量 CSS/JS；
- **原生 CSS** 负责排版，没有框架、没有构建期样式依赖；
- **GitHub Actions** 负责发布，推送到 `main` 即完成构建与上线。

## 内容即代码

文章就是 `content/` 下的 Markdown 文件，元数据写在 front matter 里：

```yaml
---
title: 用 Astro 搭一个几乎不用维护的静态博客
date: 2026-02-18
tags: [Astro, 前端]
draft: false
---
```

`draft: true` 的文章在 `pnpm build` 时会被整体剔除，既不会生成页面，也不会进入首页、标签页、搜索索引和 RSS。

> 发布的边界由构建流程保证，而不是靠人记得删文件。

## 发布链路

```bash
pnpm build          # 本地先验证
git push origin main # CI 构建并发布到 GitHub Pages
```

构建产物 `dist/` 不入库，仓库里只有内容与源码。
