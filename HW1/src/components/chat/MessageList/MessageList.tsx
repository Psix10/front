import styles from './MessageList.module.css';
import { Message } from '../Message/Message';
import { TypingIndicator } from '../TypingIndicator/TypingIndicator';
import type { Message as MessageType } from '../../../types/chat';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: MessageType[];
  showTypingIndicator?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  showTypingIndicator = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTypingIndicator]);

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((message) => (
          <Message
            key={message.id}
            {...message}
            variant={message.role}
          />
        ))}
        {showTypingIndicator && <TypingIndicator isVisible={true} />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
