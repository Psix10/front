/**
 * Прокси-сервер для GigaChat API
 *
 * Зачем нужен:
 * 1. CORS — GigaChat API не разрешает запросы из браузера напрямую
 * 2. TLS — сертификаты Минцифры не распознаются браузером (rejectUnauthorized: false)
 * 3. Безопасность — credentials проксируются, а не хранятся в браузере
 *
 * Запуск: node server.mjs
 * Порт: 3001
 */

import express from 'express';
import cors from 'cors';
import { Agent, fetch as undiciFetch } from 'undici';

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const CHAT_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';

// Agent с отключённой проверкой сертификата (Минцифры)
const agent = new Agent({
  connect: { rejectUnauthorized: false },
});

// Token cache 

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken(credentials, scope) {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const rquid = crypto.randomUUID();

  const res = await undiciFetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': rquid,
      'Authorization': `Basic ${credentials}`,
    },
    body: `scope=${scope}`,
    dispatcher: agent,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth error (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = data.expires_at;
  console.log(`[token] Получен новый токен, expires_at: ${new Date(tokenExpiresAt).toISOString()}`);
  return cachedToken;
}

// POST /api/token — получение токена

app.post('/api/token', async (req, res) => {
  try {
    const { credentials, scope } = req.body;
    if (!credentials || !scope) {
      return res.status(400).json({ error: 'credentials and scope required' });
    }
    const token = await getAccessToken(credentials, scope);
    res.json({ access_token: token, expires_at: tokenExpiresAt });
  } catch (err) {
    console.error('[token error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

//  POST /api/chat — обычный (не стриминг) запрос

app.post('/api/chat', async (req, res) => {
  try {
    const { credentials, scope, ...chatBody } = req.body;
    const token = await getAccessToken(credentials, scope);

    const apiRes = await undiciFetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ ...chatBody, stream: false }),
      dispatcher: agent,
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return res.status(apiRes.status).json({ error: text });
    }

    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    console.error('[chat error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/stream — SSE стриминг

app.post('/api/chat/stream', async (req, res) => {
  try {
    const { credentials, scope, ...chatBody } = req.body;
    const token = await getAccessToken(credentials, scope);

    const apiRes = await undiciFetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ ...chatBody, stream: true }),
      dispatcher: agent,
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return res.status(apiRes.status).json({ error: text });
    }

    // SSE-заголовки
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Пробрасываем поток от GigaChat к клиенту
    const reader = apiRes.body.getReader();
    const decoder = new TextDecoder();

    req.on('close', () => {
      reader.cancel();
    });

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
    } catch (err) {
      console.error('[stream pump error]', err.message);
      res.end();
    }
  } catch (err) {
    console.error('[stream error]', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.end();
    }
  }
});

// Health check

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasToken: !!cachedToken });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n  🚀 GigaChat Proxy running on http://localhost:${PORT}`);
  console.log(`     POST /api/token        — получение токена`);
  console.log(`     POST /api/chat         — обычный запрос`);
  console.log(`     POST /api/chat/stream  — стриминг (SSE)`);
  console.log(`     GET  /api/health       — проверка\n`);
});
