/** 노선 식별자. 숫자 호선은 "2", 그 외는 "신분당" 처럼 노선명 */
export type LineId = string;

export type PrefKey =
  | 'food'
  | 'cafe'
  | 'bar'
  | 'game'
  | 'escape'
  | 'exhibit'
  | 'shop'
  | 'show'
  | 'park'
  | 'activity'
  | 'cheap'
  | 'date'
  | 'photo';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Station extends LatLng {
  name: string;
  lines: LineId[];
}

/** 약속 장소 후보가 되는 동네 */
export interface Area extends LatLng {
  id: string;
  name: string;
  /** 대표역 (STATIONS 키) */
  station: string;
  lines: LineId[];
  tags: PrefKey[];
  /** 요즘 인기도 1~5 */
  hot: 1 | 2 | 3 | 4 | 5;
  /** 팝업·행사 빈도 0(드묾) ~ 2(팝업 성지) */
  popup: 0 | 1 | 2;
  spots: string[];
  vibe: string;
}

export interface Member {
  id: string;
  name: string;
  /** 출발역 이름 (STATIONS 키) */
  station: string;
  prefs: PrefKey[];
  /** MEMBER_COLORS 인덱스 */
  colorIndex: number;
}

export type Mode = 'mid' | 'taste' | 'hot';

export interface Leg {
  member: Member;
  minutes: number;
  walk: boolean;
  /** 환승 없이 도착 가능 */
  direct: boolean;
  km: number;
}

export interface Candidate {
  area: Area;
  legs: Leg[];
  avg: number;
  max: number;
  spread: number;
  /** 멤버 취향과 겹치는 태그 (가중치 높은 순) */
  hits: PrefKey[];
  /** 0~1, 그룹 취향 중 이 동네가 충족하는 비율 */
  match: number;
  /** 모드별 비용. 낮을수록 추천 순위가 높다 */
  score: Record<Mode, number>;
}
