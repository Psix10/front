import { Pencil, Trash2 } from 'lucide-react';
import { ChatItemProps } from '../types';

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'вчера';
  } else if (days < 7) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }
}

export function ChatItem({ chat, isActive, onSelect, onEdit, onDelete }: ChatItemProps) {
  return (
    <li
      className="chat-item"
      data-testid={`chat-item-${chat.id}`}
    >
      <button
        onClick={() => onSelect(chat.id)}
        className={`chat-item__btn${isActive ? ' chat-item__btn--active' : ''}`}
        data-testid={`btn-select-chat-${chat.id}`}
      >
        {/* Title + date */}
        <div className="chat-item__row">
          <span className={`chat-item__title${isActive ? ' chat-item__title--active' : ''}`}>
            {chat.title}
          </span>
          <span className="chat-item__date">
            {formatDate(chat.lastMessageAt)}
          </span>
        </div>

        {/* Last message preview */}
        <span className="chat-item__preview">
          {chat.lastMessage}
        </span>
      </button>

      {/* Action buttons — revealed on .chat-item:hover via CSS */}
      <div className={`chat-item__actions${isActive ? ' chat-item__actions--active' : ''}`}>
        <button
          onClick={e => { e.stopPropagation(); onEdit(chat.id); }}
          className="chat-item__action-btn"
          title="Переименовать"
          data-testid={`btn-edit-chat-${chat.id}`}
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(chat.id); }}
          className="chat-item__action-btn chat-item__action-btn--delete"
          title="Удалить"
          data-testid={`btn-delete-chat-${chat.id}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}
