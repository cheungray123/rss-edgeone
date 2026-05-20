# RSS EdgeOne

基于 EdgeOne Pages Cloud Functions + Blob Storage 的 RSS 监控推送系统。

## 功能特性

- **RSS 订阅管理** - 添加、删除、查看订阅源
- **自动抓取** - GitHub Actions 定时触发（每小时）
- **实时推送** - Server-Sent Events (SSE) 实时推送新文章
- **持久化存储** - Blob Storage 数据持久化
- **主题切换** - 支持浅色/深色主题
- **响应式设计** - 适配桌面端和移动端

## 技术栈

- **后端**: EdgeOne Cloud Functions (Node.js 20)
- **存储**: EdgeOne Blob Storage
- **RSS 解析**: rss-parser
- **前端**: Vanilla HTML/CSS/JS (无框架依赖)

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/cheungray123/rss-edgeone.git
cd rss-edgeone
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 部署到 EdgeOne

方式一：使用 EdgeOne CLI
```bash
npx edgeone pages deploy -t "YOUR_API_TOKEN" -n your-project-name
```

方式二：先登录再部署
```bash
npx edgeone login
npx edgeone pages deploy
```

### 4. 配置环境变量

在 EdgeOne 控制台设置环境变量：

| 环境变量 | 必填 | 说明 |
|---------|------|------|
| `API_KEY` | 是 | 管理端点的 API Key，用于认证 |
| `ALLOWED_ORIGINS` | 否 | CORS 允许的域名，逗号分隔，默认 `*` |

## 使用指南

### 访问前端

部署完成后访问：`https://your-project.edgeone.cool`

### 登录

1. 点击右上角「输入 API Key」按钮
2. 输入在 EdgeOne 控制台配置的 `API_KEY`
3. 点击「保存」即可进入管理界面

### 添加订阅源

1. 登录后在左侧「添加订阅」区域输入 RSS 地址
2. 可选填写标题
3. 点击「添加」按钮

### 触发抓取

- 点击右上角「抓取」按钮手动触发
- 系统每小时自动抓取一次（通过 GitHub Actions）

### 查看文章

- 默认显示全部文章
- 点击左侧订阅源可筛选特定来源的文章

## API 接口

### 认证说明

除以下端点外，其他都需要认证：
- `/`
- `/api/health`
- `/api/feeds` (GET)
- `/api/articles`
- `/api/latest`
- `/ws`

认证方式���使用 `X-API-Key` Header 或 `api_key` Query 参数

### 接口列表

| 方法 | 路径 | 认证 | 说明 | 请求体/参数 |
|------|------|------|------|-------------|
| GET | `/` | 否 | API 信息 | - |
| GET | `/api/health` | 否 | 健康检查，返回存储状态 | - |
| GET | `/api/feeds` | 否 | 获取订阅源列表 | - |
| POST | `/api/feeds` | ✅ | 添加订阅源 | `{"url": "https://...", "title": "可选标题"}` |
| DELETE | `/api/feeds/:id` | ✅ | 删除订阅源 | - |
| GET | `/api/articles` | 否 | 获取所有文章 | - |
| GET | `/api/latest` | 否 | 获取最新文章 | `?since=2024-01-01T00:00:00Z` |
| POST | `/api/check` | ✅ | 手动触发抓取 | - |
| GET | `/api/settings` | 否 | 获取设置 | - |
| PUT | `/api/settings` | ✅ | 更新设置 | `{"timeRangeHours": 24}` |
| GET | `/ws` | 否 | SSE 实时推送 | - |

### 使用示例

```bash
# 健康检查
curl https://your-domain/api/health

# 获取订阅源列表
curl https://your-domain/api/feeds

# 添加订阅源
curl -X POST https://your-domain/api/feeds \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"url":"https://hnrss.org/frontpage","title":"Hacker News"}'

# 触发抓取
curl -X POST https://your-domain/api/check \
  -H "X-API-Key: your-api-key"

# 获取所有文章
curl https://your-domain/api/articles

# 获取设置
curl https://your-domain/api/settings

# 更新设置
curl -X PUT https://your-domain/api/settings \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"timeRangeHours": 48}'
```

### SSE 连接

```javascript
const es = new EventSource('https://your-domain/ws');

es.addEventListener('connected', (e) => {
  console.log('已连接:', JSON.parse(e.data));
});

es.addEventListener('new-articles', (e) => {
  const data = JSON.parse(e.data);
  console.log('新文章:', data.count, data.articles);
});
```

## 设置说明

| 设置项 | 范围 | 说明 |
|--------|------|------|
| `timeRangeHours` | 1-168 | 抓取文章的时间范围（小时），默认 24 小时 |

## 自动抓取配置

### GitHub Actions

项目已配置 GitHub Actions 定时任务 (`.github/workflows/rss-cron.yml`)

1. 在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

| Secret Name | Value |
|-------------|-------|
| `EDGEONE_API_URL` | 你的 EdgeOne 部署 URL（如 `https://rss-feed.edgeone.cool`） |
| `EDGEONE_API_KEY` | 与 EdgeOne 控制台一致的 API Key |

2. 默认每小时执行一次抓取

3. 可在 GitHub Actions 页面手动触发：「Run workflow」

## 项目结构

```
rss-edgeone/
├── cloud-functions/
│   └── [[default]].js    # Cloud Functions 主代码
├── index.html             # RSS 阅读器前端
├── test-api.html          # API 测试面板
├── edgeone.json           # EdgeOne 配置文件
├── package.json           # 项目依赖
├── README.md              # 项目说明
└── .github/workflows/
    └── rss-cron.yml       # GitHub Actions 定时抓取
```

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（需要 EdgeOne CLI）
pnpm dev

# 部署
pnpm deploy
```

## 常见问题

### 1. 添加订阅源后数据不更新

检查 API_KEY 是否正确配置在 EdgeOne 控制台环境变量中。

### 2. SSE 显示未连接

SSE 连接可能受网络环境影响，刷新页面后会自动重连。

### 3. 抓取失败

- 检查 RSS 源是否可访问
- 检查是否触发了速率限制

### 4. 数据丢失

数据存储在 Blob Storage 中，只要不删除项目数据会一直保留。

## 部署预览

- **前端**: https://rss-feed.edgeone.cool/
- **测试面板**: https://rss-feed.edgeone.cool/test-api.html
- **API**: https://rss-feed.edgeone.cool/api/health

## License

MIT