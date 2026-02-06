# Git 指南

## 语言规范

**所有代码和文档必须使用纯英文。**

- ✅ 代码注释：英文
- ✅ 提交消息：英文
- ✅ 文档：英文
- ✅ 变量/函数名：英文
- ❌ 禁止中文、拼音或中英混合

Pre-commit 钩子会自动检测并拒绝包含中文字符的提交。

## 提交消息格式

遵循 Conventional Commits 格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 类型

| 类型 | 用途 | 示例 |
|------|-------|---------|
| `feat` | 新功能 | `feat(core): add transaction streaming support` |
| `fix` | Bug 修复 | `fix(cli): handle missing config file gracefully` |
| `docs` | 仅文档变更 | `docs(readme): update monorepo setup instructions` |
| `style` | 代码风格（无逻辑变更） | `style(format): run oxfmt on all packages` |
| `refactor` | 代码重构 | `refactor(core): extract runtime abstractions to interfaces` |
| `test` | 添加/更新测试 | `test(openclaw): add plugin registration E2E test` |
| `chore` | 构建/配置 | `chore(deps): upgrade oxlint to v0.15` |

### 作用域

| 作用域 | 描述 |
|-------|-------------|
| `core` | Core package (framework-agnostic) |
| `cli` | CLI package |
| `openclaw` | OpenClaw adapter package |
| `plaid` | Plaid API 集成 |
| `gocardless` | GoCardless 集成 |
| `gmail` | Gmail 集成 |
| `storage` | 本地文件存储 |
| `credentials` | 凭证管理 (keychain) |
| `security` | 安全特性 (audit, encryption) |
| `exports` | 数据导出 (Beancount, Ledger) |
| `tools` | Agent 工具 |
| `oauth` | OAuth 流程 |
| `docs` | 文档 |
| `build` | 构建/CI 配置 |
| `hooks` | Git hooks |

### 示例

```
feat(core): implement Plaid Link OAuth flow

- Add createLinkToken() function
- Add exchangePublicToken() function
- Integrate with runtime abstractions

Closes #12

fix(storage): handle cursor-based pagination correctly

Previously, the sync would miss transactions when the
cursor expired. Now we fetch from start date if cursor
is invalid.

fixes #15

refactor(openclaw): update plugin to use new core package

Migrate from direct implementation to using @fire-zu/billclaw-core.
Update all imports and adapt to new runtime context interface.
```

## 分支命名

```
feat/<feature-name>
fix/<bug-name>
refactor/<description>
docs/<update-name>
```

示例：
- `feat/core-plaid-oauth`
- `feat/cli-interactive-setup`
- `fix/storage-transaction-streaming`
- `refactor/openclaw-adapter`
- `docs/migration-guide`

## Pull Request 指南

1. 标题应遵循提交格式
2. 描述应包含：
   - 变更内容
   - 变更原因
   - 测试方法
3. 关联相关 Issue
4. 添加标签：`feat`, `fix`, `breaking`, `docs`

## Rebase vs Merge

优先使用 **rebase** 保持线性历史：

```bash
git fetch upstream
git rebase upstream/main
# (如有冲突，解决后)
git push origin feature-branch --force-with-lease
```
