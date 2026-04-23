/**
 * Прокси-сервер для GigaChat API
 *
 * Запуск: node server.mjs
 * Порт: 3001
 */

import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import multer from 'multer';
import undiciPkg from 'undici';

const {
  Agent,
  fetch: undiciFetch,
  FormData,
} = undiciPkg;

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const CHAT_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
const FILES_URL = 'https://gigachat.devices.sberbank.ru/api/v1/files';
const upload = multer({ storage: multer.memoryStorage() });
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

app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('[file upload] request received');
    console.log('[file upload] body:', req.body);
    console.log(
      '[file upload] file:',
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : null
    );

    const { credentials, scope, purpose = 'general' } = req.body;

    if (!credentials || !scope) {
      return res.status(400).json({ error: 'credentials and scope required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'file is required' });
    }

    const token = await getAccessToken(credentials, scope);

    const form = new FormData();
    const blob = new Blob(
      [req.file.buffer],
      {
        type: req.file.mimetype || 'application/octet-stream',
      }
    );

    form.append('file', blob, 'upload.png');
    form.append('purpose', purpose);

    console.log('[file upload] sending to gigachat', {
      originalname: req.file.originalname,
      sentAsName: 'upload.png',
      mimeType: req.file.mimetype,
      purpose,
    });

    const apiRes = await undiciFetch(FILES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: form,
      dispatcher: agent,
    });

    console.log('[file upload] gigachat status:', apiRes.status);

    const rawText = await apiRes.text();
    console.log('[file upload] gigachat raw response:', rawText);

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: rawText });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(500).json({ error: `Некорректный JSON от GigaChat Files API: ${rawText}` });
    }

    console.log('[file upload] gigachat response json:', data);
    res.json(data);
  } catch (err) {
    console.error('[file upload error]', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n  🚀 GigaChat Proxy running on http://localhost:${PORT}`);
  console.log(`     POST /api/token        — получение токена`);
  console.log(`     POST /api/chat         — обычный запрос`);
  console.log(`     POST /api/chat/stream  — стриминг (SSE)`);
  console.log(`     GET  /api/health       — проверка\n`);
});
