import { ChatSettings } from '../types';

// Default Settings 

export const DEFAULT_SETTINGS: ChatSettings = {
  model: 'GigaChat-Pro',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  systemPrompt: 'Ты полезный AI-ассистент. Отвечай на русском языке, чётко и по делу.',
};
