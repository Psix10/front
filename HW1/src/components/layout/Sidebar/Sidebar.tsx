import { useState } from 'react';
import styles from './Sidebar.module.css';
import { ChatList } from '../../chat/ChatList/ChatList';
import type { Chat } from '../../../types/chat';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface SidebarProps {
  chats: Chat[];
  activeId?: string;
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  onEditChat?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeId,
  onNewChat,
  onSelectChat,
  onEditChat,
  onDeleteChat,
  isOpen = true,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {isMobile && isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}
      <aside className={`${styles.container} ${isMobile && isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          {isMobile && (
            <button className={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          )}
          <button className={styles.newChatButton} onClick={onNewChat}>
            <span className={styles.icon}>➕</span>
            <span className={styles.text}>New Chat</span>
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <ChatList
          chats={filteredChats}
          activeId={activeId}
          onSelect={(id: string) => {
            onSelectChat?.(id);
            if (isMobile) onClose?.();
          }}
          onEdit={onEditChat}
          onDelete={onDeleteChat}
        />
      </aside>
    </>
  );
};
