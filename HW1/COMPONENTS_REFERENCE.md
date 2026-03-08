# 📚 Справочник компонентов

## Основные компоненты (App Layer)

### App.tsx
**Путь**: `src/App.tsx`

Корневой компонент приложения. Рендерит `AuthGate` для управления состоянием аутентификации.

```tsx
import { AuthGate } from './app/AuthGate'

function App() {
  return <AuthGate />
}
```

### AuthGate.tsx
**Путь**: `src/app/AuthGate.tsx`

Компонент, который проверяет аутентификацию и либо показывает `AuthForm`, либо `AppLayout`.

**Props**: Нет

**Функции**:
- Проверка localStorage на наличие сохраненной аутентификации
- Управление темой через `useTheme`
- Переключение между AuthForm и AppLayout

### AppLayout.tsx
**Путь**: `src/app/AppLayout.tsx`

Основной лаяут приложения. Содержит Sidebar и ChatWindow.

**Props**:
```tsx
interface AppLayoutProps {
  theme: Theme
  onThemeChange?: (theme: Theme) => void
}
```

**Функции**:
- Управление активным чатом
- Управление состоянием сайдбара на мобильных
- Хранение сессий и настроек

---

## Компоненты Layout

### Sidebar.tsx
**Путь**: `src/components/layout/Sidebar/Sidebar.tsx`

Боковая панель с чатами и поиском.

**Props**:
```tsx
interface SidebarProps {
  chats: Chat[]
  activeId?: string
  onNewChat?: () => void
  onSelectChat?: (id: string) => void
  onEditChat?: (id: string) => void
  onDeleteChat?: (id: string) => void
  isOpen?: boolean
  onClose?: () => void
}
```

**Особенности**:
- Поиск по чатам с фильтрацией
- Адаптивность (скрывается на мобильных, появляется оверлей)
- Кнопка "Новый чат"

### ChatWindow.tsx
**Путь**: `src/components/layout/ChatWindow/ChatWindow.tsx`

Основная область чата с сообщениями, вводом и настройками.

**Props**:
```tsx
interface ChatWindowProps {
  session?: ChatSession
  settings: Settings
  onSettingsSave?: (settings: Settings) => void
  onMessageSend?: (message: string) => void
  isLoading?: boolean
  showTypingIndicator?: boolean
}
```

**Особенности**:
- Интегрирует MessageList, InputArea, EmptyState
- Модальная SettingsPanel
- Заголовок с названием чата

---

## Компоненты Chat

### ChatList.tsx
**Путь**: `src/components/chat/ChatList/ChatList.tsx`

Список чатов как контейнер для ChatItem.

**Props**:
```tsx
interface ChatListProps {
  chats: Chat[]
  activeId?: string
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}
```

### ChatItem.tsx
**Путь**: `src/components/chat/ChatItem/ChatItem.tsx`

Элемент чата с названием, датой и кнопками.

**Props**:
```tsx
interface ChatItemProps extends Chat {
  isActive?: boolean
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}
```

**Особенности**:
- text-overflow: ellipsis для длинных названий
- Форматирование даты (Today/Yesterday/Date)
- Кнопки редактирования (hover-only)
- Выделение активного чата

### MessageList.tsx
**Путь**: `src/components/chat/MessageList/MessageList.tsx`

Список сообщений с автопрокруткой вниз.

**Props**:
```tsx
interface MessageListProps {
  messages: Message[]
  showTypingIndicator?: boolean
}
```

**Особенности**:
- Автоматическая прокрутка к новым сообщениям
- Поддержка TypingIndicator

### Message.tsx
**Путь**: `src/components/chat/Message/Message.tsx`

Компонент одного сообщения с Markdown поддержкой.

**Props**:
```tsx
interface MessageProps extends Message {
  variant?: 'user' | 'assistant'
}
```

**Особенности**:
- react-markdown для Markdown
- Кнопка Copy (появляется при hover)
- Разные стили для user/assistant
- Аватар 🤖 для сообщений assistant

### InputArea.tsx
**Путь**: `src/components/chat/InputArea/InputArea.tsx`

Поле ввода сообщение с автоподстройкой высоты.

**Props**:
```tsx
interface InputAreaProps {
  onSend?: (message: string) => void
  isLoading?: boolean
}
```

**Особенности**:
- Многострочный textarea (макс 5 строк)
- Автоподстройка высоты
- Send на Enter, Shift+Enter для переноса
- Валидация (ошибка при пустом сообщении)
- Кнопка прикрепления (заглушка)
- Кнопка Stop (заглушка)

### TypingIndicator.tsx
**Путь**: `src/components/chat/TypingIndicator/TypingIndicator.tsx`

Анимация "печатает..." (три пульсирующие точки).

**Props**:
```tsx
interface TypingIndicatorProps {
  isVisible?: boolean
}
```

**Особенности**:
- CSS animation для пульсации
- Легко управляется через isVisible

### EmptyState.tsx
**Путь**: `src/components/chat/EmptyState/EmptyState.tsx`

Заглушка для пустого чата.

**Props**:
```tsx
interface EmptyStateProps {
  title?: string
  description?: string
}
```

**Особенности**:
- Иконка 💬
- Кастомизируемый текст
- Центровано в области чата

---

## Компоненты Settings

### SettingsPanel.tsx
**Путь**: `src/components/settings/SettingsPanel/SettingsPanel.tsx`

Панель настроек как drawer/modal.

**Props**:
```tsx
interface SettingsPanelProps {
  settings: Settings
  onSave?: (settings: Settings) => void
  onReset?: () => void
  onClose?: () => void
}
```

**Особенности**:
- Select для выбора модели
- Слайдеры для Temperature и Top-P
- Input для Max Tokens
- Textarea для System Prompt
- Checkbox для переключения темы
- Валидация System Prompt
- Save и Reset кнопки

---

## Компоненты Auth

### AuthForm.tsx
**Путь**: `src/components/auth/AuthForm/AuthForm.tsx`

Форма входа с валидацией.

**Props**:
```tsx
interface AuthFormProps {
  onSubmit?: (credentials: string, scope: Scope) => void
}
```

**Особенности**:
- Input для Base64-credentials (type="password")
- Radio-кнопки для Scope выбора
- Валидация Base64 формата
- Красивый дизайн с градиентом
- Ошибка сообщения

---

## Компоненты Feedback

### ErrorMessage.tsx
**Путь**: `src/components/feedback/ErrorMessage/ErrorMessage.tsx`

Компонент ошибки.

**Props**:
```tsx
interface ErrorMessageProps {
  message: string
  icon?: string
}
```

**Особенности**:
- Красный фон с иконкой
- Inline-блок форматирование
- Кастомизируемая иконка (по умолчанию ❌)

---

## Hooks

### useTheme.ts
**Путь**: `src/hooks/useTheme.ts`

Hook для управления темой приложения.

```tsx
const { theme, toggleTheme, setTheme } = useTheme()
```

**Возвращает**:
- `theme`: текущая тема ('light' | 'dark')
- `toggleTheme()`: переключить тему
- `setTheme()`: установить конкретную тему

**Особенности**:
- Сохраняет в localStorage
- Устанавливает data-theme на html элемент

### useMediaQuery.ts
**Путь**: `src/hooks/useMediaQuery.ts`

Hook для медиа-запросов.

```tsx
const isMobile = useMediaQuery('(max-width: 768px)')
```

**Возвращает**: boolean - matches ли медиа-запрос

**Особенности**:
- Подписывается на изменения размера экрана
- Очищает слушатели при размонтировании

---

## Types

### chat.ts
**Путь**: `src/types/chat.ts`

```tsx
type ChatRole = 'user' | 'assistant'

interface Chat {
  id: string
  title: string
  lastMessageDate: Date
  preview?: string
}

interface Message {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
```

### settings.ts
**Путь**: `src/types/settings.ts`

```tsx
type Model = 'GigaChat' | 'GigaChat-Plus' | 'GigaChat-Pro' | 'GigaChat-Max'
type Scope = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP'
type Theme = 'light' | 'dark'

interface Settings {
  model: Model
  temperature: number
  topP: number
  maxTokens: number
  systemPrompt: string
  theme: Theme
}

interface AuthState {
  isAuthenticated: boolean
  credentials?: string
  scope?: Scope
}
```

---

## CSS & Styling

### globals.css
**Путь**: `src/app/globals.css`

Глобальные стили и переменные CSS для тем.

**Переменные**:
- `--color-bg-primary`: основной фон
- `--color-text-primary`: основной текст
- `--color-accent`: акцентный цвет
- И многие другие...

**Темы**:
- Light (по умолчанию)
- Dark (через data-theme="dark")

### Module CSS
Каждый компонент имеет свой `.module.css`:
- `Sidebar.module.css`
- `ChatWindow.module.css`
- `Message.module.css`
- И т.д.

**Особенности**:
- Локально скопированы классы
- Предотвращает конфликты имен
- Полная типизация в компонентах

---

## 📊 Диаграмма компонентов

```
App
└── AuthGate
    ├── AuthForm (если не авторизован)
    └── AppLayout (если авторизован)
        ├── Sidebar
        │   ├── ChatList
        │   │   └── ChatItem (x5)
        │   └── SearchInput
        └── ChatWindow
            ├── Header
            ├── MessageList
            │   ├── Message (x6)
            │   └── TypingIndicator (когда печатает)
            ├── InputArea
            │   ├── Textarea
            │   ├── AttachButton
            │   ├── StopButton
            │   └── SendButton
            ├── EmptyState (если нет сообщений)
            └── SettingsPanel (modal, когда открыт)
                ├── ModelSelect
                ├── TemperatureSlider
                ├── TopPSlider
                ├── MaxTokensInput
                ├── SystemPromptTextarea
                ├── ThemeToggle
                └── SaveResetButtons
```

---

## 🔗 Импорты и экспорты

Все компоненты экспортируются по умолчанию:

```tsx
export const ComponentName: React.FC<Props> = (props) => { ... }
```

Все типы экспортируются как type-only:

```tsx
export type TypeName = { ... }
export interface InterfaceName { ... }
```

---

## 💡 Используемые паттерны

1. **Functional Components**: Все компоненты - функциональные
2. **TypeScript**: Строгая типизация для всех props
3. **CSS Modules**: Изоляция стилей для каждого компонента
4. **Composition**: Компоненты составляются из других компонентов
5. **Prop Drilling**: Props передаются вниз по иерархии (в будущем - управление состоянием)
6. **Custom Hooks**: useTheme и useMediaQuery для логики

---

Этот справочник помогает быстро ориентироваться в структуре проекта и понимать, как компоненты взаимодействуют друг с другом.
