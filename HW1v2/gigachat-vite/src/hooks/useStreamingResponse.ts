import { useState, useRef, useCallback, useEffect } from 'react';


export type UseStreamingResponseOptions = {
  url: string;
  enabled?: boolean;               // Начать стрим автоматически
  method?: 'GET' | 'POST';
  body?: any;
  headers?: Record<string, string>;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  parseChunk?: (rawChunk: Uint8Array) => string; // Кастомный парсер

  throttleMs?: number;
  maxRetries?: number;
  retryBaseDelay?: number;
  useSSE?: boolean;
  cacheKey?: string;
};

export type StreamMetadata = {
  startTime: number | null;
  endTime: number | null;
  responseTime: string;
  chunkCount: number;
};

export type UseStreamingResponseReturn = {
  data: string;
  isStreaming: boolean;
  error: Error | null;
  streamedChunks: string[];
  metadata: StreamMetadata;
  abort: () => void;
  reset: () => void;
  startStream: () => void; // Для ручного запуска
};



const CACHE_PREFIX = 'useStreamingResponse:';

function readCache(key: string): string | null {
  try {
    return localStorage.getItem(CACHE_PREFIX + key);
  } catch {
    return null;
  }
}

function writeCache(key: string, value: string): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, value);
  } catch {
  }
}

// Hook

export const useStreamingResponse = (
  options: UseStreamingResponseOptions
): UseStreamingResponseReturn => {

  // Задача 1: State 
  const [data, setData] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamedChunks, setStreamedChunks] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<StreamMetadata>({
    startTime: null as number | null,
    endTime: null as number | null,
    responseTime: '',
    chunkCount: 0,
  });

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const decoderRef = useRef(new TextDecoder());

  // Доп: throttle ref
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<string>('');
  const pendingChunksRef = useRef<string[]>([]);

  //  Throttled state flush
  const flushThrottled = useCallback(() => {
    setData(pendingDataRef.current);
    setStreamedChunks([...pendingChunksRef.current]);
  }, []);

  const scheduleFlush = useCallback((newData: string, allChunks: string[]) => {
    pendingDataRef.current = newData;
    pendingChunksRef.current = allChunks;

    if (!options.throttleMs) {
      setData(newData);
      setStreamedChunks(allChunks);
      return;
    }

    if (throttleTimerRef.current === null) {
      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        flushThrottled();
      }, options.throttleMs);
    }
  }, [options.throttleMs, flushThrottled]);

  // Задача 3: processStream (ReadableStream) 
  const processStream = async (body: ReadableStream, startTime: number) => {
    const reader = body.getReader();
    let accumulatedText = '';
    let chunkIndex = 0;
    const localChunks: string[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          const endTime = Date.now();
          const responseTime = `${endTime - startTime}ms`;

          setMetadata(prev => ({
            ...prev,
            endTime,
            responseTime,
          }));

          options.onComplete?.(accumulatedText);
          break;
        }

        // Декодируем чанк
        const chunkText = options.parseChunk
          ? options.parseChunk(value)
          : decoderRef.current.decode(value, { stream: true });

        // Обновляем данные
        accumulatedText += chunkText;
        chunkIndex++;
        localChunks.push(chunkText);

        scheduleFlush(accumulatedText, [...localChunks]);
        setMetadata(prev => ({ ...prev, chunkCount: chunkIndex }));

        options.onChunk?.(chunkText);
      }
    } finally {
      reader.releaseLock();
    }
  };

  // Retry helper (exponential backoff)
  const sleep = (ms: number) =>
    new Promise<void>(resolve => setTimeout(resolve, ms));

  // Задача 2: startStream
  const startStream = useCallback(async () => {
    // Check cache first
    if (options.cacheKey) {
      const cached = readCache(options.cacheKey);
      if (cached) {
        setData(cached);
        setStreamedChunks([cached]);
        setMetadata(prev => ({ ...prev, chunkCount: 1, responseTime: '(cached)' }));
        options.onComplete?.(cached);
        return;
      }
    }

    const maxRetries = options.maxRetries ?? 0;
    const retryBaseDelay = options.retryBaseDelay ?? 500;

    let attempt = 0;

    while (true) {
      setIsStreaming(true);
      setError(null);
      setData('');
      setStreamedChunks([]);

      const startTime = Date.now();
      setMetadata(prev => ({ ...prev, startTime, chunkCount: 0 }));

      // Создаём новый AbortController для отмены
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(options.url, {
          method: options.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body available');
        }

        // Обработка ReadableStream
        await processStream(response.body, startTime);

        if (options.cacheKey && pendingDataRef.current) {
          writeCache(options.cacheKey, pendingDataRef.current);
        }

        break;

      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          console.log('Stream aborted by user');
          break; // Don't retry on user abort
        }

        const error = err as Error;

        if (attempt < maxRetries) {
          attempt++;
          const delay = retryBaseDelay * Math.pow(2, attempt - 1);
          console.warn(`Stream error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error.message);
          await sleep(delay);
          continue;
        }

        // Max retries exhausted
        setError(error);
        options.onError?.(error);
        break;

      } finally {
        setIsStreaming(false);
      }
    }
  }, [
    options.url,
    options.method,
    options.body,
    options.headers,
    options.cacheKey,
    options.maxRetries,
    options.retryBaseDelay,
    options.parseChunk,
    options.onChunk,
    options.onComplete,
    options.onError,
  ]);

  // Задача 4: SSE (EventSource) 
  const startSSEStream = useCallback(() => {
    if (options.cacheKey) {
      const cached = readCache(options.cacheKey);
      if (cached) {
        setData(cached);
        setStreamedChunks([cached]);
        setMetadata(prev => ({ ...prev, chunkCount: 1, responseTime: '(cached)' }));
        options.onComplete?.(cached);
        return;
      }
    }

    setIsStreaming(true);
    setError(null);
    setData('');

    const startTime = Date.now();
    setMetadata(prev => ({ ...prev, startTime, chunkCount: 0 }));

    const eventSource = new EventSource(options.url);
    let accumulatedText = '';
    let chunkIndex = 0;
    const localChunks: string[] = [];

    eventSource.onmessage = (event) => {
      const chunkText = event.data;

      // Проверка на завершающий сигнал
      if (chunkText === '[DONE]') {
        eventSource.close();
        setIsStreaming(false);

        const endTime = Date.now();
        setMetadata(prev => ({
          ...prev,
          endTime,
          responseTime: `${endTime - startTime}ms`,
        }));

        options.onComplete?.(accumulatedText);

        if (options.cacheKey && accumulatedText) {
          writeCache(options.cacheKey, accumulatedText);
        }
        return;
      }

      try {
        // Парсим JSON, если нужно
        const parsed = JSON.parse(chunkText);
        const content = parsed.choices?.[0]?.delta?.content || '';

        if (content) {
          accumulatedText += content;
          chunkIndex++;
          localChunks.push(content);

          scheduleFlush(accumulatedText, [...localChunks]);
          setMetadata(prev => ({ ...prev, chunkCount: chunkIndex }));
          options.onChunk?.(content);
        }
      } catch (e) {
        // Если не JSON, используем «как есть»
        accumulatedText += chunkText;
        chunkIndex++;
        localChunks.push(chunkText);

        scheduleFlush(accumulatedText, [...localChunks]);
        setMetadata(prev => ({ ...prev, chunkCount: chunkIndex }));
        options.onChunk?.(chunkText);
      }
    };

    eventSource.onerror = (err) => {
      eventSource.close();
      setIsStreaming(false);

      const error = new Error('SSE connection error');
      setError(error);
      options.onError?.(error);
    };

    // Сохраняем ссылку для возможности закрытия
    abortControllerRef.current = {
      abort: () => eventSource.close(),
    } as any;
  }, [
    options.url,
    options.cacheKey,
    options.onChunk,
    options.onComplete,
    options.onError,
    scheduleFlush,
  ]);

  // Задача 5: abort + reset
  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setData('');
    setStreamedChunks([]);
    setError(null);
    setMetadata({
      startTime: null,
      endTime: null,
      responseTime: '',
      chunkCount: 0,
    });
  }, []);

  // Задача 6: useEffect (автозапуск + cleanup)
  useEffect(() => {
    if (options.enabled) {
      if (options.useSSE) {
        startSSEStream();
      } else {
        startStream();
      }
    }

    // Cleanup при размонтировании
    return () => {
      abortControllerRef.current?.abort();
      if (throttleTimerRef.current !== null) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, [options.enabled, options.url]);

  return {
    data,
    isStreaming,
    error,
    streamedChunks,
    metadata,
    abort,
    reset,
    startStream: options.useSSE ? startSSEStream : startStream,
  };
};
