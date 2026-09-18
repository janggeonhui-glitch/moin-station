import { useEffect } from 'react';
import styles from './Toast.module.css';

interface Props {
  message: string | null;
  onDone: () => void;
  duration?: number;
}

/** 스크린리더에도 읽히는 짧은 알림 (live region은 항상 렌더해 둬야 안정적으로 읽힌다) */
export function Toast({ message, onDone, duration = 3200 }: Props) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(timer);
  }, [message, onDone, duration]);

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {message && <div className={styles.toast}>{message}</div>}
    </div>
  );
}
