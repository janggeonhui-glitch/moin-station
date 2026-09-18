import { useId, useMemo, useState, type KeyboardEvent, type Ref } from 'react';
import { STATION_LIST, STATIONS } from '../../data/stations';
import { normalizeQuery, searchStations } from '../../lib/hangul';
import { LineBadges } from '../ui/LineBadge';
import styles from './StationCombobox.module.css';

interface Props {
  id: string;
  /** 선택된 역 이름 (없으면 null) */
  value: string | null;
  onChange: (station: string | null) => void;
  inputRef?: Ref<HTMLInputElement>;
  describedBy?: string;
  invalid?: boolean;
}

/**
 * WAI-ARIA 1.2 combobox(list autocomplete) 패턴.
 * 포커스는 input에 두고 aria-activedescendant로 현재 옵션을 알린다.
 * 한글 초성 검색 지원: "ㅅㅅ" → 성수, 신사 …
 */
export function StationCombobox({ id, value, onChange, inputRef, describedBy, invalid }: Props) {
  const [query, setQuery] = useState(value ? `${value}역` : '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const results = useMemo(() => searchStations(query, STATION_LIST), [query]);
  const showList = open && results.length > 0;
  const showEmpty = open && normalizeQuery(query) !== '' && results.length === 0;

  const choose = (name: string) => {
    onChange(name);
    setQuery(`${name}역`);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        if (showList) {
          e.preventDefault();
          const hit = results[active];
          if (hit) choose(hit.name);
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
    }
  };

  // 목록에서 고르지 않고 정확한 역 이름만 입력한 채 벗어나도 선택으로 인정
  const onBlur = () => {
    setOpen(false);
    const exact = normalizeQuery(query);
    if (!value && STATIONS.has(exact)) choose(exact);
  };

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        id={id}
        className={styles.input}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? optionId(active) : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        placeholder="역 이름 또는 초성 (예: 노원, ㅍㄱ)"
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => query && !value && setOpen(true)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      {value && (
        <span className={styles.selected} aria-hidden="true">
          <LineBadges lines={STATIONS.get(value)?.lines ?? []} max={3} />
        </span>
      )}
      <ul id={listId} role="listbox" aria-label="역 검색 결과" className={styles.list} hidden={!showList}>
        {results.map((st, i) => (
          // 키보드 조작은 input의 onKeyDown + aria-activedescendant가 담당하므로 option 자체는 포커스를 받지 않는다
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <li
            key={st.name}
            id={optionId(i)}
            role="option"
            aria-selected={i === active}
            className={styles.option}
            // mousedown에서 기본 동작을 막아 input blur보다 선택이 먼저 일어나게 한다
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(st.name)}
            onMouseEnter={() => setActive(i)}
          >
            <span>{st.name}역</span>
            <LineBadges lines={st.lines} max={4} />
          </li>
        ))}
      </ul>
      {showEmpty && (
        <p className={styles.empty} role="status">
          ‘{query.trim()}’ 역을 찾지 못했어요. 가까운 지하철역 이름이나 초성으로 검색해 보세요.
        </p>
      )}
    </div>
  );
}
