/**
 * mockStream.ts
 * Создаёт ReadableStream, который выдаёт текст по словам (или символам),
 * имитируя реальный стриминг ответа от LLM.
 */

const encoder = new TextEncoder();

/**
 * Разбивает текст на токены (слова + пробел / знаки).
 * Сохраняет пробелы как часть предыдущего токена для плавного стриминга.
 */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const regex = /\S+\s*/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
}

/**
 * 
 *
 * @param text           Полный текст, который нужно отстримить
 * @param chunkDelayMs   Задержка между токенами в мс (по умолчанию 40)
 * @param initialDelayMs Начальная задержка перед первым токеном в мс (по умолчанию 600)
 */
export function createMockReadableStream(
  text: string,
  chunkDelayMs = 40,
  initialDelayMs = 600
): ReadableStream<Uint8Array> {
  const tokens = tokenize(text);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      await sleep(initialDelayMs);

      for (const token of tokens) {
        if (controller.desiredSize === null) break;

        controller.enqueue(encoder.encode(token));
        await sleep(chunkDelayMs);
      }

      controller.close();
    },

    cancel() {
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock Response Pool 

/**
 * Набор разнообразных моковых ответов на русском языке.
 * Каждый использует Markdown-разметку, чтобы протестировать
 * рендеринг в компоненте Message.
 */
export const MOCK_STREAM_RESPONSES = [
  `Отличный вопрос! Давайте разберёмся подробнее.

В контексте вашего запроса стоит выделить несколько ключевых аспектов:

**1. Архитектурные решения**
Выбор подхода напрямую влияет на масштабируемость системы. Стоит рассмотреть микросервисную архитектуру.

**2. Производительность**
- Кэширование снижает нагрузку на БД
- Индексы ускоряют запросы
- Connection pooling оптимизирует соединения

> Помни: преждевременная оптимизация — корень всех зол (Кнут).`,

  `Понял вас. Вот пошаговое решение:

**Шаг 1 — Проверь конфигурацию**
\`\`\`bash
cat .env | grep DATABASE_URL
\`\`\`

**Шаг 2 — Запусти тесты**
\`\`\`bash
pytest tests/ -v --tb=short
\`\`\`

**Шаг 3 — Смотри логи**
\`\`\`bash
docker logs my_container --tail 100 -f
\`\`\`

Если ошибки продолжаются — скинь stack trace, разберёмся вместе.`,

  `Это интересный подход. **Важно учитывать** следующее:

| Критерий | REST | GraphQL |
|----------|------|---------|
| Простота | ✅ Высокая | ⚠️ Средняя |
| Гибкость | ⚠️ Средняя | ✅ Высокая |
| Кэширование | ✅ Нативное | ⚠️ Сложнее |
| Over-fetching | ❌ Есть | ✅ Нет |

Для вашего кейса я бы рекомендовал **REST** на старте с переходом на GraphQL при росте сложности UI.`,

  `Спасибо за уточнение! Вот несколько идей для улучшения кода:

\`\`\`typescript
// Было: императивный стиль
let result = [];
for (let i = 0; i < items.length; i++) {
  if (items[i].active) {
    result.push(items[i].name);
  }
}

// Стало: функциональный стиль
const result = items
  .filter(item => item.active)
  .map(item => item.name);
\`\`\`

Функциональный стиль — **читабельнее, лаконичнее, тестируемее**.

Также рекомендую:
- \`const\` вместо \`let\` где возможно
- Деструктуризация для ясности
- Именованные функции вместо анонимных для стектрейсов`,

  `Рад помочь разобраться! Вот ответ на ваш вопрос.

React хуки позволяют использовать state и lifecycle в функциональных компонентах:

\`\`\`tsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Счётчик: \${count}\`;
  }, [count]);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Нажато: {count}
    </button>
  );
}
\`\`\`

**Правила хуков:**
1. Вызывай только на верхнем уровне
2. Только в React-компонентах или кастомных хуках
3. Используй \`eslint-plugin-react-hooks\` для проверки`,
];

let mockResponseIndex = 0;

/** Возвращает следующий моковый ответ по кругу */
export function getNextMockResponse(): string {
  const response = MOCK_STREAM_RESPONSES[mockResponseIndex % MOCK_STREAM_RESPONSES.length];
  mockResponseIndex++;
  return response;
}
