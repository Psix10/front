import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { ApiScope } from '../types';
import { ErrorMessage } from './ErrorMessage';
import { useChatStore } from '../store/chatStore';

const SCOPES: { value: ApiScope; label: string; desc: string }[] = [
  { value: 'GIGACHAT_API_PERS', label: 'Физическое лицо', desc: 'Персональный доступ' },
  { value: 'GIGACHAT_API_B2B', label: 'Бизнес (B2B)', desc: 'Корпоративный API' },
  { value: 'GIGACHAT_API_CORP', label: 'Корпоративный', desc: 'Расширенный доступ' },
];

export function AuthForm() {
  const login = useChatStore(s => s.login);

  const [credentials, setCredentials] = useState('');
  const [scope, setScope] = useState<ApiScope>('GIGACHAT_API_PERS');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.trim()) {
      setError('Введите Credentials (Base64-строку)');
      return;
    }
    if (credentials.trim().length < 10) {
      setError('Credentials слишком короткие — проверьте значение');
      return;
    }

    setError('');
    login({ credentials: credentials.trim(), scope });
  };

  return (
    <div className="auth-screen" data-testid="auth-screen">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-card__header">
          <h1 className="auth-card__title">AI Chat</h1>
          <p className="auth-card__subtitle">
            Введите учётные данные для подключения к GigaChat API
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-card__form">
          {/* Credentials */}
          <div>
            <label htmlFor="credentials" className="form-label">
              Credentials
              <span className="form-label__required"> *</span>
            </label>
            <div className="form-input-wrap">
              <input
                id="credentials"
                type={showPassword ? 'text' : 'password'}
                value={credentials}
                onChange={e => {
                  setCredentials(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Base64-строка авторизации..."
                className={`form-input${error ? ' form-input--error' : ''}`}
                autoComplete="current-password"
                data-testid="input-credentials"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="form-input-eye"
                tabIndex={-1}
                data-testid="btn-toggle-password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <ErrorMessage message={error} />}

            <p className="form-hint">
              Получите ключ в личном кабинете GigaChat. Передаётся в заголовке Authorization.
            </p>
          </div>

          {/* Scope */}
          <div>
            <span className="form-label">Scope (тип доступа)</span>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Выбор Scope">
              {SCOPES.map(s => (
                <label
                  key={s.value}
                  className={`scope-option${scope === s.value ? ' scope-option--active' : ''}`}
                  data-testid={`radio-scope-${s.value}`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value={s.value}
                    checked={scope === s.value}
                    onChange={() => setScope(s.value)}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="scope-option__label">{s.label}</span>
                    <span className="scope-option__value">{s.value}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full mt-2"
            data-testid="btn-login"
          >
            <LogIn size={16} />
            Войти
          </button>

          {/* Demo hint */}
          <button
            type="button"
            onClick={() => login({ credentials: 'demo_base64_credentials_mock', scope })}
            className="auth-demo-btn"
            data-testid="btn-demo"
          >
            Войти в демо-режиме (без реального API)
          </button>
        </form>
      </div>
    </div>
  );
}
