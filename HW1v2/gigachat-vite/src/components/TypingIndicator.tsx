import { TypingIndicatorProps } from '../types';

export function TypingIndicator({ isVisible = true }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="typing-indicator" data-testid="typing-indicator">
      {/* AI Avatar */}
      <div
        className="message__avatar message__avatar--assistant"
        aria-hidden="true"
      >
        AI
      </div>

      {/* Bubble with dots */}
      <div
        className="typing-indicator__bubble"
        aria-label="Ассистент печатает..."
        role="status"
      >
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
      </div>
    </div>
  );
}
