import { useState } from 'react';
import styles from './SettingsPanel.module.css';
import type { Settings, Model, Theme } from '../../../types/settings';
import { ErrorMessage } from '../../feedback/ErrorMessage/ErrorMessage';

interface SettingsPanelProps {
  settings: Settings;
  onSave?: (settings: Settings) => void;
  onReset?: () => void;
  onClose?: () => void;
}

const MODELS: Model[] = ['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max'];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSave,
  onReset,
  onClose,
}) => {
  const [formData, setFormData] = useState(settings);
  const [error, setError] = useState('');

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, model: e.target.value as Model });
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(2, parseFloat(e.target.value)));
    setFormData({ ...formData, temperature: value });
  };

  const handleTopPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(1, parseFloat(e.target.value)));
    setFormData({ ...formData, topP: value });
  };

  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 0);
    setFormData({ ...formData, maxTokens: value });
  };

  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, systemPrompt: e.target.value });
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const theme: Theme = e.target.checked ? 'dark' : 'light';
    setFormData({ ...formData, theme });
  };

  const handleSave = () => {
    if (!formData.systemPrompt.trim()) {
      setError('System prompt cannot be empty');
      return;
    }
    onSave?.(formData);
    onClose?.();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Settings</h2>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>

      <div className={styles.content}>
        {error && <ErrorMessage message={error} />}

        <div className={styles.section}>
          <label className={styles.label}>Model</label>
          <select
            value={formData.model}
            onChange={handleModelChange}
            className={styles.select}
          >
            {MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            Temperature: <span className={styles.value}>{formData.temperature.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={formData.temperature}
            onChange={handleTemperatureChange}
            className={styles.slider}
          />
          <div className={styles.hint}>Controls randomness of responses (0 = deterministic, 2 = creative)</div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            Top-P: <span className={styles.value}>{formData.topP.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={formData.topP}
            onChange={handleTopPChange}
            className={styles.slider}
          />
          <div className={styles.hint}>Nucleus sampling parameter</div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Max Tokens</label>
          <input
            type="number"
            min="1"
            value={formData.maxTokens}
            onChange={handleMaxTokensChange}
            className={styles.input}
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>System Prompt</label>
          <textarea
            value={formData.systemPrompt}
            onChange={handleSystemPromptChange}
            className={styles.textarea}
            placeholder="Enter system prompt..."
            rows={6}
          />
        </div>

        <div className={styles.section}>
          <label className={styles.toggleContainer}>
            <input
              type="checkbox"
              checked={formData.theme === 'dark'}
              onChange={handleThemeChange}
              className={styles.checkbox}
            />
            <span className={styles.toggleLabel}>Dark Theme</span>
          </label>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.resetButton} onClick={onReset}>
          Reset to Defaults
        </button>
        <button className={styles.saveButton} onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
};
