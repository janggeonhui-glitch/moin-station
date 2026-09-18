import { describe, expect, it } from 'vitest';
import { member } from '../test/fixtures';
import { fairness, prefWeights, rankCandidates, reasonFor, scoreAreas } from './scoring';

describe('prefWeights', () => {
  it('취향을 고른 멤버 비율을 가중치로 쓴다', () => {
    const w = prefWeights([member('강남', ['bar', 'cafe']), member('잠실', ['bar'])]);
    expect(w.bar).toBeCloseTo(1);
    expect(w.cafe).toBeCloseTo(0.5);
  });

  it('한 사람이 같은 취향을 중복으로 넣어도 한 번만 센다', () => {
    expect(prefWeights([member('강남', ['bar', 'bar'])]).bar).toBeCloseTo(1);
  });
});

describe('scoreAreas', () => {
  it('멤버가 없으면 후보도 없다', () => {
    expect(scoreAreas([])).toEqual([]);
  });

  it('알 수 없는 역의 멤버는 계산에서 빠진다', () => {
    const [first] = scoreAreas([member('강남'), member('없는역')]);
    expect(first?.legs).toHaveLength(1);
  });

  it('모두 강남에서 출발하면 거리 중간 1위는 강남', () => {
    const ranked = rankCandidates(scoreAreas([member('강남'), member('강남')]), 'mid');
    expect(ranked[0]?.area.id).toBe('gangnam');
  });

  it('거리 중간 1위는 "한 명만 유독 먼" 곳보다 최대 소요 시간이 짧다', () => {
    const members = [member('노원'), member('신도림'), member('판교')];
    const all = scoreAreas(members);
    const top = rankCandidates(all, 'mid')[0];
    const suwon = all.find((c) => c.area.id === 'suwon');
    expect(top && suwon && top.max < suwon.max).toBe(true);
  });

  it('취향 저격 1위는 그룹 취향과 겹친다', () => {
    const members = [member('노원', ['exhibit', 'photo']), member('신도림', ['exhibit'])];
    const top = rankCandidates(scoreAreas(members), 'taste')[0];
    expect(top?.hits).toContain('exhibit');
  });

  it('핫플·팝업 상위권은 인기 동네다', () => {
    const top3 = rankCandidates(scoreAreas([member('강남')]), 'hot', 3);
    for (const c of top3) expect(c.area.hot).toBeGreaterThanOrEqual(4);
  });

  it('순위는 점수 오름차순이고 limit를 지킨다', () => {
    const ranked = rankCandidates(scoreAreas([member('노원'), member('판교')]), 'mid', 5);
    expect(ranked).toHaveLength(5);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i]!.score.mid).toBeGreaterThanOrEqual(ranked[i - 1]!.score.mid);
    }
  });
});

describe('fairness', () => {
  it.each([
    [0, '매우 공평', 'good'],
    [15, '공평한 편', 'good'],
    [30, '한 명이 좀 멀어요', 'warn'],
    [50, '누군가 많이 멀어요', 'warn'],
  ] as const)('편차 %i분 → %s', (spread, label, tone) => {
    expect(fairness(spread)).toEqual({ label, tone });
  });
});

describe('reasonFor', () => {
  it('거리 중간 1위는 최대 소요 시간을 설명한다', () => {
    const top = rankCandidates(scoreAreas([member('강남'), member('잠실')]), 'mid')[0]!;
    expect(reasonFor(top, 'mid', true)).toBe(`가장 먼 사람도 ${top.max}분 안에 도착`);
  });
});
