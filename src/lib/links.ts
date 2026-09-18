import type { Area, PrefKey } from '../types';

const naverMap = (q: string) => `https://map.naver.com/p/search/${encodeURIComponent(q)}`;
const kakaoMap = (q: string) => `https://map.kakao.com/?q=${encodeURIComponent(q)}`;
const naverSearch = (q: string) => `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`;
const instaTag = (tag: string) => `https://www.instagram.com/explore/tags/${encodeURIComponent(tag.replace(/[\s·()]/g, ''))}/`;

export interface ExternalLink {
  id: string;
  label: string;
  href: string;
  /** 서비스 식별용 작은 색 표시 */
  swatch: string;
}

/**
 * 동네별 외부 검색 링크. 맛집·팝업처럼 자주 바뀌는 정보는 앱에 저장하지 않고
 * 지도·검색 서비스로 연결해 항상 최신 정보를 보게 한다.
 */
export function areaLinks(area: Area, groupPrefs: ReadonlySet<PrefKey>): ExternalLink[] {
  const short = area.name.split(/[·\s]/)[0] ?? area.name;
  const food = groupPrefs.has('bar') ? '술집' : groupPrefs.has('cafe') && !groupPrefs.has('food') ? '카페' : '맛집';
  return [
    { id: 'naver', label: `${food} · 네이버지도`, href: naverMap(`${area.station}역 ${food}`), swatch: '#03C75A' },
    { id: 'kakao', label: '맛집 · 카카오맵', href: kakaoMap(`${area.station}역 맛집`), swatch: '#FEE500' },
    { id: 'popup', label: '지금 팝업 검색', href: naverSearch(`${short} 팝업스토어`), swatch: 'var(--popup)' },
    { id: 'play', label: '놀거리 검색', href: naverSearch(`${short} 놀거리`), swatch: 'var(--ink)' },
    { id: 'insta', label: '인스타 태그', href: instaTag(short.endsWith('길') ? short : `${short}핫플`), swatch: '#C13584' },
  ];
}
