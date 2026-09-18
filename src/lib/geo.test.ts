import { describe, expect, it } from 'vitest';
import { STATIONS } from '../data/stations';
import { centroid, estimateLeg, haversineKm, TRANSIT } from './geo';

const st = (name: string) => {
  const s = STATIONS.get(name);
  if (!s) throw new Error(`unknown station ${name}`);
  return s;
};

describe('haversineKm', () => {
  it('강남–잠실은 약 6~7km', () => {
    const km = haversineKm(st('강남'), st('잠실'));
    expect(km).toBeGreaterThan(6);
    expect(km).toBeLessThan(7.5);
  });

  it('같은 지점은 0', () => {
    expect(haversineKm(st('홍대입구'), st('홍대입구'))).toBe(0);
  });
});

describe('estimateLeg', () => {
  it('가까우면 도보로 계산한다', () => {
    const leg = estimateLeg(st('강남'), st('강남'));
    expect(leg).toMatchObject({ walk: true, direct: true, minutes: 3 });
  });

  it('노선이 겹치면 환승 시간이 붙지 않는다', () => {
    const direct = estimateLeg(st('신도림'), { ...st('강남'), lines: ['2'] });
    const transfer = estimateLeg(st('신도림'), { ...st('강남'), lines: ['신분당'] });
    expect(direct.direct).toBe(true);
    expect(transfer.direct).toBe(false);
    expect(transfer.minutes - direct.minutes).toBe(TRANSIT.transferMin);
  });

  it('먼 곳일수록 오래 걸린다', () => {
    const near = estimateLeg(st('노원'), st('상계'));
    const far = estimateLeg(st('노원'), st('판교'));
    expect(far.minutes).toBeGreaterThan(near.minutes);
  });
});

describe('centroid', () => {
  it('빈 배열이면 null', () => {
    expect(centroid([])).toBeNull();
  });

  it('좌표 평균을 돌려준다', () => {
    expect(centroid([{ lat: 37, lng: 127 }, { lat: 38, lng: 126 }])).toEqual({ lat: 37.5, lng: 126.5 });
  });
});
