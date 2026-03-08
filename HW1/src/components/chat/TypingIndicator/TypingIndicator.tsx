import styles from './TypingIndicator.module.css';

interface TypingIndicatorProps {
  isVisible?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible = true
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.dots}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </div>
  );
};
