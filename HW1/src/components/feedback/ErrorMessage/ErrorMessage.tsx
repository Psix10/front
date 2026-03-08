import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  icon?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  icon = '❌'
}) => {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>{message}</span>
    </div>
  );
};
