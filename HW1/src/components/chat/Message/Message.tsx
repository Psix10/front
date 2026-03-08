import ReactMarkdown from 'react-markdown';
import styles from './Message.module.css';
import type { Message as MessageType } from '../../../types/chat';
import { useState } from 'react';

interface MessageProps extends MessageType {
  variant?: 'user' | 'assistant';
}

export const Message: React.FC<MessageProps> = ({
  content,
  role,
  variant = role,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = variant === 'user';

  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      {!isUser && (
        <div className={styles.avatar}>🤖</div>
      )}
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.sender}>
            {isUser ? 'You' : 'GigaChat'}
          </span>
        </div>
        <div className={styles.text}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <button
          className={styles.copyButton}
          onClick={handleCopy}
          title="Copy message"
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
    </div>
  );
};
