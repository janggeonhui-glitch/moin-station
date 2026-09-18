import type { Mode } from '../../types';

export const MODES: readonly { mode: Mode; title: string; desc: string }[] = [
  { mode: 'mid', title: '거리 중간', desc: '모두 비슷하게 걸리는 역' },
  { mode: 'taste', title: '취향 저격', desc: '조금 멀어도 딱 맞는 동네' },
  { mode: 'hot', title: '핫플·팝업', desc: '요즘 뜨는 곳, 팝업 성지' },
];

export const tabId = (mode: Mode) => `mode-tab-${mode}`;
