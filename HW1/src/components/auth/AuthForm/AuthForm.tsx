import { useState } from 'react';
import styles from './AuthForm.module.css';
import type { Scope } from '../../../types/settings';
import { ErrorMessage } from '../../feedback/ErrorMessage/ErrorMessage';

interface AuthFormProps {
  onSubmit?: (credentials: string, scope: Scope) => void;
}

const SCOPES: Scope[] = ['GIGACHAT_API_PERS', 'GIGACHAT_API_B2B', 'GIGACHAT_API_CORP'];

export const AuthForm: React.FC<AuthFormProps> = ({ onSubmit }) => {
  const [credentials, setCredentials] = useState('');
  const [scope, setScope] = useState<Scope>('GIGACHAT_API_PERS');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!credentials.trim()) {
      setError('Credentials field is required');
      return;
    }

    // Basic Base64 validation
    try {
      const decoded = atob(credentials);
      if (!decoded) throw new Error('Invalid');
    } catch {
      setError('Invalid Base64 credentials format');
      return;
    }

    onSubmit?.(credentials, scope);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>GigaChat</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <ErrorMessage message={error} />}

          <div className={styles.formGroup}>
            <label htmlFor="credentials" className={styles.label}>
              Credentials (Base64)
            </label>
            <input
              id="credentials"
              type="password"
              value={credentials}
              onChange={(e) => {
                setCredentials(e.target.value);
                setError('');
              }}
              placeholder="Paste your Base64-encoded credentials"
              className={styles.input}
            />
            <p className={styles.hint}>
              Provide your API credentials in Base64 format
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Scope</label>
            <div className={styles.radioGroup}>
              {SCOPES.map((s) => (
                <label key={s} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="scope"
                    value={s}
                    checked={scope === s}
                    onChange={(e) => setScope(e.target.value as Scope)}
                    className={styles.radio}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            Sign In
          </button>
        </form>

        <p className={styles.footer}>
          Demo mode • Testing only • No real validation
        </p>
      </div>
    </div>
  );
};
