const INK = '#15201B';
const WHITE = '#FFFFFF';

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (rgb: [number, number, number]) =>
  `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

/** WCAG 상대 휘도 */
export function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** 배경색 위에서 흰 글자가 minRatio 이상이면 흰색, 아니면 진한 잉크색 */
export function readableText(background: string, minRatio = 3): string {
  return contrast(background, WHITE) >= minRatio ? WHITE : INK;
}

/** 검정 쪽으로 amount(0~1)만큼 어둡게 */
export function shade(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return toHex(rgb.map((v) => v * (1 - amount)) as [number, number, number]);
}

/**
 * 역명판 배경: 노선색을 흰 글자가 WCAG AA(4.5:1)를 넘을 때까지 조금씩 어둡게.
 * 2호선 초록처럼 원색 그대로면 대비가 모자란 노선도 브랜드 색감을 유지한 채 읽힌다.
 */
export function signBackground(lineHex: string): string {
  let bg = lineHex;
  for (let i = 0; i < 12 && contrast(bg, WHITE) < 4.5; i++) bg = shade(lineHex, (i + 1) * 0.06);
  return bg;
}
