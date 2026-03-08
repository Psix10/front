export type Model = 'GigaChat' | 'GigaChat-Plus' | 'GigaChat-Pro' | 'GigaChat-Max';
export type Scope = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP';
export type Theme = 'light' | 'dark';

export interface Settings {
  model: Model;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  theme: Theme;
}

export interface AuthState {
  isAuthenticated: boolean;
  credentials?: string;
  scope?: Scope;
}
