import type { CSSProperties } from 'react';
import { lineColor } from '../../data/lines';
import { signBackground } from '../../lib/color';
import type { Area } from '../../types';
import { LineBadges } from '../ui/LineBadge';
import styles from './AreaDetail.module.css';

interface Props {
  area: Area;
  modeTitle: string;
  headingId: string;
}

/** 지하철 역명판 모티프: 대표 노선색 띠 위에 동네 이름 */
export function StationSign({ area, modeTitle, headingId }: Props) {
  const bg = signBackground(lineColor(area.lines[0] ?? '2'));
  const hotLabel = area.hot >= 5 ? '요즘 제일 핫함' : area.hot >= 4 ? '요즘 인기' : null;
  return (
    <header className={styles.sign} style={{ '--sign-bg': bg } as CSSProperties}>
      <div className={styles.signTop}>
        <LineBadges lines={area.lines} max={5} ring />
        <span>
          {area.station}역 · {modeTitle} 추천
        </span>
      </div>
      <h2 id={headingId} className={styles.signName}>
        {area.name}
        {hotLabel && <small>{hotLabel}</small>}
      </h2>
    </header>
  );
}
