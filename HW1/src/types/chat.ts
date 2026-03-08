export type ChatRole = 'user' | 'assistant';

export interface Chat {
  id: string;
  title: string;
  lastMessageDate: Date;
  preview?: string;
}

export interface Message {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
