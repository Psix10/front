import { useState } from 'react';
import styles from './ChatWindow.module.css';
import { MessageList } from '../../chat/MessageList/MessageList';
import { InputArea } from '../../chat/InputArea/InputArea';
import { EmptyState } from '../../chat/EmptyState/EmptyState';
import { SettingsPanel } from '../../settings/SettingsPanel/SettingsPanel';
import type { ChatSession } from '../../../types/chat';
import type { Settings } from '../../../types/settings';

interface ChatWindowProps {
  session?: ChatSession;
  settings: Settings;
  onSettingsSave?: (settings: Settings) => void;
  onMessageSend?: (message: string) => void;
  isLoading?: boolean;
  showTypingIndicator?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  session,
  settings,
  onSettingsSave,
  onMessageSend,
  isLoading = false,
  showTypingIndicator = false,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  if (!session) {
    return (
      <div className={styles.container}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{session.title}</h1>
        <button
          className={styles.settingsButton}
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      <MessageList
        messages={session.messages}
        showTypingIndicator={showTypingIndicator}
      />

      <InputArea onSend={onMessageSend} isLoading={isLoading} />

      {showSettings && (
        <div className={styles.settingsOverlay}>
          <SettingsPanel
            settings={settings}
            onSave={(newSettings: Settings) => {
              onSettingsSave?.(newSettings);
              setShowSettings(false);
            }}
            onReset={() => {
              // Reset to default settings
              onSettingsSave?.(settings);
            }}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  );
};
