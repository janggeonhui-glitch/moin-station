/** 24×32 핀 모양 (머리 중심 12,12 · 끝점 12,32) */
const PIN = 'M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z';

function Pin({ x, y, scale, color }: { x: number; y: number; scale: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={PIN} fill={color} />
      <circle cx="12" cy="12" r="4.6" fill="#fff" />
    </g>
  );
}

/**
 * centro 로고: 양쪽 출발지 핀 두 개와, 그 사이 가운데 지점의 약속 장소 핀.
 * 점선이 세 핀의 끝점을 이어 "각자의 출발지 → 가운데서 만남"을 표현한다.
 */
export function LogoMark({ size = 48, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d="M11 49 Q32 60 53 49"
        fill="none"
        stroke="#9AA59F"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="3 3.4"
      />
      <Pin x={4} y={30} scale={0.58} color="#0052A4" />
      <Pin x={46} y={30} scale={0.58} color="#EF7C1C" />
      <Pin x={18.8} y={19} scale={1.1} color="#00A650" />
    </svg>
  );
}
