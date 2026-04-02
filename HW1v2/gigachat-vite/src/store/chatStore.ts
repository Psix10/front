import { create } from 'zustand';
import { Chat, Message, ChatState, ChatSettings, AuthCredentials, Theme, SerializableChat, SerializableMessage } from '../types';
import { DEFAULT_SETTINGS } from '../data/mockData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(prefix = 'chat'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateChatTitle(firstMessage: string): string | null {
  const trimmed = firstMessage.replace(/\s+/g, ' ').trim();

  if (!trimmed || trimmed.length < 3) {
    return null; // сигнал: использовать дефолтное название
  }

  if (trimmed.length <= 40) {
    return trimmed;
  }

  // Ищем последний пробел в диапазоне 30–40, чтобы не резать слово
  const slice = trimmed.slice(0, 40);
  const lastSpace = slice.lastIndexOf(' ', 40);

  if (lastSpace >= 30) {
    return slice.slice(0, lastSpace) + '…';
  }

  // Пробела в диапазоне нет — режем жёстко на 37
  return trimmed.slice(0, 37) + '…';
}

/**
 * Дефолтное название: «Диалог 1», «Диалог 2», …
 * Счётчик хранится в localStorage и всегда растёт, чтобы номера не повторялись.
 */
const DIALOG_COUNTER_KEY = 'gigachat-dialog-counter';

function nextDefaultChatTitle(): string {
  let counter = 0;
  try {
    const saved = localStorage.getItem(DIALOG_COUNTER_KEY);
    if (saved) counter = parseInt(saved, 10) || 0;
  } catch { /* ignore */ }
  counter += 1;
  try {
    localStorage.setItem(DIALOG_COUNTER_KEY, String(counter));
  } catch { /* ignore */ }
  return `Диалог ${counter}`;
}

// localStorage Persistence

const STORAGE_KEY = 'gigachat-chats';
const AUTH_STORAGE_KEY = 'gigachat-auth';
const SETTINGS_STORAGE_KEY = 'gigachat-settings';
const THEME_STORAGE_KEY = 'gigachat-theme';

function serializeChat(chat: Chat): SerializableChat {
  return {
    ...chat,
    lastMessageAt: chat.lastMessageAt.toISOString(),
    messages: chat.messages.map((m): SerializableMessage => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
    })),
  };
}

function deserializeChat(data: SerializableChat): Chat {
  return {
    ...data,
    lastMessageAt: new Date(data.lastMessageAt),
    messages: data.messages.map((m): Message => ({
      ...m,
      timestamp: new Date(m.timestamp),
    })),
  };
}

function saveChatsToStorage(chats: Chat[], activeChatId: string | null): void {
  try {
    const serializable = chats.map(serializeChat);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      chats: serializable,
      activeChatId,
    }));
  } catch {
  }
}

function loadChatsFromStorage(): { chats: Chat[]; activeChatId: string | null } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.chats)) return null;

    const chats: Chat[] = parsed.chats.map((c: SerializableChat) => deserializeChat(c));
    const activeChatId = typeof parsed.activeChatId === 'string' ? parsed.activeChatId : null;

    // Валидация: activeChatId должен существовать в списке чатов
    const validActiveId = chats.some(c => c.id === activeChatId) ? activeChatId : null;

    return { chats, activeChatId: validActiveId };
  } catch {
    // Битые данные — удаляем
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return null;
  }
}

function saveAuthToStorage(creds: AuthCredentials | null): void {
  try {
    if (creds) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(creds));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch { /* ignore */ }
}

function loadAuthFromStorage(): AuthCredentials | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.credentials === 'string' && typeof parsed.scope === 'string') {
      return parsed as AuthCredentials;
    }
    return null;
  } catch {
    try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch { /* ignore */ }
    return null;
  }
}

function saveSettingsToStorage(settings: ChatSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

function loadSettingsFromStorage(): ChatSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.model === 'string') {
      return parsed as ChatSettings;
    }
    return null;
  } catch {
    try { localStorage.removeItem(SETTINGS_STORAGE_KEY); } catch { /* ignore */ }
    return null;
  }
}

function saveThemeToStorage(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch { /* ignore */ }
}

function loadThemeFromStorage(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
    return null;
  } catch {
    return null;
  }
}

// Initial State 

const savedData = loadChatsFromStorage();
const savedAuth = loadAuthFromStorage();
const savedSettings = loadSettingsFromStorage();
const savedTheme = loadThemeFromStorage();

// Store Interface 

interface AppStore extends ChatState {
  isAuthed: boolean;
  authCredentials: AuthCredentials | null;
  login: (creds: AuthCredentials) => void;
  logout: () => void;

  theme: Theme;
  toggleTheme: () => void;

  settings: ChatSettings;
  saveSettings: (s: ChatSettings) => void;
  resetSettings: () => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  createChat: () => string;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  setActiveChatId: (id: string | null) => void;
  getActiveChat: () => Chat | null;

  addMessage: (chatId: string, message: Message) => void;
  updateMessageContent: (chatId: string, messageId: string, content: string) => void;
  autoRenameChat: (chatId: string, firstMessageContent: string) => void;

  setStreaming: (isStreaming: boolean, messageId?: string | null) => void;

  setError: (error: string | null) => void;
}

export const useChatStore = create<AppStore>((set, get) => ({
  // Chat State
  chats: savedData?.chats ?? [],
  activeChatId: savedData?.activeChatId ?? null,
  isLoading: false,
  error: null,
  isStreaming: false,
  streamingMessageId: null,

  // Auth
  isAuthed: savedAuth !== null,
  authCredentials: savedAuth,

  login: (creds) => {
    saveAuthToStorage(creds);
    set({ isAuthed: true, authCredentials: creds });
  },

  logout: () => {
    saveAuthToStorage(null);
    set({ isAuthed: false, authCredentials: null });
  },

  // Theme
  theme: savedTheme ?? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    saveThemeToStorage(newTheme);
    set({ theme: newTheme });
  },

  // Settings
  settings: savedSettings ?? { ...DEFAULT_SETTINGS },

  saveSettings: (s) => {
    saveSettingsToStorage(s);
    set({ settings: s });
  },

  resetSettings: () => {
    const defaults = { ...DEFAULT_SETTINGS };
    saveSettingsToStorage(defaults);
    set({ settings: defaults });
  },

  // UI
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),

  // Chat Actions
  createChat: () => {
    const id = generateId();
    const newChat: Chat = {
      id,
      title: nextDefaultChatTitle(),
      lastMessage: 'Чат ещё не начат',
      lastMessageAt: new Date(),
      messages: [],
    };
    set(state => {
      const newChats = [newChat, ...state.chats];
      saveChatsToStorage(newChats, id);
      return { chats: newChats, activeChatId: id, sidebarOpen: false };
    });
    return id;
  },

  deleteChat: (id) => {
    set(state => {
      const newChats = state.chats.filter(c => c.id !== id);
      let newActiveId = state.activeChatId;
      if (state.activeChatId === id) {
        newActiveId = newChats[0]?.id ?? null;
      }
      saveChatsToStorage(newChats, newActiveId);
      return { chats: newChats, activeChatId: newActiveId };
    });
  },

  renameChat: (id, title) => {
    set(state => {
      const newChats = state.chats.map(c =>
        c.id === id ? { ...c, title: title.trim() } : c
      );
      saveChatsToStorage(newChats, state.activeChatId);
      return { chats: newChats };
    });
  },

  setActiveChatId: (id) => {
    set(state => {
      saveChatsToStorage(state.chats, id);
      return { activeChatId: id, sidebarOpen: false };
    });
  },

  getActiveChat: () => {
    const state = get();
    return state.chats.find(c => c.id === state.activeChatId) ?? null;
  },

  // Messages
  addMessage: (chatId, message) => {
    set(state => {
      const newChats = state.chats.map(c => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: [...c.messages, message],
          lastMessage: message.content.slice(0, 80) || c.lastMessage,
          lastMessageAt: message.timestamp,
        };
      });
      saveChatsToStorage(newChats, state.activeChatId);
      return { chats: newChats };
    });
  },

  updateMessageContent: (chatId, messageId, content) => {
    set(state => {
      const newChats = state.chats.map(c => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: c.messages.map(m =>
            m.id === messageId ? { ...m, content } : m
          ),
          lastMessage: content.slice(0, 80) || c.lastMessage,
        };
      });
      // Не сохраняем в localStorage при каждом чанке стриминга — слишком часто
      if (!state.isStreaming) {
        saveChatsToStorage(newChats, state.activeChatId);
      }
      return { chats: newChats };
    });
  },

  autoRenameChat: (chatId, firstMessageContent) => {
    const state = get();
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    // Только автопереименовываем чаты с дефолтным названием
    const isDefault = chat.title === 'Новый чат' || /^Диалог\s+\d+$/.test(chat.title);
    if (!isDefault) return;

    const newTitle = generateChatTitle(firstMessageContent);
    // Если сообщение пустое / слишком короткое — оставляем текущее «Диалог N»
    if (newTitle) {
      get().renameChat(chatId, newTitle);
    }
  },

  // Streaming
  setStreaming: (isStreaming, messageId = null) => {
    set({ isStreaming, streamingMessageId: messageId });
    // Сохраняем в localStorage когда стриминг заканчивается
    if (!isStreaming) {
      const state = get();
      saveChatsToStorage(state.chats, state.activeChatId);
    }
  },

  // Error
  setError: (error) => set({ error }),
}));
