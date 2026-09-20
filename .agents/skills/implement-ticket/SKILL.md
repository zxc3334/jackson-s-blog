---
name: implement-ticket
description: 实现已确认的产品方案，并在交付前完成构建验证与自我代码审查。
---

# Implement Ticket

## 执行顺序

1. 读取任务中给出的已确认方案（`.scratch/<feature>/spec.md` 与 `issues/` 下的 tickets），只实现当前范围。
2. 先检查仓库约定、现有实现和相关测试，再做最小且完整的代码修改。
3. 运行与改动相关的构建与检查，先解决基础验证失败：
   - 类型/构建：`pnpm build`
   - 有测试时：`pnpm test`
4. **验证发布链路**（本项目的核心验收点）：本地构建必须成功产出 `dist/`，且
   `.github/workflows/deploy.yml` 在改动后仍然语法有效、发布目标正确。
5. 复查自己的改动：`git diff` 全量过一遍，重点看正确性、边界条件、是否会
   破坏 CI、以及有没有把构建产物或凭证写进仓库。
6. 发现问题就修复并重新验证第 3–5 步。
7. 全部通过后，向 Agent OS 返回：实现摘要、验证命令与结果、自我审查结论、剩余风险。

## 边界

- 不擅自扩展产品范围。
- **不要自动 `git push`、不要自动创建 Pull Request、不要手工部署**；这些属于高危操作，必须先调用 `request_approval` 拿到审批。
- 无法构建或缺少外部依赖时，停止并明确报告阻塞，不要伪造验证结果。

## 注意

当前执行引擎（agy / pi）没有 Claude Code / Codex 的 Sub Agent 机制，
第 4–5 步由你自己在同一会话内完成，不要尝试调用不存在的 Tester / Code Reviewer 子代理。
