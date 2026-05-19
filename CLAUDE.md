# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

RSS EdgeOne 是一个基于 EdgeOne Edge Functions 的 RSS 监控推送系统，支持 SSE 实时推送。

## 常用命令

```bash
pnpm dev          # 本地开发 (edgeone pages dev)
pnpm deploy       # 部署到 EdgeOne (edgeone pages deploy)
pnpm test         # 运行测试
pnpm test:watch   # 测试监听模式
```

## 技术架构

### 技术栈
- **后端**: EdgeOne Edge Functions (V8 运行时)
- **前端**: 纯 vanilla HTML/CSS/JavaScript (index.html)
- **存储**: EdgeOne KV Storage (`KV_RSS` namespace)
- **RSS 解析**: 原生 JS 实现（DOMParser，无 npm 依赖）
- **测试**: Vitest v3.0.0

### 目录结构
```
edge-functions/
  [[...]].js      # 主应用入口，处理所有 API 路由
index.html        # 静态前端页面
```

### 技术选择依据

根据 EdgeOne Pages 文档:
- **Edge Functions**: 轻量级 API、无需 npm 包、超低延迟、**原生 KV Storage 支持**
- **Cloud Functions (Node.js)**: 复杂后端逻辑、需要 npm 包、**不支持 KV Storage**
- **SSE 实时推送**: 比 WebSocket 更轻量，支持 HTTP/2

本项目使用 **Edge Functions** 因为需要 KV Storage 存储数据。

### 运行时限制
- 最大 CPU 时间: 200ms
- 最大请求体: 1MB
- 无 npm 包支持（使用原生 JS）

### API 路由

| 方法 | 路径 | 认证 | 说明 |
|-----|------|------|------|
| GET | `/` | 否 | API 信息 |
| GET | `/api/health` | 否 | 健康检查 |
| GET | `/api/feeds` | 否 | 获取订阅源列表 |
| POST | `/api/feeds` | ✅ | 添加订阅源 `{url, title}` |
| DELETE | `/api/feeds/:id` | ✅ | 删除订阅源 |
| GET | `/api/articles` | 否 | 获取所有文章 |
| GET | `/api/latest?since=xxx` | 否 | 获取新文章 |
| POST | `/api/check` | ✅ | 手动触发抓取 |
| GET | `/api/settings` | 否 | 获取设置 |
| PUT | `/api/settings` | ✅ | 更新设置 `{timeRangeHours}` |
| GET | `/ws` | 否 | SSE 实时推送 |

认证方式: `X-API-Key` header 或 `api_key` query 参数

### 环境变量

在 EdgeOne 控制台配置:
- `API_KEY` - 管理端点的 API Key (必填)
- `ALLOWED_ORIGINS` - CORS 允许的域名 (可选，逗号分隔，默认 *)
- `KV_RSS` - KV Storage namespace 绑定 (必填)

### KV Storage

KV Storage 在 Edge Functions 中是**全局变量**，直接访问:
```javascript
await KV_RSS.get('feeds', 'json');
await KV_RSS.put('feeds', JSON.stringify(feeds));
```

### 数据模型

**Feed**:
```js
{ id: string, url: string, title: string, createdAt: ISO string }
```

**Article**:
```js
{ title: string, link: string, pubDate: ISO string, author: string, feedTitle: string }
```

**Settings**:
```js
{ timeRangeHours: number } // 1-168 小时
```

### RSS 抓取机制

- 内置 DOMParser 解析 RSS 2.0 和 Atom
- `fetchAllFeeds()` 并发抓取，默认 batch size = 5
- 根据 `timeRangeHours` 过滤文章时间范围
- 结果存储到 KV `last-check` key
- 支持 SSE 实时推送新文章

### 测试

测试文件位于 `test/` 目录:
- `test/local.test.js` - 单元测试
- `test/api.test.js` - 集成测试，需要运行中的服务器

### 部署

GitHub Actions 工作流 (`.github/workflows/rss-cron.yml`) 提供定时抓取:
- 默认每小时触发一次
- 需要配置 secrets: `EDGEONE_API_URL`, `EDGEONE_API_KEY`, 可选 `FEISHU_WEBHOOK`