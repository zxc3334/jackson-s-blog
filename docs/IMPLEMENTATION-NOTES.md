# 实现说明（Implement Notes）

对应方案：`.scratch/personal-blog/spec.md` · 工单：`.scratch/personal-blog/issues/01–06`
技术栈：Astro 7.3.3（`output: 'static'`）+ 原生 CSS + GitHub Actions → GitHub Pages

## 工单落地对照

| 工单 | 落地位置 |
| --- | --- |
| 01 脚手架与管线基线 | `package.json`（Node ≥22.12、pnpm 11）、`astro.config.mjs`、`tsconfig.json`、`pnpm-workspace.yaml`；产物固定输出 `dist/`，与 CI 的 `upload-pages-artifact path: dist` 对齐 |
| 02 内容模型与核心页面 | `src/content.config.ts`（zod 强制 title/date/tags/draft）、`content/`、`src/pages/index.astro`、`src/pages/posts/[...id].astro`、`src/pages/about.astro` |
| 03 标签聚合与导航 | `src/layouts/BaseLayout.astro`（统一顶栏/页脚）、`src/pages/tags/index.astro`、`src/pages/tags/[tag].astro`、`src/components/PostList.astro` |
| 04 原生 CSS 与主题 | `src/styles/global.css`（语义变量 + `[data-theme]`）、`BaseLayout.astro` 中 `<head>` 内联阻塞脚本 + 导航栏切换按钮 |
| 05 本地搜索与 RSS | `src/pages/search.astro`（构建期注入 JSON 索引 + 纯前端匹配/高亮）、`src/pages/rss.xml.ts`（`@astrojs/rss` 生成 RSS 2.0） |
| 06 构建与发布验收 | `scripts/check-dist.mjs`（`pnpm check`）、`docs/RELEASE-CHECKLIST.md` |

## 关键实现决策

1. **草稿隔离单点出口**：`src/lib/posts.ts` 的 `getPublishedPosts()` 是唯一取文章的入口。
   `import.meta.env.PROD` 为真时过滤 `draft !== true`；首页、文章页路由、标签聚合、
   搜索索引、RSS 全部经由此函数，不存在漏网路径。dev 下保留草稿便于预览。
2. **URL 拼接统一收口**：Astro 的 `BASE_URL` 不带尾斜杠，直接字符串拼接会产生
   `/jackson-s-blogtags/` 这类死链。全部站内路径改由 `src/lib/site.ts` 的 `url()` 生成。
3. **主题无闪烁**：优先 `localStorage`，回退 `prefers-color-scheme`，在 `<head>` 中阻塞执行；
   `localStorage` 在隐私模式下抛错时降级为亮色，不影响渲染（`try/catch` 包裹）。
4. **搜索零依赖零请求**：索引在构建期以 `<script type="application/json">` 内嵌；
   客户端只做子串匹配 + 命中高亮，高亮文本与查询词均先转义再包裹 `<mark>`，避免注入。
5. **标签中文路径**：`getStaticPaths` 返回原始标签名（编码交给 Astro），链接侧用
   `encodeURIComponent`，产物目录为 `dist/tags/<UTF-8>/`，静态服务器按百分号编码访问实测 200。
6. **RSS 细节**：`site` 传博客根路径（含 base），`trailingSlash: true` 与 Pages 的目录式
   路由一致；用 `customData` 补 `atom:link rel="self"`（`@astrojs/rss` 无 `docs` 字段支持）。

## 验证命令与结果

```bash
pnpm install --frozen-lockfile   # 退出码 0，无 ignored builds 告警
pnpm build                        # 退出码 0，11 页产物 → dist/
pnpm check                        # 15 项产物审计全部通过
pnpm dlx @astrojs/check           # 0 error / 0 warning
pnpm dev                          # 6 条路由 200，无告警；草稿可预览
```

产物审计覆盖：必需文件齐备、132 条站内链接无死链、RSS channel/item 字段完整、
草稿未泄露、搜索索引链接有效、主题脚本四种场景行为正确。

## 剩余风险

见 `docs/RELEASE-CHECKLIST.md` 第七节（自定义域名需同步改 `site`/`base`；CSP 需为内联脚本加白名单；
文章规模上百篇后搜索索引应改为按需加载的独立 JSON）。
