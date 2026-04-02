// Core Types

export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: Date;
  messages: Message[];
}

// Serializable versions for localStorage

export interface SerializableMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO string
}

export interface SerializableChat {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string; // ISO string
  messages: SerializableMessage[];
}

// Chat State (Zustand Store)

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
  isStreaming: boolean;
  streamingMessageId: string | null;
}

export type ChatAction =
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'RENAME_CHAT'; payload: { id: string; title: string } }
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { chatId: string; messageId: string; content: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STREAMING'; payload: { isStreaming: boolean; messageId: string | null } }
  | { type: 'LOAD_CHATS'; payload: Chat[] };

// Settings Types

export type GigaChatModel =
  | 'GigaChat'
  | 'GigaChat-Plus'
  | 'GigaChat-Pro'
  | 'GigaChat-Max';

export type ApiScope =
  | 'GIGACHAT_API_PERS'
  | 'GIGACHAT_API_B2B'
  | 'GIGACHAT_API_CORP';

export interface ChatSettings {
  model: GigaChatModel;
  temperature: number;   // 0–2
  topP: number;          // 0–1
  maxTokens: number;
  systemPrompt: string;
}

export type Theme = 'light' | 'dark';

// Auth Types

export interface AuthCredentials {
  credentials: string; // base64
  scope: ApiScope;
}

// GigaChat API Types

export interface GigaChatTokenResponse {
  access_token: string;
  expires_at: number;
}

export interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GigaChatRequest {
  model: string;
  messages: GigaChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface GigaChatChoice {
  message: GigaChatMessage;
  index: number;
  finish_reason: string;
}

export interface GigaChatResponse {
  choices: GigaChatChoice[];
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Component Prop Types

export interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface MessageProps {
  message: Message;
  variant: 'user' | 'assistant';
}

export interface TypingIndicatorProps {
  isVisible?: boolean;
}

export interface InputAreaProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSave: (settings: ChatSettings) => void;
  onReset: () => void;
  theme: Theme;
  onThemeToggle: () => void;
}

export interface AuthFormProps {
  onAuth: (creds: AuthCredentials) => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ChatWindowProps {
  chat: Chat | null;
  onOpenSettings: () => void;
}

export interface ErrorMessageProps {
  message: string;
}

export interface EmptyStateProps {
  onNewChat: () => void;
}
