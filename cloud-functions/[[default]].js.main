import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import { getStore } from "@edgeone/pages-blob";

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'RSS-EdgeOne/1.0' },
  customFetch: async (url) => {
    for (let i = 0; i < 2; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`);
        return res;
      } catch (e) {
        if (i >= 1) throw e;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
});

async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    return { feed, items: parsed.items || [] };
  } catch (error) {
    return { feed, error: error.message, items: [] };
  }
}

// ==================== Rate Limiting ====================
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  // 如果没有代理头，使用一个随机标识（基于 user-agent 的哈希）
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `ua-${Math.abs(hashCode(userAgent))}`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// ==================== Blob Storage ====================
const STORE_NAME = 'rss-data';
let blobStore = null;
let sseClients = new Set();

async function getBlobStore() {
  if (!blobStore) {
    blobStore = getStore(STORE_NAME);
  }
  return blobStore;
}

// ==================== SSE 客户端管理 ====================
function addSSEClient(writer) {
  sseClients.add(writer);
}

function removeSSEClient(writer) {
  sseClients.delete(writer);
}

async function broadcastToClients(data, eventType = 'message') {
  const encoder = new TextEncoder();
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoded = encoder.encode(message);

  for (const writer of sseClients) {
    try {
      await writer.write(encoded);
    } catch {
      sseClients.delete(writer);
    }
  }
}

// ==================== 数据操作 ====================

async function getFeeds() {
  try {
    const store = await getBlobStore();
    const data = await store.get('feeds.json', { type: 'json' });
    return data || [];
  } catch { return []; }
}

async function saveFeeds(feeds) {
  const store = await getBlobStore();
  await store.setJSON('feeds.json', feeds);
}

async function getLastCheck() {
  try {
    const store = await getBlobStore();
    return await store.get('last-check.json', { type: 'json' });
  } catch { return null; }
}

async function saveLastCheck(data) {
  const store = await getBlobStore();
  await store.setJSON('last-check.json', data);
}

async function getSettings() {
  try {
    const store = await getBlobStore();
    return await store.get('settings.json', { type: 'json' }) || { timeRangeHours: 24 };
  } catch { return { timeRangeHours: 24 }; }
}

async function saveSettings(settings) {
  const store = await getBlobStore();
  await store.setJSON('settings.json', settings);
}

// ==================== RSS 解析 ====================

async function fetchAllFeeds() {
  const feeds = await getFeeds();
  const settings = await getSettings();
  const newArticles = [];
  const errors = [];
  const now = new Date();
  const timeRangeHours = settings.timeRangeHours || 24;
  const rangeStart = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1000);

  const CONCURRENCY = 5;
  const results = [];
  for (let i = 0; i < feeds.length; i += CONCURRENCY) {
    const batch = feeds.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(feed => fetchFeed(feed)));
    results.push(...batchResults);
  }

  for (const result of results) {
    if (result.error) {
      errors.push({ url: result.feed.url, error: result.error });
      continue;
    }
    for (const item of result.items) {
      if (!item.link) continue;
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      if (pubDate < rangeStart) continue;

      newArticles.push({
        id: uuidv4(),
        title: item.title || '无标题',
        link: item.link,
        pubDate: pubDate.toISOString(),
        author: item.creator || item.author || '',
        feedTitle: result.feed.title || result.title || result.feed.url,
        feedUrl: result.feed.url
      });
    }
  }

  newArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // 获取上次检查的文章链接，用于过滤新文章
  const lastCheck = await getLastCheck();
  const existingLinks = new Set((lastCheck?.articles || []).map(a => a.link));
  const trulyNewArticles = newArticles.filter(a => !existingLinks.has(a.link));

  const checkResult = {
    timestamp: now.toISOString(),
    totalArticles: newArticles.length,
    timeRangeHours,
    articles: newArticles,
    errors: errors.length > 0 ? errors : undefined
  };
  await saveLastCheck(checkResult);

  // 推送新文章到 SSE 客户端
  if (trulyNewArticles.length > 0) {
    await broadcastToClients({
      type: 'new-articles',
      count: trulyNewArticles.length,
      articles: trulyNewArticles
    }, 'new-articles');
  }

  return checkResult;
}

// ==================== 工具函数 ====================

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch { return false; }
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

function getCorsHeaders(origin, allowedOrigins) {
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return { 'Access-Control-Allow-Origin': origin || '*' };
  }
  return { 'Access-Control-Allow-Origin': '*' };
}

// ==================== 认证辅助函数 ====================
function requireAuth(context, url, corsHeaders, adminApiKey) {
  const providedKey = context.request.headers.get('x-api-key') || url.searchParams.get('api_key');
  if (!providedKey) {
    return { error: new Response(JSON.stringify({ error: '缺少 API Key' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }) };
  }
  if (providedKey !== adminApiKey) {
    return { error: new Response(JSON.stringify({ error: 'API Key 无效' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }) };
  }
  return { valid: true };
}

// ==================== 请求处理 ====================

export async function onRequest(context) {
  const requestId = generateRequestId();
  const url = new URL(context.request.url);
  const path = url.pathname;
  const method = context.request.method;
  const origin = context.request.headers.get('origin');

  // 验证 API_KEY 环境变量
  if (!context.env.API_KEY) {
    return new Response(JSON.stringify({ error: 'API_KEY 环境变量未配置' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const ADMIN_API_KEY = context.env.API_KEY;
  const allowedOrigins = (context.env.ALLOWED_ORIGINS || '*').split(',').map(o => o.trim());

  const corsHeaders = getCorsHeaders(origin, allowedOrigins);

  // Rate limiting (skip for SSE and health check)
  if (!path.startsWith('/ws') && !path.startsWith('/sse') && path !== '/api/health') {
    const clientIP = getClientIP(context.request);
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders, 'Retry-After': '60' }
      });
    }
  }

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
      }
    });
  }

  let body = {};
  if (method === 'POST' || method === 'PUT') {
    try {
      const text = await context.request.text();
      body = text ? JSON.parse(text) : {};
    } catch { body = {}; }
  }

  try {
    const CACHE_CONTROL = 'public, max-age=60, s-maxage=60';

    // 首页
    if (path === '/' && method === 'GET') {
      const accept = context.request.headers.get('Accept') || '';
      if (accept.includes('text/html')) {
        return new Response(null, { status: 404 });
      }
      return new Response(JSON.stringify({
        name: 'RSS EdgeOne API',
        version: '4.0.0',
        storage: 'Blob Storage',
        realtime: 'SSE 实时推送 /ws',
        endpoints: [
          'GET  /                 - API 信息',
          'GET  /api/feeds        - 获取订阅源列表',
          'POST /api/feeds       - 添加订阅源 (需认证)',
          'DELETE /api/feeds/:id - 删除订阅源 (需认证)',
          'GET  /api/articles    - 获取所有文章',
          'GET  /api/latest      - 获取最新文章',
          'POST /api/check       - 触���检查 (需认证)',
          'GET  /api/settings    - 获取设置',
          'PUT  /api/settings    - 更新设置 (需认证)',
          'GET  /ws              - SSE 实时推送'
        ]
      }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': CACHE_CONTROL, ...corsHeaders } });
    }

    // 健康检查
    if (path === '/api/health' && method === 'GET') {
      const settings = await getSettings();
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), settings, storage: 'blob' }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...corsHeaders }
      });
    }

    // 获取订阅源列表 (不缓存)
    if (path === '/api/feeds' && method === 'GET') {
      const feeds = await getFeeds();
      return new Response(JSON.stringify(feeds), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...corsHeaders } });
    }

    // 添加订阅源
    if (path === '/api/feeds' && method === 'POST') {
      const auth = requireAuth(context, url, corsHeaders, ADMIN_API_KEY);
      if (auth.error) return auth.error;

      const { url: feedUrl, title } = body;

      if (!feedUrl || typeof feedUrl !== 'string') {
        return new Response(JSON.stringify({ error: '缺少 url 参数' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      if (feedUrl.length > 2048) {
        return new Response(JSON.stringify({ error: 'URL 过长' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      if (!isValidUrl(feedUrl)) {
        return new Response(JSON.stringify({ error: '无效的 URL 格式' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const feeds = await getFeeds();
      if (feeds.some(f => f.url === feedUrl)) {
        return new Response(JSON.stringify({ error: '该订阅源已存在' }), { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const newFeed = { id: uuidv4(), url: feedUrl, title: title?.trim() || '', createdAt: new Date().toISOString() };
      feeds.push(newFeed);
      await saveFeeds(feeds);

      return new Response(JSON.stringify(newFeed), { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // 删除订阅源
    if (path.startsWith('/api/feeds/') && method === 'DELETE') {
      const auth = requireAuth(context, url, corsHeaders, ADMIN_API_KEY);
      if (auth.error) return auth.error;

      const id = path.split('/').pop();
      const feeds = await getFeeds();
      const filtered = feeds.filter(f => f.id !== id);

      if (filtered.length === feeds.length) {
        return new Response(JSON.stringify({ error: '订阅源不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      await saveFeeds(filtered);
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // 获取文章列表 (不缓存)
    if (path === '/api/articles' && method === 'GET') {
      const lastCheck = await getLastCheck();
      return new Response(JSON.stringify(lastCheck?.articles || []), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...corsHeaders } });
    }

    // 获取最新文章 (不缓存)
    if (path === '/api/latest' && method === 'GET') {
      const lastCheck = await getLastCheck();
      const since = url.searchParams.get('since');
      if (!since) {
        return new Response(JSON.stringify(lastCheck?.articles || []), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...corsHeaders } });
      }
      const sinceDate = new Date(since);
      if (!isValidDate(sinceDate)) {
        return new Response(JSON.stringify({ error: '无效的 since 参数' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      const newArticles = (lastCheck?.articles || []).filter(a => new Date(a.pubDate) > sinceDate);
      return new Response(JSON.stringify(newArticles), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...corsHeaders } });
    }

    // 手动触发检查
    if (path === '/api/check' && method === 'POST') {
      const auth = requireAuth(context, url, corsHeaders, ADMIN_API_KEY);
      if (auth.error) return auth.error;

      const result = await fetchAllFeeds();
      return new Response(JSON.stringify({ success: true, ...result }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // 获取设置 (不缓存)
    if (path === '/api/settings' && method === 'GET') {
      const settings = await getSettings();
      return new Response(JSON.stringify(settings), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...corsHeaders } });
    }

    // 更新设置
    if (path === '/api/settings' && method === 'PUT') {
      const auth = requireAuth(context, url, corsHeaders, ADMIN_API_KEY);
      if (auth.error) return auth.error;

      const { timeRangeHours } = body;
      const settings = await getSettings();

      if (timeRangeHours !== undefined) {
        const hours = Number(timeRangeHours);
        if (!Number.isInteger(hours) || hours < 1 || hours > 168) {
          return new Response(JSON.stringify({ error: 'timeRangeHours 必须是 1-168 之间的整数' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        settings.timeRangeHours = hours;
      }

      await saveSettings(settings);
      return new Response(JSON.stringify(settings), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // SSE 端点
    if ((path === '/ws' || path === '/sse') && method === 'GET') {
      const accept = context.request.headers.get('Accept') || '';
      if (!accept.includes('text/event-stream') && !accept.includes('*/*')) {
        return new Response('Expected text/event-stream', { status: 406 });
      }

      const encoder = new TextEncoder();
      let writer;

      const stream = new ReadableStream({
        async start(controller) {
          writer = controller;
          addSSEClient(writer);

          // 发送连接成功消息
          const lastCheck = await getLastCheck();
          const connectMsg = `event: connected\ndata: ${JSON.stringify({
            type: 'connected',
            message: 'RSS SSE connected',
            articles: lastCheck?.articles || [],
            timestamp: lastCheck?.timestamp
          })}\n\n`;
          controller.enqueue(encoder.encode(connectMsg));

          // 发送初始文章数据
          if (lastCheck?.articles?.length > 0) {
            const initMsg = `event: init\ndata: ${JSON.stringify({
              articles: lastCheck.articles,
              total: lastCheck.totalArticles
            })}\n\n`;
            controller.enqueue(encoder.encode(initMsg));
          }

          const heartbeat = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(': heartbeat\n\n'));
            } catch {
              clearInterval(heartbeat);
            }
          }, 30000);

          context.waitUntil(
            (async () => {
              try {
                await context.request.signal.aborted;
              } catch {}
            })().finally(() => {
              clearInterval(heartbeat);
              removeSSEClient(writer);
              try { controller.close(); } catch {}
            })
          );
        }
      });

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...corsHeaders,
          'X-Accel-Buffering': 'no'
        }
      });
    }

    return new Response(JSON.stringify({ error: '端点不存在', requestId }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (err) {
    console.error(`[${requestId}] Error:`, err.message);
    const errorMsg = err.message || '服务器内部错误';
    return new Response(JSON.stringify({ error: errorMsg, requestId }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}