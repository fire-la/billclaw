# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供项目指导。

## 项目概述

**billclaw** 是一个 OpenClaw 插件，提供**金融数据主权**功能。让用户将 Plaid/银行访问令牌存储在本地，而非存储在第三方应用服务器上。

### 架构设计

这是一个 **Plugin + Skill 混合架构** 项目：

- **Plugin** (`extensions/billclaw/`)：核心功能 - CLI 命令、Agent 工具、OAuth 流程、后台服务、HTTP Webhook 路由
- **Skill** (`skills/billclaw/SKILL.md`)：用户文档和示例，发布到 OpenClaw ClawHub

### 核心设计原则

项目采用 **混合架构** 的原因：
- Plugin 必需：CLI 命令、OAuth 集成、自定义 Agent Tools、后台服务、HTTP 路由
- Skill 必需：用户文档、可发布到 ClawHub

## 开发命令

所有开发命令在 `extensions/billclaw/` 目录下执行：

```bash
# 编译 TypeScript
npm run build

# 监听模式（开发）
npm run dev

# 运行测试 (Vitest)
npm run test
npm run test:coverage

# 代码检查
npm run lint      # oxlint
npm run format    # oxfmt
```

## Plugin 架构

### 入口点

`extensions/billclaw/index.ts` 导出 `billclawPlugin`，注册：

1. **CLI 命令** - `registerCLI()` - `openclaw bills setup/sync/status/config`
2. **Agent 工具** - `registerTools()` - `plaid_sync`, `gmail_fetch_bills`, `bill_parse`
3. **OAuth 提供者** - `registerOAuth()` - Plaid Link 流程
4. **后台服务** - `registerServices()` - 同步服务、Webhook 处理器

### 模块结构

```
extensions/billclaw/
├── index.ts           # Plugin 注册入口
├── config.ts          # Zod schemas + 配置 UI 提示
├── openclaw.plugin.json  # Plugin 清单（能力、路由）
├── package.json       # NPM 配置，peer deps: openclaw
└── src/
    ├── cli/commands.ts    # CLI 命令处理器（setup, sync, status, config）
    ├── tools/
    │   ├── plaid-sync.ts   # Plaid 交易同步工具
    │   ├── gmail-fetch.ts  # Gmail 账单获取工具
    │   └── bill-parse.ts   # 通用账单解析器
    ├── oauth/plaid.ts      # Plaid Link OAuth 流程
    └── services/
        ├── sync-service.ts     # 后台自动同步
        └── webhook-handler.ts  # HTTP Webhook 端点
```

### 配置 Schema

`config.ts` 使用 Zod 定义所有数据模型：
- `AccountConfigSchema` - 每账户配置（Plaid/Gmail/GoCardless）
- `WebhookConfigSchema` - Webhook 端点（HMAC 签名）
- `StorageConfigSchema` - 本地文件存储设置
- `BillclawConfigSchema` - 主插件配置
- `configUiHints` - OpenClaw 配置界面 UI 提示

### 数据存储

本地存储路径：`~/.openclaw/billclaw/`

```
~/.openclaw/billclaw/
├── accounts.json           # 账户注册表
├── accounts/{id}.json      # 每账户凭证（加密令牌）
├── transactions/{id}/YYYY/MM.json  # 按账户/月份存储交易数据
├── sync/{id}/{syncId}.json # 幂等性同步状态
├── cursor.json             # 全局同步游标
└── manifest.json           # 版本 + 统计信息
```

## 实现阶段

**Phase 0（架构设计）**：完成

- 项目结构创建
- 命名确认：**billclaw**
- 混合架构定义
- 配置 Schema 设计
- GitHub 仓库：https://github.com/fire-zu/billclaw

**Phase 1（Plaid API 集成）**：进行中 - 所有文件为 TODO 占位符

核心基础设施已存在，实际实现待完成：
- `src/tools/plaid-sync.ts` - Plaid 同步逻辑
- `src/oauth/plaid.ts` - Plaid Link OAuth 流程
- `src/cli/commands.ts` - 设置向导和同步命令
- `src/services/sync-service.ts` - 后台同步服务
- `src/services/webhook-handler.ts` - Webhook 端点

## 技术栈

- **Plaid SDK**: `plaid` npm package v32.0.0
- **Gmail 集成**: gog CLI + Pub/Sub（复用 OpenClaw 现有 Gmail hooks）
- **验证**: Zod v3.24.0
- **存储**: JSON（主要）+ CSV（导出可选）
- **OAuth**: auth-profiles.json（OpenClaw 标准令牌管理）

## fire-zu 生态

billclaw 是更大生态系统的一部分：

- **billclaw**（本仓库）- 通过 OpenClaw Plugin 进行数据导入
- **beanclaw** - 账户管理 Flutter App（https://github.com/fire-zu/beanclaw）
- **ign** - Beancount SaaS 后端（NestJS + Prisma + PostgreSQL）- 免费但不开源

billclaw 将交易数据推送到 ign 后端 API，beanclaw 从中读取显示。

## 错误处理策略

所有同步操作必须保证**幂等性**：
- 交易去重使用 24 小时窗口
- 使用临时文件的原子写入
- 基于检查点的同步游标实现断点续传

重试策略：
- API 超时 / 429 限流：指数退避（最多 3-5 次重试）
- 4xx 客户端错误：快速失败（不重试）
- 令牌过期：自动刷新一次

## 语言规范

**仓库中所有代码和文档必须使用纯英文。**

| 类型 | 语言 |
|------|------|
| 代码注释 | 英文 |
| 变量/函数名 | 英文 |
| 提交消息 | 英文 |
| 文档 | 英文 |
| 错误消息 | 英文 |

由以下机制强制执行：
- **Pre-commit 钩子**：拒绝包含中文字符的代码提交
- **Commit-msg 钩子**：拒绝包含中文的提交消息
- 详见 `.claude/hooks/naming.md` 详细命名规范

**注意**：`.claude/` 目录和 `CLAUDE.md` 本身使用中文作为 AI 开发指导，但所有项目代码和面向用户的文档必须使用英文。
