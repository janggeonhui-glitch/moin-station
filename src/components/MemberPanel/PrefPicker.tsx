import { PREFS } from '../../data/prefs';
import type { PrefKey } from '../../types';
import styles from './MemberPanel.module.css';

interface Props {
  value: readonly PrefKey[];
  onChange: (next: PrefKey[]) => void;
}

/** 다중 선택 취향 칩. 각 칩은 aria-pressed 토글 버튼 */
export function PrefPicker({ value, onChange }: Props) {
  const toggle = (key: PrefKey) =>
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>
        이 사람 취향 <span className="hint">여러 개 선택</span>
      </legend>
      <div className={styles.chips}>
        {PREFS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={styles.chip}
            aria-pressed={value.includes(key)}
            onClick={() => toggle(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
