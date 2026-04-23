/**
 * useGigaChat — хук для интеграции с GigaChat API
 *
 * При реальных credentials — запросы идут через прокси к GigaChat API (stream + REST fallback).
 * При демо-режиме (credentials = 'demo_base64_credentials_mock') — моковый стриминг.
 */

import { useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { Message } from '../types';
import { sendStreamingMessage, sendMessage, uploadFile } from '../utils/gigachatApi';
import { createMockReadableStream, getNextMockResponse } from '../utils/mockStream';

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useGigaChat() {
  const store = useChatStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const isDemo = store.authCredentials?.credentials === 'demo_base64_credentials_mock';

  const sendUserMessage = useCallback(async (chatId: string, text: string, files: File[] = []) => {
    const {
      addMessage,
      updateMessageContent,
      setStreaming,
      setError,
      autoRenameChat,
      authCredentials,
      settings,
      chats,
    } = useChatStore.getState();
    let attachments: Message['attachments'] = [];
    let aiMsgId: string | null = null;

    try {
      if (!isDemo && authCredentials && files.length > 0) {
        const { credentials, scope } = authCredentials;

        console.log('[sendUserMessage] uploading files:', files);

        const uploadedFiles = await Promise.all(
          files.map(file => uploadFile(file, credentials, scope))
        );

        console.log('[sendUserMessage] uploadedFiles:', uploadedFiles);

        attachments = uploadedFiles.map((uploaded, i) => ({
          id: uploaded.id,
          name: files[i].name,
          mimeType: files[i].type,
          size: files[i].size,
          type: 'file' as const,
        }));
      } else if (files.length > 0) {
        console.log('[sendUserMessage] files without upload (demo/no auth):', files);

        attachments = files.map(file => ({
          name: file.name,
          mimeType: file.type,
          size: file.size,
          type: 'file' as const,
        }));
      }

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: new Date(),
        attachments,
      };
      addMessage(chatId, userMsg);

    // Автогенерация названия по первому сообщению
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.messages.length === 0) {
      autoRenameChat(chatId, text);
    }

    // 2. Создаём пустое сообщение ассистента
    aiMsgId = generateId();
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    addMessage(chatId, aiMsg);
    setStreaming(true, aiMsgId);
    setError(null);

    // 3. Abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    
    if (isDemo || !authCredentials) {
        // Демо-режим: моковый стриминг
        const mockText = getNextMockResponse();
        const stream = createMockReadableStream(mockText, 35, 500);
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        try {
          while (true) {
            if (signal.aborted) {
              reader.cancel();
              break;
            }
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            updateMessageContent(chatId, aiMsgId, accumulated);
          }
        } finally {
          reader.releaseLock();
        }

        if (!signal.aborted) {
          updateMessageContent(chatId, aiMsgId, accumulated);
        }
      } else {
        // Реальный GigaChat API через прокси 
        const { credentials, scope } = authCredentials;

        // Получаем актуальные сообщения чата (без пустого AI-сообщения)
        const currentChat = useChatStore.getState().chats.find(c => c.id === chatId);
        const messagesForApi = currentChat?.messages.filter(m => m.id !== aiMsgId) ?? [];

        try {
          // Пробуем стриминг
          let accumulated = '';
          console.log('[sendUserMessage] messagesForApi:', messagesForApi);
          await sendStreamingMessage(
            credentials,
            scope,
            messagesForApi,
            settings,
            {
              onChunk: (chunk) => {
                accumulated += chunk;
                updateMessageContent(chatId, aiMsgId, accumulated);
              },
              onComplete: (fullText) => {
                updateMessageContent(chatId, aiMsgId, fullText);
              },
              onError: (err) => {
                throw err;
              },
            },
            signal
          );
        } catch (streamErr) {
          if (signal.aborted) throw streamErr;

          console.warn('Streaming не удался, пробуем обычный запрос:', streamErr);

          // Fallback на REST-запрос
          const content = await sendMessage(
            credentials,
            scope,
            messagesForApi,
            settings,
            signal
          );
          updateMessageContent(chatId, aiMsgId, content);
        }
      }
    } catch (err) {
      const isAborted =
        (err as Error).name === 'AbortError' ||
        abortControllerRef.current?.signal?.aborted === true;

      if (isAborted) {
        const currentContent = useChatStore.getState().chats
          .find(c => c.id === chatId)?.messages
          .find(m => m.id === aiMsgId)?.content ?? '';

        if (!currentContent) {
          updateMessageContent(chatId, aiMsgId, '*(генерация прервана)*');
        }
      } else {
        const errorMsg = (err as Error).message || 'Неизвестная ошибка';
        console.error('[sendUserMessage] error:', err);
        setError(errorMsg);
        updateMessageContent(chatId, aiMsgId, `⚠️ Ошибка: ${errorMsg}`);
      }
    } finally {
      setStreaming(false, null);
      abortControllerRef.current = null;
    }
  }, [isDemo]);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { sendUserMessage, abort };
}
