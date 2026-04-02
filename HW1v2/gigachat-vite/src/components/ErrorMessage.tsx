import { AlertCircle } from 'lucide-react';
import { ErrorMessageProps } from '../types';

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="error-message"
      data-testid="error-message"
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
