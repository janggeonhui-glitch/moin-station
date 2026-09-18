import type { ThemePref } from '../../hooks/useTheme';
import { MonitorIcon, MoonIcon, ShareIcon, SunIcon } from '../ui/Icons';
import styles from './Header.module.css';

const THEME_META: Record<ThemePref, { label: string; Icon: typeof SunIcon }> = {
  system: { label: '시스템 설정', Icon: MonitorIcon },
  light: { label: '라이트', Icon: SunIcon },
  dark: { label: '다크', Icon: MoonIcon },
};

interface Props {
  themePref: ThemePref;
  onCycleTheme: () => void;
  onShare: () => void;
  canShare: boolean;
}

export function Header({ themePref, onCycleTheme, onShare, canShare }: Props) {
  const { label, Icon } = THEME_META[themePref];
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">
          중
        </span>
        <div>
          <h1 className={styles.title}>어디서만나</h1>
          <p className={styles.tagline}>각자 출발역만 넣으면, 모두에게 공평한 중간역과 놀 거리를 찾아줘요</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onCycleTheme}
          aria-label={`화면 테마 바꾸기, 현재 ${label}`}
          title={`테마: ${label}`}
        >
          <Icon />
        </button>
        <button type="button" className="btn btn--primary" onClick={onShare} disabled={!canShare}>
          <ShareIcon size={16} />
          모임 링크 공유
        </button>
      </div>
    </header>
  );
}
