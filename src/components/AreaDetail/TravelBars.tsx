import { MEMBER_COLORS } from '../../data/lines';
import type { Leg } from '../../types';
import styles from './AreaDetail.module.css';

/** 멤버별 예상 소요 시간 가로 막대. 가장 오래 걸리는 사람이 100% */
export function TravelBars({ legs }: { legs: readonly Leg[] }) {
  const longest = Math.max(1, ...legs.map((l) => l.minutes));
  return (
    <ul className={styles.bars}>
      {legs.map((leg) => (
        <li key={leg.member.id} className={styles.bar}>
          <span className={styles.barWho}>{leg.member.name}</span>
          <span className={styles.barTrack} aria-hidden="true">
            <span
              className={styles.barFill}
              style={{
                width: `${Math.max(6, (leg.minutes / longest) * 100)}%`,
                background: MEMBER_COLORS[leg.member.colorIndex],
              }}
            />
          </span>
          <span className={styles.barMin}>
            {leg.walk ? '도보 ' : ''}
            {leg.minutes}분
          </span>
        </li>
      ))}
    </ul>
  );
}
