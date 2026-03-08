import { useState } from 'react';
import styles from './AppLayout.module.css';
import { Sidebar } from '../components/layout/Sidebar/Sidebar';
import { ChatWindow } from '../components/layout/ChatWindow/ChatWindow';
import { useMediaQuery } from '../hooks/useMediaQuery';
import type { Chat, ChatSession, Message } from '../types/chat';
import type { Settings, Theme } from '../types/settings';
import '../app/globals.css';

interface AppLayoutProps {
  theme: Theme;
  onThemeChange?: (theme: Theme) => void;
}

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    title: 'TypeScript Best Practices',
    lastMessageDate: new Date(Date.now() - 1000 * 60 * 5),
    preview: 'Let me explain some TypeScript best practices...'
  },
  {
    id: '2',
    title: 'React Hooks Guide',
    lastMessageDate: new Date(Date.now() - 1000 * 60 * 30),
    preview: 'Understanding React Hooks...'
  },
  {
    id: '3',
    title: 'Web Performance Optimization',
    lastMessageDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
    preview: 'Tips for optimizing web performance...'
  },
  {
    id: '4',
    title: 'CSS Grid vs Flexbox',
    lastMessageDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    preview: 'When to use Grid vs Flexbox...'
  },
  {
    id: '5',
    title: 'API Design Patterns',
    lastMessageDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    preview: 'RESTful API best practices...'
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello! Can you help me with TypeScript?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    role: 'assistant',
    content: '# TypeScript Help\n\nOf course! I\'d be happy to help you with TypeScript. Here are some key topics:\n\n- **Type System**: TypeScript provides a static type system\n- **Interfaces**: Define contracts for object shapes\n- **Generics**: Create reusable components\n- **Union Types**: Combine multiple types\n\nWhat specific aspect would you like to explore?',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: '3',
    role: 'user',
    content: 'Can you show me an example of generics?',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    id: '4',
    role: 'assistant',
    content: '```typescript\n// Generic function example\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\n// Generic interface\ninterface Container<T> {\n  value: T;\n  getValue(): T;\n}\n\n// Generic class\nclass Stack<T> {\n  private items: T[] = [];\n  \n  push(item: T): void {\n    this.items.push(item);\n  }\n  \n  pop(): T | undefined {\n    return this.items.pop();\n  }\n}\n```\n\nGenerics allow your code to work with any type while maintaining type safety!',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: '5',
    role: 'user',
    content: 'This is very helpful, thank you!',
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
  },
  {
    id: '6',
    role: 'assistant',
    content: 'You\'re welcome! Feel free to ask if you have any more questions about TypeScript or any other programming topics. Happy coding! 🚀',
    timestamp: new Date(Date.now()),
  },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ theme, onThemeChange }) => {
  const [chats] = useState<Chat[]>(MOCK_CHATS);
  const [activeId, setActiveId] = useState<string | undefined>('1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [settings, setSettings] = useState<Settings>({
    model: 'GigaChat',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2000,
    systemPrompt: 'You are a helpful assistant. Answer questions clearly and concisely.',
    theme: theme,
  });

  const [sessions, setSessions] = useState<Record<string, ChatSession>>({
    '1': {
      id: '1',
      title: 'TypeScript Best Practices',
      messages: MOCK_MESSAGES,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const activeSession = activeId ? sessions[activeId] : undefined;

  const handleSettingsSave = (newSettings: Settings) => {
    setSettings(newSettings);
    if (newSettings.theme !== theme) {
      onThemeChange?.(newSettings.theme);
    }
  };

  const handleNewChat = () => {
    const newId = String(Date.now());
    const newChat: Chat = {
      id: newId,
      title: `Chat ${new Date().toLocaleTimeString()}`,
      lastMessageDate: new Date(),
    };
    // In a real app, you'd update the chats state
    setSessions({
      ...sessions,
      [newId]: {
        id: newId,
        title: newChat.title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    setActiveId(newId);
  };

  return (
    <div className={styles.container}>
      {isMobile && (
        <button
          className={styles.hamburger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle sidebar"
        >
          ☰
        </button>
      )}

      <Sidebar
        chats={chats}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelectChat={setActiveId}
        onEditChat={(id) => console.log('Edit chat:', id)}
        onDeleteChat={(id) => console.log('Delete chat:', id)}
        isOpen={!isMobile || sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatWindow
        session={activeSession}
        settings={settings}
        onSettingsSave={handleSettingsSave}
        onMessageSend={(text) => {
          console.log('Send message:', text);
          // In a real app, you'd add the message to the session
        }}
        showTypingIndicator={false}
      />
    </div>
  );
};
