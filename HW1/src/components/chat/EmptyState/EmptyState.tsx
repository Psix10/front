import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Начните новый диалог',
  description = 'Выберите существующий чат или создайте новый, чтобы начать диалог с GigaChat'
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>💬</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </div>
  );
};
