import { useRef, type KeyboardEvent } from 'react';
import type { Mode } from '../../types';
import styles from './ModeTabs.module.css';
import { MODES, tabId } from './modes';

interface Props {
  value: Mode;
  onChange: (mode: Mode) => void;
  panelId: string;
}

/** WAI-ARIA Tabs: 화살표·Home·End로 이동, 선택된 탭만 Tab 순서에 포함(roving tabindex) */
export function ModeTabs({ value, onChange, panelId }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = MODES.length - 1;
    const next =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    onChange(MODES[next].mode);
    refs.current[next]?.focus();
  };

  return (
    <div className={styles.tabs} role="tablist" aria-label="추천 방식">
      {MODES.map((m, i) => {
        const selected = m.mode === value;
        return (
          <button
            key={m.mode}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={tabId(m.mode)}
            type="button"
            role="tab"
            className={styles.tab}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(m.mode)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span className={styles.title}>{m.title}</span>
            <span className={styles.desc}>{m.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
