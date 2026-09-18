import type { Area, LatLng, Station } from '../types';

/**
 * 지하철 소요 시간 추정 파라미터.
 * 실제 경로 탐색 API 없이도 "누가 얼마나 더 걸리는지" 비교가 가능하도록 단순화한 모델이다.
 */
export const TRANSIT = {
  /** 정차 포함 평균 운행 속도 약 33km/h */
  speedKmPerMin: 0.55,
  /** 선로가 직선이 아니므로 직선거리에 곱하는 우회 계수 */
  detour: 1.3,
  /** 역까지 이동 + 열차 대기 */
  waitMin: 7,
  /** 공유 노선이 없으면 환승 1회로 가정 */
  transferMin: 5,
  /** 이 거리 미만이면 걸어간다 */
  walkThresholdKm: 0.7,
  walkMinPerKm: 15,
} as const;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** 두 지점 사이 대원거리(km) */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface LegEstimate {
  minutes: number;
  walk: boolean;
  direct: boolean;
  km: number;
}

export function estimateLeg(from: Station, to: Pick<Area, 'lat' | 'lng' | 'lines'>): LegEstimate {
  const km = haversineKm(from, to);
  if (km < TRANSIT.walkThresholdKm) {
    return { minutes: Math.max(3, Math.round(km * TRANSIT.walkMinPerKm)), walk: true, direct: true, km };
  }
  const direct = from.lines.some((line) => to.lines.includes(line));
  const ride = (km * TRANSIT.detour) / TRANSIT.speedKmPerMin;
  const minutes = Math.round(TRANSIT.waitMin + ride + (direct ? 0 : TRANSIT.transferMin));
  return { minutes, walk: false, direct, km };
}

export function centroid(points: readonly LatLng[]): LatLng | null {
  if (!points.length) return null;
  const sum = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}
