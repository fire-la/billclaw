# Git 指南

## 语言规范

**所有代码和文档必须使用纯英文。** 详见 `.claude/hooks/naming.md`

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
| `feat` | 新功能 | `feat(plaid): add Plaid Link OAuth flow` |
| `fix` | Bug 修复 | `fix(webhook): retry failed webhook deliveries` |
| `docs` | 仅文档变更 | `docs(readme): add installation instructions` |
| `style` | 代码风格（无逻辑变更） | `style(config): format with prettier` |
| `refactor` | 代码重构 | `refactor(sync): extract sync logic to service` |
| `test` | 添加/更新测试 | `test(plaid): add unit tests for token exchange` |
| `chore` | 构建/配置 | `chore(deps): upgrade plaid to v32` |

### 作用域

| 作用域 | 描述 |
|-------|-------------|
| `plaid` | Plaid API 集成 |
| `gocardless` | GoCardless 集成 |
| `gmail` | Gmail 集成 |
| `webhook` | Webhook 处理 |
| `sync` | 数据同步 |
| `storage` | 本地文件存储 |
| `config` | 配置管理 |
| `cli` | CLI 命令 |
| `tools` | Agent 工具 |
| `oauth` | OAuth 流程 |
| `docs` | 文档 |

### 示例

```
feat(plaid): implement Plaid Link OAuth flow

- Add createLinkToken() function
- Add exchangePublicToken() function
- Integrate with OpenClaw OAuth context

Closes #12

fix(sync): handle cursor-based pagination correctly

Previously, the sync would miss transactions when the
cursor expired. Now we fetch from start date if cursor
is invalid.

fixes #15
```

## 分支命名

```
feat/<feature-name>
fix/<bug-name>
refactor/<description>
docs/<update-name>
```

示例：
- `feat/plaid-oauth`
- `fix/webhook-retry`
- `refactor/config-schema`

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
