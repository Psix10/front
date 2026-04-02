import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useChatStore } from './store/chatStore';
import { AuthForm } from './components/AuthForm';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { SettingsPanel } from './components/SettingsPanel';

function AppLayout() {
  const {
    isAuthed,
    theme,
    toggleTheme,
    logout,
    sidebarOpen,
    setSidebarOpen,
    settingsOpen,
    setSettingsOpen,
    settings,
    saveSettings,
    resetSettings,
    activeChatId,
    chats,
  } = useChatStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const activeChat = chats.find(c => c.id === activeChatId) ?? null;

  if (!isAuthed) {
    return <AuthForm />;
  }

  return (
    <div className="app-layout" data-testid="app-layout">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="main-column">
        {/* Mobile top bar */}
        <div className="topbar topbar--mobile" data-testid="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-icon"
            data-testid="btn-burger"
            aria-label="Открыть меню"
          >
            <Menu size={20} />
          </button>

          <div className="topbar__actions">
            <button
              onClick={toggleTheme}
              className="btn-icon"
              data-testid="btn-theme-mobile"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={logout}
              className="btn-icon"
              data-testid="btn-logout-mobile"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Desktop top-right bar (theme + logout) */}
        <div className="topbar topbar--desktop justify-end" data-testid="desktop-topbar">
          <div className="topbar__actions">
            <button
              onClick={toggleTheme}
              className="btn-icon"
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              data-testid="btn-theme-desktop"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={logout}
              className="btn-icon btn-icon--danger flex items-center gap-1.5 px-3 text-xs font-medium"
              data-testid="btn-logout-desktop"
            >
              <LogOut size={14} />
              Выйти
            </button>
          </div>
        </div>

        {/* Chat window fills the rest */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            chat={activeChat}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </div>
      </div>

      {/* Settings drawer */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={saveSettings}
        onReset={resetSettings}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
    </div>
  );
}

//  Router wrapper с обработкой маршрутов 

function ChatRouteHandler() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/chat/:id" element={<ChatRouteLoader />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ChatRouteLoader() {
  const { chats, setActiveChatId } = useChatStore();
  const params = window.location.pathname.match(/\/chat\/(.+)/);
  const chatId = params?.[1] ?? null;

  useEffect(() => {
    if (chatId) {
      const chatExists = chats.some(c => c.id === chatId);
      if (chatExists) {
        setActiveChatId(chatId);
      }
    }
  }, [chatId, chats, setActiveChatId]);

  // Если чат не найден — редирект на главную
  if (chatId && !chats.some(c => c.id === chatId)) {
    return <Navigate to="/" replace />;
  }

  return <AppLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ChatRouteHandler />
    </BrowserRouter>
  );
}
