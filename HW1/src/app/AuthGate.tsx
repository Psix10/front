import { useState, useEffect } from 'react';
import { AuthForm } from '../components/auth/AuthForm/AuthForm';
import { AppLayout } from './AppLayout';
import { useTheme } from '../hooks/useTheme';
import '../app/globals.css';

export const AuthGate: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem('gigachat_auth');
    if (savedAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (credentials: string, scope: string) => {
    localStorage.setItem('gigachat_auth', JSON.stringify({ credentials, scope }));
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthForm onSubmit={handleLogin} />;
  }

  return <AppLayout theme={theme} onThemeChange={setTheme} />;
};
