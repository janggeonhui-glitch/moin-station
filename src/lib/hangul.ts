import type { Station } from '../types';

const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
const HANGUL_START = 0xac00;
const HANGUL_COUNT = 11172;
/** 중성(21) × 종성(28) */
const SYLLABLES_PER_CHOSUNG = 588;

/** "강남" → "ㄱㄴ". 한글 음절이 아닌 글자는 그대로 둔다 */
export function toChosung(text: string): string {
  return Array.from(text, (ch) => {
    const offset = ch.charCodeAt(0) - HANGUL_START;
    return offset >= 0 && offset < HANGUL_COUNT ? CHOSUNG[Math.floor(offset / SYLLABLES_PER_CHOSUNG)] : ch;
  }).join('');
}

const isChosungOnly = (text: string) => /^[ㄱ-ㅎ]+$/.test(text);

export const normalizeQuery = (query: string) => query.trim().replace(/\s+/g, '').replace(/역$/, '');

/**
 * 역 이름 검색. 일반 검색과 초성 검색("ㄱㄴ" → 강남)을 모두 지원한다.
 * 정렬: 앞부분 일치 → 짧은 이름 → 가나다순
 */
export function searchStations(query: string, stations: readonly Station[], limit = 8): Station[] {
  const q = normalizeQuery(query);
  if (!q) return [];
  const byChosung = isChosungOnly(q);

  return stations
    .flatMap((station) => {
      const name = station.name.replace(/\s+/g, '');
      const haystack = byChosung ? toChosung(name) : name;
      const index = haystack.indexOf(q);
      return index < 0 ? [] : [{ station, rank: (index === 0 ? 0 : 1000) + name.length }];
    })
    .sort((a, b) => a.rank - b.rank || a.station.name.localeCompare(b.station.name, 'ko'))
    .slice(0, limit)
    .map((x) => x.station);
}
