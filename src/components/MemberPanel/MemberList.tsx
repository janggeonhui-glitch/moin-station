import { MEMBER_COLORS } from '../../data/lines';
import { PREF_LABEL } from '../../data/prefs';
import { STATIONS } from '../../data/stations';
import type { Member } from '../../types';
import { CloseIcon } from '../ui/Icons';
import { LineBadges } from '../ui/LineBadge';
import styles from './MemberPanel.module.css';

interface Props {
  members: readonly Member[];
  onRemove: (id: string) => void;
}

export function MemberList({ members, onRemove }: Props) {
  if (!members.length) {
    return (
      <p className={styles.emptyList}>
        아직 아무도 없어요. 아래에서 첫 멤버를 추가하세요.
        <br />
        다 넣은 뒤 <b>모임 링크 공유</b>를 누르면 친구들도 같은 화면을 볼 수 있어요.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {members.map((m) => (
        <li key={m.id} className={styles.member}>
          <span className={styles.avatar} style={{ background: MEMBER_COLORS[m.colorIndex] }} aria-hidden="true">
            {m.name.slice(0, 1)}
          </span>
          <div className={styles.memberBody}>
            <span className={styles.memberName}>{m.name}</span>
            <span className={styles.memberStation}>
              {m.station}역 <LineBadges lines={STATIONS.get(m.station)?.lines ?? []} />
            </span>
            {m.prefs.length > 0 && (
              <span className={styles.memberPrefs}>{m.prefs.map((k) => PREF_LABEL[k]).join(' · ')}</span>
            )}
          </div>
          <button
            type="button"
            className={styles.remove}
            onClick={() => onRemove(m.id)}
            aria-label={`${m.name} 빼기`}
          >
            <CloseIcon size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
