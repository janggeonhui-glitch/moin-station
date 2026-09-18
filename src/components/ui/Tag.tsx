import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';
import styles from './Tag.module.css';

export type TagTone = 'good' | 'warn' | 'popup';

export function Tag({ tone, children }: { tone: TagTone; children: ReactNode }) {
  return <span className={cx(styles.tag, styles[tone])}>{children}</span>;
}
