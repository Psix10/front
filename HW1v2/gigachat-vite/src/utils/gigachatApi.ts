/**
 * GigaChat API Integration (через прокси-сервер)
 *
 * Все запросы идут через локальный прокси http://localhost:3001/api/*
 * Прокси решает проблемы CORS и TLS-сертификатов Минцифры.
 */

import {
  ChatSettings,
  GigaChatMessage,
  GigaChatResponse,
  Message,
  GigaChatFileUploadResponse,
} from '../types';

// Proxy Base URL 

const API_BASE = 'http://localhost:3001/api';

// Token Management

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getAccessToken(credentials: string, scope: string): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const response = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credentials, scope }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(`Ошибка авторизации: ${data.error}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = data.expires_at;
  return cachedToken!;
}


function buildMessages(messages: Message[], systemPrompt: string): GigaChatMessage[] {
  const apiMessages: GigaChatMessage[] = [];

  if (systemPrompt.trim()) {
    apiMessages.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of messages) {
    if (msg.role === 'system') continue;

    const attachmentIds = msg.attachments
      ?.map(att => att.id)
      .filter((id): id is string => Boolean(id));

    apiMessages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      ...(attachmentIds && attachmentIds.length > 0 ? { attachments: attachmentIds } : {}),
    });
  }

  return apiMessages;
}

// Streaming Request (через прокси)

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

/**
 * Стриминг через прокси — POST /api/chat/stream
 * Credentials передаются в теле запроса, прокси сам получает токен.
 */
export async function sendStreamingMessage(
  credentials: string,
  scope: string,
  messages: Message[],
  settings: ChatSettings,
  callbacks: StreamCallbacks,
  abortSignal?: AbortSignal
): Promise<void> {
  const apiMessages = buildMessages(messages, settings.systemPrompt);

  const body = {
    credentials,
    scope,
    model: settings.model,
    messages: apiMessages,
    temperature: settings.temperature,
    top_p: settings.topP,
    max_tokens: settings.maxTokens,
    repetition_penalty: settings.repetitionPenalty,
    stream: true,
    function_call: 'auto',
  };

  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: abortSignal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(`GigaChat API: ${data.error}`);
  }

  if (!response.body) {
    throw new Error('ReadableStream недоступен');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onComplete(accumulated);
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed === 'data: [DONE]') {
          callbacks.onComplete(accumulated);
          return;
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              callbacks.onChunk(content);
            }
          } catch {
            // Пропускаем невалидный JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

//  Non-Streaming Request (Fallback)

export async function sendMessage(
  credentials: string,
  scope: string,
  messages: Message[],
  settings: ChatSettings,
  abortSignal?: AbortSignal
): Promise<string> {
  const apiMessages = buildMessages(messages, settings.systemPrompt);

  const body = {
    credentials,
    scope,
    model: settings.model,
    messages: apiMessages,
    temperature: settings.temperature,
    top_p: settings.topP,
    max_tokens: settings.maxTokens,
    repetition_penalty: settings.repetitionPenalty,
    stream: false,
    function_call: 'auto',
  };

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: abortSignal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(`GigaChat API: ${data.error}`);
  }

  const data: GigaChatResponse = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

/**
 * Сброс кэшированного токена
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}


export async function uploadFile(
  file: File,
  credentials: string,
  scope: string
): Promise<GigaChatFileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('credentials', credentials);
  formData.append('scope', scope);

  console.log('[uploadFile] start', {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  const response = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    body: formData,
  });

  console.log('[uploadFile] response status', response.status);

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    console.error('[uploadFile] failed', data);
    throw new Error(`Ошибка загрузки файла: ${data.error}`);
  }

  const data = await response.json();
  console.log('[uploadFile] success', data);

  return data;
}