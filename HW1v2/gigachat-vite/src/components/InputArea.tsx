import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, Square, Paperclip } from 'lucide-react';
import { InputAreaProps } from '../types';
import { useChatStore } from '../store/chatStore';

export function InputArea({ onSend, onStop, isGenerating = false, disabled = false }: InputAreaProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const authCredentials = useChatStore(s => s.authCredentials);
  const isDemo = authCredentials?.credentials === 'demo_base64_credentials_mock';

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 24 * 5 + 32;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="input-area" data-testid="input-area">
      <div className="input-area__box">
        {/* Attach button */}
        <button
          type="button"
          className="input-area__attach-btn"
          title="Прикрепить файл (недоступно)"
          disabled
          data-testid="btn-attach"
          aria-label="Прикрепить изображение"
        >
          <Paperclip size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
          rows={1}
          disabled={disabled}
          className="input-area__textarea"
          data-testid="input-message"
        />

        {/* Stop / Send button */}
        {isGenerating ? (
          <button
            type="button"
            onClick={onStop}
            className="input-area__stop-btn"
            title="Остановить генерацию"
            data-testid="btn-stop"
            aria-label="Остановить"
          >
            <Square size={17} fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="input-area__send-btn"
            title="Отправить"
            data-testid="btn-send"
            aria-label="Отправить сообщение"
          >
            <Send size={17} />
          </button>
        )}
      </div>

      {/* Hint text */}
      <p className="input-area__hint">
        {isDemo
          ? 'Демо-режим — используются моковые данные'
          : 'Подключено к GigaChat API'}
      </p>
    </div>
  );
}
