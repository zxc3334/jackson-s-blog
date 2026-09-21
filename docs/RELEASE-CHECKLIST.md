# 发布验收清单（Release Audit）

对应工单：`06-pipeline-verification-and-release-audit.md`
审计日期：2026-09-20 · 执行环境：Node v22.23.2 / pnpm 11.21.0 / Astro 7.3.3

## 一、本地构建验证

- [x] `pnpm install --frozen-lockfile` 退出码 0，无被忽略的构建脚本告警
- [x] `pnpm build`（即 `astro build`）退出码 0，11 个页面生成，无构建警告
- [x] 产物输出至 `dist/`，`dist/` 已在 `.gitignore` 中，不入库
- [x] `pnpm dlx @astrojs/check` 类型检查 0 error / 0 warning
- [x] `pnpm check` 产物审计全部通过（见下）

## 二、产物结构（`src/pages` → `dist/`）

| 路由 | 产物 |
| --- | --- |
| `/` | `dist/index.html` |
| `/about/` | `dist/about/index.html` |
| `/posts/` | `dist/posts/index.html` |
| `/posts/[id]/` | `dist/posts/<id>/index.html` |
| `/tags/` | `dist/tags/index.html` |
| `/tags/[tag]/` | `dist/tags/<tag>/index.html`（中文标签按 UTF-8 百分号编码） |
| `/search/` | `dist/search/index.html` |
| `/rss.xml` | `dist/rss.xml` |
| 404 | `dist/404.html` |
| 静态资源 | `dist/_astro/*.css`、`dist/favicon.svg` |

## 三、产物审计（`pnpm check` 实测结果）

- [x] 必需产物齐备（14 个文件）
- [x] 内部链接无死链：132 条站内链接逐条校验（含百分号编码路径解码后校验）
- [x] RSS 含 XML 声明；channel 的 title/link/description 完整
- [x] RSS 条目含 title/link/pubDate/guid，按发布时间倒序
- [x] 草稿隔离：`draft: true` 文章未出现在任何产物文件中
- [x] 搜索索引内嵌于 `/search/` 页，索引链接均指向真实页面
- [x] 主题脚本：无存储时跟随系统偏好、有存储时以存储为准、点击后写回 localStorage

## 四、运行时验证（本地静态服务）

以 `python3 -m http.server` 托管 `dist/` 实测：

- [x] `/`、`/about/`、`/tags/`、`/tags/Astro/`、`/tags/随笔/`、`/posts/astro-static-blog/`、`/search/`、`/rss.xml`、`/_astro/*.css`、`/favicon.svg` 全部 200
- [x] `/rss.xml` Content-Type 为 `application/xml`
- [x] 草稿路径 `/posts/drafts/note-future/` 返回 404（草稿未生成页面）
- [x] 未知路径返回 404 页面
- [x] `pnpm dev` 启动无异常，上述路由全部可访问；草稿在 dev 下可预览（便于写作）

## 五、CI 流水线对齐（`.github/workflows/deploy.yml`）

未修改 CI 配置，逐项核对现有配置与产物：

- [x] 触发条件 `push: branches: [main]` + `workflow_dispatch`
- [x] `pnpm/action-setup@v4` version 11 ↔ 本地实测 pnpm 11.21.0
- [x] `actions/setup-node@v4` node-version 22 ↔ 本地实测 Node 22.23.2，`cache: pnpm`
- [x] `pnpm install --frozen-lockfile` 本地退出码 0（lockfile 已提交，含 fast-xml-parser）
- [x] `pnpm build` 输出目录为 `dist`，与 `actions/upload-pages-artifact@v3` 的 `path: dist` 一致
- [x] 权限仅使用官方 Pages 能力（`pages: write`、`id-token: write`），仓库无硬编码凭证
- [x] `concurrency: group: pages` 保证发布串行

## 六、上线前人工确认（需在 GitHub 侧完成）

- [ ] 仓库 Settings → Pages → Source 设为 **GitHub Actions**
- [ ] 推送 `main` 后确认 Actions 中 `Build and Deploy` 的 build / deploy 两个 job 均绿
- [ ] 打开 <https://zxc3334.github.io/jackson-s-blog/> 确认首页、文章页、标签页、搜索、关于页可访问
- [ ] 浏览器控制台确认无 404 资源；亮暗切换后刷新保持主题
- [ ] RSS 阅读器订阅 `https://zxc3334.github.io/jackson-s-blog/rss.xml` 确认可解析

## 七、剩余风险

- 站点为 GitHub Pages **项目站点**，全部站内链接带 `/jackson-s-blog/` 前缀；若日后绑定自定义域名，需同步修改 `astro.config.mjs`（`site`/`base`）并移除 `base`。
- 刷新页面时的首屏无 FOUC 由内联脚本保证；该脚本以字符串内联，若被 CSP 限制需加 hash 白名单。
- 搜索为全量正文摘要（每篇 1200 字以内）内嵌方案，文章规模到数百篇时建议改为独立 `search-index.json` 按需加载。
