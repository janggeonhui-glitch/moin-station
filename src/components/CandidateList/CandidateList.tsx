import { fairness, reasonFor } from '../../lib/scoring';
import type { Candidate, Mode } from '../../types';
import { LineBadges } from '../ui/LineBadge';
import { Tag } from '../ui/Tag';
import styles from './CandidateList.module.css';

interface Props {
  candidates: readonly Candidate[];
  mode: Mode;
  selectedId: string | undefined;
  onSelect: (areaId: string) => void;
}

export function CandidateList({ candidates, mode, selectedId, onSelect }: Props) {
  return (
    <ol className={`panel ${styles.list}`} aria-label="추천 후보 순위">
      {candidates.map((c, i) => {
        const fair = fairness(c.spread);
        const selected = c.area.id === selectedId;
        return (
          <li key={c.area.id}>
            <button
              type="button"
              className={styles.item}
              aria-current={selected ? 'true' : undefined}
              onClick={() => onSelect(c.area.id)}
            >
              <span className={styles.rank} aria-hidden="true">
                {i + 1}
              </span>
              <span className={styles.body}>
                <span className={styles.name}>
                  {c.area.name}
                  <LineBadges lines={c.area.lines} max={3} />
                  {c.area.popup === 2 && <Tag tone="popup">팝업 성지</Tag>}
                  {(mode === 'mid' || fair.tone === 'warn') && <Tag tone={fair.tone}>{fair.label}</Tag>}
                </span>
                <span className={styles.reason}>{reasonFor(c, mode, i === 0)}</span>
              </span>
              <span className={styles.minutes}>
                평균 {Math.round(c.avg)}분<small>최대 {c.max}분</small>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
