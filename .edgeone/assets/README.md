# RSS EdgeOne

基于 EdgeOne Pages Cloud Functions + Blob Storage 的 RSS 监控推送系统。

## 功能特性

- **RSS 订阅管理** - 添加、删除订阅源
- **自动抓取** - GitHub Actions 定时触发（每小时）
- **实时推送** - Server-Sent Events (SSE) 实时推送新文章
- **持久化存储** - Blob Storage 数据持久化

## 技术栈

- **后端**: EdgeOne Cloud Functions (Node.js 20)
- **存储**: EdgeOne Blob Storage
- **RSS 解析**: rss-parser
- **前端**: Vanilla HTML/CSS/JS

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 部署到 EdgeOne

```bash
pnpm deploy
```

或使用 API Token：

```bash
npx edgeone pages deploy -t "YOUR_API_TOKEN"
```

### 3. 配置

在 EdgeOne 控制台设置环境变量：
- `API_KEY` - 管理端点的 API Key
- `ALLOWED_ORIGINS` - CORS 允许的域名（可选，默认 *）

## API 接口

| 方法 | 路径 | 认证 | 说明 |
|-----|------|------|------|
| GET | `/` | 否 | API 信息 |
| GET | `/api/health` | 否 | 健康检查 |
| GET | `/api/feeds` | 否 | 获取订阅源列表 |
| POST | `/api/feeds` | ✅ | 添加订阅源 |
| DELETE | `/api/feeds/:id` | ✅ | 删除订阅源 |
| GET | `/api/articles` | 否 | 获取所有文章 |
| GET | `/api/latest?since=xxx` | 否 | 获取新文章 |
| POST | `/api/check` | ✅ | 手动触发抓取 |
| GET | `/api/settings` | 否 | 获取设置 |
| PUT | `/api/settings` | ✅ | 更新设置 |
| GET | `/ws` | 否 | SSE 实时推送 |

### 认证方式

```bash
# Header 方式
curl -X POST "https://your-domain/api/feeds" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"url":"https://example.com/feed.xml","title":"My Feed"}'

# Query 方式
curl -X POST "https://your-domain/api/feeds?api_key=your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/feed.xml"}'
```

## 本地开发

```bash
# 启动本地开发服务器
pnpm dev

# 运行测试
pnpm test
```

## 部署预览

- **前端**: https://rss-feed.edgeone.cool/
- **测试面板**: https://rss-feed.edgeone.cool/test-api.html
- **API**: https://rss-feed.edgeone.cool/api/health

## 项目结构

```
rss-edgeone/
├── cloud-functions/
│   └── [[default]].js    # Cloud Functions 代码
├── index.html            # RSS 阅读器前端
├── test-api.html         # API 测试面板
├── edgeone.json          # EdgeOne 配置
├── package.json
└── .github/workflows/
    └── rss-cron.yml      # 定时抓取任务
```

## 配置说明

### edgeone.json

```json
{
  "version": 2,
  "name": "rss-edgeone",
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "default": {
      "runtime": "nodejs20",
      "entry": "cloud-functions/[[default]].js",
      "routes": [
        {
          "pattern": "/*",
          "target": "function",
          "function": "default"
        }
      ]
    }
  }
}
```

### GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

| Secret | 说明 |
|--------|------|
| `EDGEONE_API_URL` | 你的 EdgeOne 部署 URL |
| `EDGEONE_API_KEY` | API Key（与 .env 中一致） |

## License

MIT