import { useState } from 'react';
import { X, RotateCcw, Save, Sun, Moon } from 'lucide-react';
import { SettingsPanelProps, ChatSettings, GigaChatModel } from '../types';
import { DEFAULT_SETTINGS } from '../data/mockData';

const MODELS: GigaChatModel[] = ['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max'];

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSave,
  onReset,
  theme,
  onThemeToggle,
}: SettingsPanelProps) {
  const [local, setLocal] = useState<ChatSettings>(settings);

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  const handleReset = () => {
    setLocal({ ...DEFAULT_SETTINGS });
    onReset();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="settings-overlay"
        onClick={onClose}
        data-testid="settings-overlay"
      />

      {/* Drawer */}
      <aside
        className="settings-drawer"
        data-testid="settings-panel"
        role="dialog"
        aria-label="Настройки чата"
      >
        {/* Header */}
        <div className="settings-drawer__header">
          <h2 className="settings-drawer__title">Настройки</h2>
          <button
            onClick={onClose}
            className="btn-icon btn-icon--small"
            data-testid="btn-close-settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="settings-drawer__body">

          {/* Theme Toggle */}
          <section className="flex flex-col gap-3">
            <h3 className="settings-section__label">ТЕМА ИНТЕРФЕЙСА</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'hsl(var(--color-text))' }}>
                {theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
              </span>
              <button
                onClick={onThemeToggle}
                className="settings-theme-btn"
                data-testid="btn-theme-toggle"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                {theme === 'dark' ? 'Светлая' : 'Тёмная'}
              </button>
            </div>
          </section>

          {/* Model Select */}
          <section className="flex flex-col gap-3">
            <h3 className="settings-section__label">МОДЕЛЬ</h3>
            <select
              value={local.model}
              onChange={e => setLocal({ ...local, model: e.target.value as GigaChatModel })}
              className="settings-input cursor-pointer"
              data-testid="select-model"
            >
              {MODELS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </section>

          {/* Temperature */}
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="settings-section__label">ТЕМПЕРАТУРА</h3>
              <span className="settings-section__value-badge">
                {local.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={local.temperature}
              onChange={e => setLocal({ ...local, temperature: parseFloat(e.target.value) })}
              className="settings-range"
              data-testid="slider-temperature"
            />
            <div className="settings-range-labels">
              <span>0 — точный</span>
              <span>2 — творческий</span>
            </div>
          </section>

          {/* Top-P */}
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="settings-section__label">TOP-P</h3>
              <span className="settings-section__value-badge">
                {local.topP.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={local.topP}
              onChange={e => setLocal({ ...local, topP: parseFloat(e.target.value) })}
              className="settings-range"
              data-testid="slider-top-p"
            />
            <div className="settings-range-labels">
              <span>0</span>
              <span>1</span>
            </div>
          </section>

          {/* Max Tokens */}
          <section className="flex flex-col gap-3">
            <h3 className="settings-section__label">MAX TOKENS</h3>
            <input
              type="number"
              min="1"
              max="32768"
              value={local.maxTokens}
              onChange={e => setLocal({ ...local, maxTokens: parseInt(e.target.value) || 1 })}
              className="settings-input"
              data-testid="input-max-tokens"
            />
          </section>

          {/* System Prompt */}
          <section className="flex flex-col gap-3">
            <h3 className="settings-section__label">СИСТЕМНЫЙ ПРОМПТ</h3>
            <textarea
              value={local.systemPrompt}
              onChange={e => setLocal({ ...local, systemPrompt: e.target.value })}
              rows={5}
              className="settings-textarea"
              placeholder="Опишите роль или поведение ассистента..."
              data-testid="textarea-system-prompt"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="settings-drawer__footer">
          <button
            onClick={handleReset}
            className="btn-secondary"
            data-testid="btn-reset-settings"
          >
            <RotateCcw size={15} />
            Сбросить
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1"
            data-testid="btn-save-settings"
          >
            <Save size={15} />
            Сохранить
          </button>
        </div>
      </aside>
    </>
  );
}
