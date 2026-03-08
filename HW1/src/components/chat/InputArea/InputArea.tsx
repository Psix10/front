import { useState, useRef, useEffect } from 'react';
import styles from './InputArea.module.css';
import { ErrorMessage } from '../../feedback/ErrorMessage/ErrorMessage';

interface InputAreaProps {
  onSend?: (message: string) => void;
  isLoading?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  isLoading = false,
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 160); // 5 lines max
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setError('');
  };

  const handleSend = () => {
    if (!input.trim()) {
      setError('Please enter a message');
      return;
    }
    onSend?.(input.trim());
    setInput('');
    setError('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSendDisabled = !input.trim() || isLoading;

  return (
    <div className={styles.container}>
      {error && <ErrorMessage message={error} />}
      <div className={styles.inputWrapper}>
        <button
          className={styles.attachButton}
          title="Attach file"
          disabled={isLoading}
          onClick={() => {}}
        >
          📎
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter your message here... (Shift+Enter for newline)"
          className={styles.textarea}
          disabled={isLoading}
        />
        <div className={styles.buttonGroup}>
          <button
            className={styles.stopButton}
            title="Stop generation"
            disabled={!isLoading}
            onClick={() => {}}
          >
            ⏹️
          </button>
          <button
            className={`${styles.sendButton} ${isSendDisabled ? styles.disabled : ''}`}
            onClick={handleSend}
            disabled={isSendDisabled}
            title="Send message"
          >
            ✈️
          </button>
        </div>
      </div>
    </div>
  );
};
