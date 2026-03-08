import { useState } from 'react';
import styles from './ChatItem.module.css';
import type { Chat } from '../../../types/chat';

interface ChatItemProps extends Chat {
  isActive?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  id,
  title,
  lastMessageDate,
  isActive = false,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    }
  };

  return (
    <div
      className={`${styles.container} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect?.(id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.date}>{formatDate(lastMessageDate)}</div>
      </div>
      {showActions && (
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(id);
            }}
            title="Edit chat"
          >
            ✏️
          </button>
          <button
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(id);
            }}
            title="Delete chat"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};
