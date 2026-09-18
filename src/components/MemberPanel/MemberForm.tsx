import { useId, useRef, useState, type FormEvent } from 'react';
import { MAX_MEMBERS } from '../../data/lines';
import type { NewMember } from '../../hooks/useMeetup';
import { NAME_MAX, sanitizeName } from '../../lib/share';
import type { PrefKey } from '../../types';
import styles from './MemberPanel.module.css';
import { PrefPicker } from './PrefPicker';
import { StationCombobox } from './StationCombobox';

interface Props {
  onAdd: (member: NewMember) => void;
  full: boolean;
}

type FieldError = { field: 'name' | 'station'; message: string } | null;

export function MemberForm({ onAdd, full }: Props) {
  const [name, setName] = useState('');
  const [station, setStation] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<PrefKey[]>([]);
  const [error, setError] = useState<FieldError>(null);
  // 제출 후 콤보박스 내부 입력값까지 초기화하기 위한 key
  const [resetKey, setResetKey] = useState(0);
  const nameRef = useRef<HTMLInputElement>(null);
  const stationRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = sanitizeName(name);
    if (!clean) {
      setError({ field: 'name', message: '이름을 입력해 주세요.' });
      nameRef.current?.focus();
      return;
    }
    if (!station) {
      setError({ field: 'station', message: '출발역을 검색해서 목록에서 골라 주세요.' });
      stationRef.current?.focus();
      return;
    }
    onAdd({ name: clean, station, prefs });
    setName('');
    setStation(null);
    setPrefs([]);
    setError(null);
    setResetKey((k) => k + 1);
    nameRef.current?.focus();
  };

  if (full) {
    return <p className={styles.full}>한 모임에는 최대 {MAX_MEMBERS}명까지 넣을 수 있어요.</p>;
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="member-name">
          이름
        </label>
        <input
          ref={nameRef}
          id="member-name"
          className={styles.input}
          maxLength={NAME_MAX}
          placeholder="예: 민지"
          autoComplete="off"
          value={name}
          aria-invalid={error?.field === 'name' || undefined}
          aria-describedby={error?.field === 'name' ? errorId : undefined}
          onChange={(e) => {
            setName(e.target.value);
            if (error?.field === 'name') setError(null);
          }}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="member-station">
          출발역
        </label>
        <StationCombobox
          key={resetKey}
          id="member-station"
          value={station}
          inputRef={stationRef}
          invalid={error?.field === 'station'}
          describedBy={error?.field === 'station' ? errorId : undefined}
          onChange={(s) => {
            setStation(s);
            if (s && error?.field === 'station') setError(null);
          }}
        />
      </div>

      <PrefPicker value={prefs} onChange={setPrefs} />

      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error.message}
        </p>
      )}

      <button type="submit" className="btn btn--primary">
        멤버 추가
      </button>
    </form>
  );
}
