# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

RSS EdgeOne 是一个基于 EdgeOne Pages Cloud Functions 的 RSS 监控推送系统，支持 SSE 实时推送。

## 常用命令

```bash
pnpm dev          # 本地开发 (edgeone pages dev)
pnpm deploy       # 部署到 EdgeOne (edgeone pages deploy)
pnpm test         # 运行测试 (vitest run)
pnpm test:watch   # 测试监听模式
```

## 技术架构

### 技术栈
- **后端**: EdgeOne Cloud Functions (Node.js 20 runtime, entry: `cloud-functions/[[default]].js`)
- **前端**: 纯 vanilla HTML/CSS/JavaScript (`index.html`)
- **存储**: EdgeOne Blob Storage (`@edgeone/pages-blob` npm 包)
- **RSS 解析**: `rss-parser` npm 包
- **ID 生成**: `uuid` npm 包
- **测试**: Vitest v3.0.0（目前无测试文件）

### 架构选择：Cloud Functions 而非 Edge Functions

本项目使用 **Cloud Functions (Node.js 20)** 而非 Edge Functions (V8)，因为需要 npm 包支持（`rss-parser`、`uuid`、`@edgeone/pages-blob`）。Edge Functions 不支持 npm 包且使用 KV Storage，而 Cloud Functions 支持 npm 包并使用 Blob Storage。

### 单文件路由架构

所有 API 路由由 `cloud-functions/[[default]].js` 处理，采用手动路由分发（无框架）。路由匹配通过 URL pathname 判断，请求方法通过 `request.method` 区分。顶层 try/catch 包裹所有路由，返回 500 + 错误信息。

### API 路由

| 方法 | 路径 | 认证 | 说明 |
|-----|------|------|------|
| GET | `/` | 否 | API 信息（返回 JSON） |
| GET | `/api/health` | 否 | 健康检查 |
| GET | `/api/feeds` | 否 | 获取订阅源列表 |
| POST | `/api/feeds` | ✅ | 添加订阅源 `{url, title}` |
| DELETE | `/api/feeds/:id` | ✅ | 删除订阅源 |
| GET | `/api/articles` | 否 | 获取所有文章 |
| GET | `/api/latest?since=xxx` | 否 | 获取新文章 |
| POST | `/api/check` | ✅ | 手动触发抓取 |
| GET | `/api/settings` | 否 | 获取设置 |
| PUT | `/api/settings` | ✅ | 更新设置 `{timeRangeHours}` |
| GET | `/ws` 或 `/sse` | 否 | SSE 实时推送 |

认证方式: `X-API-Key` header 或 `api_key` query 参数，与 `context.env.API_KEY` 比对。

### Blob Storage 数据模型

Blob Storage 通过 `@edgeone/pages-blob` 访问，使用 JSON 序列化：

```javascript
const store = await getStore('rss-store');
await store.setJSON('feeds', feedsArray);
const data = await store.get('feeds', 'json');
```

存储键：
- `feeds` — Feed 数组 `[{id, url, title, createdAt}]`
- `last-check` — 最近抓取结果 `{timestamp, totalArticles, timeRangeHours, articles[], errors?}`
- `settings` — `{timeRangeHours}` (1-168 小时，默认 24)

### SSE 实时推送

SSE 端点使用 `ReadableStream` + `TransformStream` 实现。活跃客户端保存在内存 `Set` 中（不跨实例共享）。每 30 秒发送心跳。新连接时发送上次抓取结果作为初始数据。使用 `context.waitUntil` 保持函数存活。

前端通过指数退避重连（2^retries 秒，最大 5 分钟）。

### 前端架构

`index.html` 是单文件 SPA，暗色主题，双栏布局（侧边栏 340px + 主内容区）。状态由三个变量驱动：`feeds`、`articles`、`activeFeedId`，通过手动重渲染函数更新 UI。API Key 存储在 localStorage 中。XSS 防护通过 `escapeHtml` / `escapeAttr` 工具函数。

### 环境变量

在 EdgeOne 控制台或 `edgeone.json` 配置：
- `API_KEY` — 管理端点的 API Key（必填，为空时返回 500）
- `ALLOWED_ORIGINS` — CORS 允许的域名（可选，逗号分隔，默认 `*`）
- `NODE_ENV` — 在 `edgeone.json` 中设为 `production`

### 定时抓取

GitHub Actions 工作流 (`.github/workflows/rss-cron.yml`) 每小时触发 `POST /api/check`：
- Secrets: `EDGEONE_API_URL`, `EDGEONE_API_KEY`
