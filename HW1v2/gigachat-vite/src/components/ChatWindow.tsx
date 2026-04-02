import { useEffect, useRef } from 'react';
import { Settings, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatWindowProps } from '../types';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { InputArea } from './InputArea';
import { EmptyState } from './EmptyState';
import { useChatStore } from '../store/chatStore';
import { useGigaChat } from '../hooks/useGigaChat';

export function ChatWindow({ chat, onOpenSettings }: ChatWindowProps) {
  const navigate = useNavigate();
  const { isStreaming, streamingMessageId, createChat } = useChatStore();
  const { sendUserMessage, abort } = useGigaChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = chat?.messages ?? [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handlers 

  const handleSend = (text: string) => {
    if (!chat) {
      // Создаём новый чат и отправляем
      const newId = createChat();
      navigate(`/chat/${newId}`);
      // Небольшая задержка чтобы стор обновился
      setTimeout(() => {
        sendUserMessage(newId, text);
      }, 0);
      return;
    }
    sendUserMessage(chat.id, text);
  };

  const handleStop = () => {
    abort();
  };

  const handleNewChat = () => {
    const id = createChat();
    navigate(`/chat/${id}`);
  };

  // Render 

  if (!chat) {
    return (
      <main className="chat-window" data-testid="chat-window-empty">
        <EmptyState onNewChat={handleNewChat} />
      </main>
    );
  }

  return (
    <main className="chat-window" data-testid="chat-window">
      {/* Chat Header */}
      <header className="chat-header" data-testid="chat-header">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="chat-header__title" data-testid="chat-title">
            {chat.title}
          </h1>
          <span className="chat-header__subtitle">
            {messages.length} сообщений
          </span>
        </div>

        {/* Actions */}
        <div className="chat-header__actions">
          <button
            onClick={onOpenSettings}
            className="btn-icon"
            title="Настройки"
            data-testid="btn-open-settings"
          >
            <Settings size={18} />
          </button>
          <button
            className="btn-icon"
            title="Дополнительно"
            data-testid="btn-more"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        className="message-list scroll-area"
        data-testid="message-list"
      >
        {messages.length === 0 ? (
          <div className="message-list__empty">
            <p className="text-sm">Отправьте первое сообщение</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {messages.map(msg => (
              <Message
                key={msg.id}
                message={msg}
                variant={msg.role === 'user' ? 'user' : 'assistant'}
                isStreaming={isStreaming && msg.id === streamingMessageId}
              />
            ))}
          </div>
        )}

        {/* Typing indicator — shown only before first chunk arrives */}
        {isStreaming && streamingMessageId !== null && (() => {
          const streamMsg = messages.find(m => m.id === streamingMessageId);
          return streamMsg && streamMsg.content === '' ? (
            <TypingIndicator isVisible />
          ) : null;
        })()}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <InputArea
        onSend={handleSend}
        onStop={handleStop}
        isGenerating={isStreaming}
        disabled={false}
      />
    </main>
  );
}
