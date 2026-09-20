# personal-blog

个人博客系统。静态站点，内容以 Markdown 维护，**推送到 `main` 由 GitHub Actions 自动构建并发布**。

## 发布链路（不可绕开）

```
写文章 / 改代码 → git push main → GitHub Actions → 构建静态产物 → 发布到 Pages
```

- 发布由 CI 全自动完成，**不要在本地手工部署**，也不要把构建产物提交进仓库。
- 任何要改 CI、改发布目标、执行 `git push` 的操作，都属于高危操作，先走审批。

## 约定

- 内容与代码分离：文章放 `content/`，站点代码放 `src/`，构建产物 `dist/` 不入库。
- 每篇文章必须有 front matter（title、date、tags、draft）。
- 本地开发用 `pnpm dev` 预览；提交前必须本地构建通过（`pnpm build`）。
- 不提交任何凭证；部署密钥只存在于 GitHub Secrets。

## 错题本

> 踩坑后追加一行：现象 → 原因 → 正确做法。

