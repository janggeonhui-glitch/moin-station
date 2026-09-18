import { MAX_MEMBERS } from '../../data/lines';
import type { NewMember } from '../../hooks/useMeetup';
import type { Member } from '../../types';
import { MemberForm } from './MemberForm';
import { MemberList } from './MemberList';
import styles from './MemberPanel.module.css';

interface Props {
  members: readonly Member[];
  isExample: boolean;
  onAdd: (member: NewMember) => void;
  onRemove: (id: string) => void;
}

export function MemberPanel({ members, isExample, onAdd, onRemove }: Props) {
  return (
    <section className={`panel ${styles.panel}`} aria-labelledby="members-title">
      <div className={styles.head}>
        <p className="eyebrow">모임 멤버 {members.length > 0 && `· ${members.length}명`}</p>
        <h2 id="members-title" className="section-title">
          누가 어디서 출발해요?
        </h2>
      </div>
      <MemberList members={members} onRemove={onRemove} />
      <MemberForm onAdd={onAdd} full={!isExample && members.length >= MAX_MEMBERS} />
    </section>
  );
}
