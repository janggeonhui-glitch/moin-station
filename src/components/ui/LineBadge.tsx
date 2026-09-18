import { lineColor, lineLabel, lineShort } from '../../data/lines';
import { readableText } from '../../lib/color';
import { cx } from '../../lib/cx';
import type { LineId } from '../../types';
import styles from './LineBadge.module.css';

interface Props {
  line: LineId;
  /** 색 배경 위(역명판)에 올릴 때 흰 테두리 */
  ring?: boolean;
}

export function LineBadge({ line, ring }: Props) {
  const short = lineShort(line);
  const bg = lineColor(line);
  return (
    <span
      className={cx(styles.badge, short.length === 1 && styles.round, ring && styles.ring)}
      style={{ background: bg, color: readableText(bg) }}
      title={lineLabel(line)}
    >
      <span aria-hidden="true">{short}</span>
      <span className="sr-only">{lineLabel(line)}</span>
    </span>
  );
}

export function LineBadges({ lines, max = 4, ring }: { lines: readonly LineId[]; max?: number; ring?: boolean }) {
  return (
    <span className={styles.group}>
      {lines.slice(0, max).map((l) => (
        <LineBadge key={l} line={l} ring={ring} />
      ))}
    </span>
  );
}
