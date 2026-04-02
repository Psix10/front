import { useState } from 'react';
import { Plus, Search, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SidebarProps } from '../types';
import { ChatItem } from './ChatItem';
import { useChatStore } from '../store/chatStore';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { chats, activeChatId, createChat, setActiveChatId, renameChat, deleteChat } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = chats.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const handleNewChat = () => {
    const id = createChat();
    navigate(`/chat/${id}`);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    navigate(`/chat/${id}`);
    onClose();
  };

  const handleEditChat = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    const title = window.prompt('Введите новое название чата:', chat.title);
    if (!title?.trim()) return;
    renameChat(id, title.trim());
  };

  const handleDeleteChat = (id: string) => {
    const confirmed = window.confirm('Удалить этот чат? Это действие нельзя отменить.');
    if (!confirmed) return;

    const isActive = activeChatId === id;
    deleteChat(id);

    if (isActive) {
      navigate('/');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar${isOpen ? '' : ' sidebar--closed'}`}
        data-testid="sidebar"
        aria-label="Список чатов"
      >
        {/* Header */}
        <div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="btn-icon sidebar__close-btn"
            data-testid="btn-close-sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-3">
          <button
            onClick={handleNewChat}
            className="sidebar__new-chat-btn"
            data-testid="btn-new-chat"
          >
            <Plus size={16} strokeWidth={2.5} />
            Новый чат
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="sidebar__search-wrap">
            <Search size={15} className="sidebar__search-icon" />
            <input
              type="search"
              placeholder="Поиск чатов..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="sidebar__search-input"
              data-testid="input-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-icon btn-icon--small"
                data-testid="btn-clear-search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 scroll-area">
          {filtered.length === 0 ? (
            <div className="sidebar__empty" data-testid="no-chats-found">
              <MessageSquare size={28} strokeWidth={1.5} />
              <p>{searchQuery ? 'Ничего не найдено' : 'Нет чатов'}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5" role="list" data-testid="chat-list">
              {filtered.map(chat => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  onSelect={handleSelectChat}
                  onEdit={handleEditChat}
                  onDelete={handleDeleteChat}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar__footer">
          <span>GigaChat UI</span>
        </div>
      </aside>
    </>
  );
}
