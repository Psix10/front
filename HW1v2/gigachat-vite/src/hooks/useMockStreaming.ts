
import { useState, useRef, useCallback } from 'react';
import { createMockReadableStream } from '../utils/mockStream';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MockStreamingOptions = {
  /** Задержка между токенами (мс). По умолчанию 40 */
  chunkDelayMs?: number;
  /** Начальная задержка перед первым токеном (мс). По умолчанию 600 */
  initialDelayMs?: number;
  /** Дросселинг UI-обновлений (мс). 0 = без дросселинга */
  throttleMs?: number;
  /** Вызывается при получении каждого нового фрагмента */
  onChunk?: (chunk: string) => void;
  /** Вызывается когда стрим завершён, передаёт полный текст */
  onComplete?: (fullText: string) => void;
  /** Вызывается при ошибке */
  onError?: (error: Error) => void;
};

export type UseMockStreamingReturn = {
  /** Накопленный текст (обновляется в реальном времени) */
  data: string;
  /** true пока идёт стрим */
  isStreaming: boolean;
  /** Ошибка, если возникла */
  error: Error | null;
  /** Количество полученных чанков */
  chunkCount: number;
  /** Запустить стрим с указанным текстом */
  startMockStream: (text: string) => void;
  /** Прервать текущий стрим */
  abort: () => void;
  /** Сбросить состояние */
  reset: () => void;
};

// Hook 

export function useMockStreaming(options: MockStreamingOptions = {}): UseMockStreamingReturn {
  const {
    chunkDelayMs = 40,
    initialDelayMs = 600,
    throttleMs = 0,
    onChunk,
    onComplete,
    onError,
  } = options;

  // State 
  const [data, setData] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [chunkCount, setChunkCount] = useState(0);

  // Refs 
  const abortRef = useRef(false);
  const decoder = useRef(new TextDecoder());
  const throttleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingData = useRef('');

  // Throttled flush 
  const scheduleFlush = useCallback((newData: string) => {
    pendingData.current = newData;

    if (!throttleMs) {
      setData(newData);
      return;
    }

    if (throttleTimer.current === null) {
      throttleTimer.current = setTimeout(() => {
        throttleTimer.current = null;
        setData(pendingData.current);
      }, throttleMs);
    }
  }, [throttleMs]);

  // Core stream processor 
  const processStream = useCallback(async (stream: ReadableStream<Uint8Array>) => {
    const reader = stream.getReader();
    let accumulated = '';
    let count = 0;

    try {
      while (true) {
        if (abortRef.current) {
          reader.cancel();
          break;
        }

        const { done, value } = await reader.read();

        if (done) {
          // Финальный flush, чтобы дропнуть pending throttle
          if (throttleTimer.current !== null) {
            clearTimeout(throttleTimer.current);
            throttleTimer.current = null;
          }
          setData(accumulated);

          onComplete?.(accumulated);
          break;
        }

        const chunk = decoder.current.decode(value, { stream: true });
        accumulated += chunk;
        count++;

        scheduleFlush(accumulated);
        setChunkCount(count);
        onChunk?.(chunk);
      }
    } catch (err) {
      if (!abortRef.current) {
        const e = err as Error;
        setError(e);
        onError?.(e);
      }
    } finally {
      reader.releaseLock();
    }
  }, [scheduleFlush, onChunk, onComplete, onError]);

  //  Public API 

  const startMockStream = useCallback((text: string) => {
    // Сброс предыдущего состояния
    abortRef.current = false;
    if (throttleTimer.current !== null) {
      clearTimeout(throttleTimer.current);
      throttleTimer.current = null;
    }

    setData('');
    setError(null);
    setChunkCount(0);
    setIsStreaming(true);

    const stream = createMockReadableStream(text, chunkDelayMs, initialDelayMs);

    processStream(stream).finally(() => {
      setIsStreaming(false);
    });
  }, [processStream, chunkDelayMs, initialDelayMs]);

  const abort = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    if (throttleTimer.current !== null) {
      clearTimeout(throttleTimer.current);
      throttleTimer.current = null;
    }
    setData('');
    setError(null);
    setChunkCount(0);
    setIsStreaming(false);
  }, []);

  return { data, isStreaming, error, chunkCount, startMockStream, abort, reset };
}
