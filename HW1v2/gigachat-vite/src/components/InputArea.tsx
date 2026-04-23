import { useState, useRef, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Square, Paperclip, X } from 'lucide-react';
import { InputAreaProps } from '../types';
import { useChatStore } from '../store/chatStore';

export function InputArea({
  onSend,
  onStop,
  isGenerating = false,
  disabled = false,
}: InputAreaProps) {
  const [value, setValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFilePick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;

    setFiles(prev => [...prev, ...picked]);

    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if ((!trimmed && files.length === 0) || disabled) return;

    onSend(trimmed, files);
    setValue('');
    setFiles([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const canSend = (!!value.trim() || files.length > 0) && !disabled;

  return (
    <div className="input-area" data-testid="input-area">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFilesChange}
        accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
      />

      <div className="input-area__box">
        <button
          type="button"
          className="input-area__attach-btn"
          title="Прикрепить файл"
          onClick={handleFilePick}
          disabled={disabled}
          data-testid="btn-attach"
          aria-label="Прикрепить файл"
        >
          <Paperclip size={18} />
        </button>

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

      {files.length > 0 && (
        <div className="input-area__files">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="input-area__file-chip">
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Удалить ${file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="input-area__hint">
        {isDemo
          ? 'Демо-режим — используются моковые данные'
          : 'Подключено к GigaChat API'}
      </p>
    </div>
  );
}