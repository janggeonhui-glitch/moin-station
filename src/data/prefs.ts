import type { PrefKey } from '../types';

export const PREFS: readonly { key: PrefKey; label: string }[] = [
  { key: 'food', label: '맛집' },
  { key: 'cafe', label: '카페' },
  { key: 'bar', label: '술집' },
  { key: 'game', label: '노래방·보드게임' },
  { key: 'escape', label: '방탈출' },
  { key: 'exhibit', label: '전시·팝업' },
  { key: 'shop', label: '쇼핑' },
  { key: 'show', label: '공연·영화' },
  { key: 'park', label: '산책·공원' },
  { key: 'activity', label: '액티비티' },
  { key: 'cheap', label: '가성비' },
  { key: 'date', label: '분위기 좋은' },
  { key: 'photo', label: '사진 명소' },
];

export const PREF_LABEL = Object.fromEntries(PREFS.map((p) => [p.key, p.label])) as Record<PrefKey, string>;

export const isPrefKey = (value: string): value is PrefKey => Object.prototype.hasOwnProperty.call(PREF_LABEL, value);
