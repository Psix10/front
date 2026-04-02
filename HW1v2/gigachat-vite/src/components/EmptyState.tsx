import { Sparkles, MessageSquarePlus } from 'lucide-react';
import { EmptyStateProps } from '../types';

export function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <div className="empty-state" data-testid="empty-state">
      {/* Icon */}
      <div className="empty-state__icon-wrap">
        <Sparkles
          size={36}
          className="empty-state__icon"
          strokeWidth={1.5}
        />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h2 className="empty-state__title">Начните новый диалог</h2>
        <p className="empty-state__subtitle">
          Выберите чат из списка слева или создайте новый — я помогу с любыми вопросами.
        </p>
      </div>

      {/* Hint buttons */}
      <div className="empty-state__hints">
        {[
          'Объясни разницу между REST и GraphQL',
          'Помоги настроить Docker Compose',
          'Напиши SQL-запрос с оконными функциями',
        ].map((hint) => (
          <button
            key={hint}
            onClick={onNewChat}
            className="empty-state__hint-btn"
            data-testid={`hint-${hint.slice(0, 10)}`}
          >
            {hint}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onNewChat}
        className="btn-primary"
        data-testid="btn-new-chat-empty"
      >
        <MessageSquarePlus size={16} />
        Новый чат
      </button>
    </div>
  );
}
