import styles from './ChatList.module.css';
import { ChatItem } from '../ChatItem/ChatItem';
import type { Chat } from '../../../types/chat';

interface ChatListProps {
  chats: Chat[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeId,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.container}>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          {...chat}
          isActive={chat.id === activeId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
