import { useId, useMemo } from 'react';
import { PREF_LABEL } from '../../data/prefs';
import { areaLinks } from '../../lib/links';
import { fairness } from '../../lib/scoring';
import type { Candidate, Member } from '../../types';
import { ExternalIcon } from '../ui/Icons';
import styles from './AreaDetail.module.css';
import { StationSign } from './StationSign';
import { TravelBars } from './TravelBars';

interface Props {
  candidate: Candidate;
  members: readonly Member[];
  modeTitle: string;
}

function transferNote(c: Candidate): string {
  const direct = c.legs.filter((l) => l.direct).map((l) => l.member.name);
  if (direct.length === c.legs.length) return '모두 환승 없이 갈 수 있어요';
  if (!direct.length) return '모두 한 번 이상 환승이 필요할 수 있어요';
  return `${direct.join(', ')} — 환승 없이 도착`;
}

export function AreaDetail({ candidate: c, members, modeTitle }: Props) {
  const headingId = useId();
  const { area } = c;
  const fair = fairness(c.spread);
  const groupPrefs = useMemo(() => new Set(members.flatMap((m) => m.prefs)), [members]);
  const links = useMemo(() => areaLinks(area, groupPrefs), [area, groupPrefs]);

  return (
    <article className={`panel ${styles.detail}`} aria-labelledby={headingId}>
      <StationSign area={area} modeTitle={modeTitle} headingId={headingId} />

      <div className={styles.body}>
        <p className={styles.vibe}>{area.vibe}</p>

        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt>평균 소요</dt>
            <dd>{Math.round(c.avg)}분</dd>
          </div>
          <div className={styles.stat}>
            <dt>가장 먼 사람</dt>
            <dd>{c.max}분</dd>
          </div>
          <div className={styles.stat}>
            <dt>편차 {c.spread}분</dt>
            <dd className={styles.statText} data-tone={fair.tone}>
              {fair.label}
            </dd>
          </div>
        </dl>

        <section className={styles.section}>
          <h3>
            각자 걸리는 시간 <span className="hint">추정치</span>
          </h3>
          <TravelBars legs={c.legs} />
          <p className="hint">{transferNote(c)}</p>
        </section>

        <section className={styles.section}>
          <h3>
            취향 매칭 <span className="hint">진한 칩 = 멤버 취향과 일치</span>
          </h3>
          <ul className={styles.tags}>
            {area.tags.map((t) => {
              const hit = c.hits.includes(t);
              return (
                <li key={t} className={styles.tagChip} data-hit={hit}>
                  {PREF_LABEL[t]}
                  {hit && <span className="sr-only"> (취향 일치)</span>}
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.section}>
          <h3>이 동네 놀거리</h3>
          <ul className={styles.spots}>
            {area.spots.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h3>
            지금 정보 찾기 <span className="hint">맛집·팝업은 자주 바뀌어서 최신 검색으로 연결해요</span>
          </h3>
          <div className={styles.links}>
            {links.map((l) => (
              <a key={l.id} className={styles.link} href={l.href} target="_blank" rel="noopener noreferrer">
                <i style={{ background: l.swatch }} aria-hidden="true" />
                {l.label}
                <ExternalIcon size={13} />
                <span className="sr-only">(새 탭에서 열림)</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
