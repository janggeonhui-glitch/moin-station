import { AREAS } from '../data/areas';
import { PREF_LABEL } from '../data/prefs';
import { STATIONS } from '../data/stations';
import type { Area, Candidate, Member, Mode, PrefKey, Station } from '../types';
import { estimateLeg } from './geo';

export type PrefWeights = Partial<Record<PrefKey, number>>;

/** 취향별 가중치 = 그 취향을 고른 멤버 비율 (0~1) */
export function prefWeights(members: readonly Member[]): PrefWeights {
  const weights: PrefWeights = {};
  if (!members.length) return weights;
  for (const m of members) {
    for (const key of new Set(m.prefs)) weights[key] = (weights[key] ?? 0) + 1 / members.length;
  }
  return weights;
}

const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/**
 * 모든 후보 동네에 대해 멤버별 예상 소요 시간과 모드별 점수를 계산한다.
 *
 * - mid(거리 중간): 평균·최대 시간과 편차를 함께 줄인다. 최대 시간 비중이 커서
 *   "한 명만 유독 먼" 장소가 뒤로 밀린다. 취향·인기도는 동점 처리용으로만 약하게 반영.
 * - taste(취향 저격): 취향 일치율 비중을 크게 올려, 조금 멀어도 딱 맞는 동네가 올라온다.
 * - hot(핫플·팝업): 인기도·팝업 빈도 중심, 이동 시간은 가벼운 페널티.
 */
export function scoreAreas(
  members: readonly Member[],
  areas: readonly Area[] = AREAS,
  stations: ReadonlyMap<string, Station> = STATIONS,
): Candidate[] {
  const located = members.flatMap((member) => {
    const station = stations.get(member.station);
    return station ? [{ member, station }] : [];
  });
  if (!located.length) return [];

  const weights = prefWeights(located.map((x) => x.member));
  const weightTotal = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const wantsExhibit = (weights.exhibit ?? 0) > 0;

  return areas.map((area) => {
    const legs = located.map(({ member, station }) => ({ member, ...estimateLeg(station, area) }));
    const minutes = legs.map((l) => l.minutes);
    const avg = mean(minutes);
    const max = Math.max(...minutes);
    const spread = max - Math.min(...minutes);
    const hits = area.tags
      .filter((t) => (weights[t] ?? 0) > 0)
      .sort((a, b) => (weights[b] ?? 0) - (weights[a] ?? 0));
    const match = hits.reduce((sum, t) => sum + (weights[t] ?? 0), 0) / weightTotal;
    const fairnessCost = 0.45 * avg + 0.4 * max + 0.15 * spread;

    return {
      area,
      legs,
      avg,
      max,
      spread,
      hits,
      match,
      score: {
        mid: fairnessCost - 4 * match - 0.4 * area.hot,
        taste: 0.3 * avg + 0.2 * max - 34 * match - 2.5 * area.hot - (wantsExhibit ? 3 * area.popup : 0),
        hot: -(area.hot * 3 + area.popup * 3.2 + 7 * match) + avg / 9,
      },
    };
  });
}

export function rankCandidates(candidates: readonly Candidate[], mode: Mode, limit = 7): Candidate[] {
  return [...candidates].sort((a, b) => a.score[mode] - b.score[mode]).slice(0, limit);
}

export type FairnessTone = 'good' | 'warn';

export function fairness(spread: number): { label: string; tone: FairnessTone } {
  if (spread <= 10) return { label: '매우 공평', tone: 'good' };
  if (spread <= 20) return { label: '공평한 편', tone: 'good' };
  if (spread <= 35) return { label: '한 명이 좀 멀어요', tone: 'warn' };
  return { label: '누군가 많이 멀어요', tone: 'warn' };
}

/** 후보 목록에 한 줄로 보여줄 추천 이유 */
export function reasonFor(c: Candidate, mode: Mode, isTop: boolean): string {
  const topHits = c.hits
    .slice(0, 2)
    .map((k) => PREF_LABEL[k])
    .join('·');
  switch (mode) {
    case 'mid':
      if (isTop) return `가장 먼 사람도 ${c.max}분 안에 도착`;
      return topHits ? `${topHits} 취향까지 챙기는 선택` : `평균 ${Math.round(c.avg)}분`;
    case 'taste':
      return c.hits.length ? `취향 ${c.hits.length}개 일치 · ${topHits}` : '취향 겹치는 곳이 적어요';
    case 'hot':
      if (c.area.popup === 2) return '팝업·행사가 자주 열리는 곳';
      return c.area.hot >= 4 ? '요즘 사람 많은 곳' : '취향 맞는 동네';
  }
}
