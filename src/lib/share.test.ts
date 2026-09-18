import { describe, expect, it } from 'vitest';
import { member } from '../test/fixtures';
import { decodeState, encodeState, sanitizeName } from './share';

const strip = (m: { name: string; station: string; prefs: string[]; colorIndex: number }) => ({
  name: m.name,
  station: m.station,
  prefs: m.prefs,
  colorIndex: m.colorIndex,
});

describe('share URL', () => {
  it('인코딩 → 디코딩 왕복 시 모임이 그대로 복원된다', () => {
    const members = [member('노원', ['bar', 'cheap'], '지우'), member('판교', [], '하린')];
    const decoded = decodeState(encodeState({ members, mode: 'taste', areaId: 'seongsu' }));
    expect(decoded?.mode).toBe('taste');
    expect(decoded?.areaId).toBe('seongsu');
    expect(decoded?.members.map(strip)).toEqual(members.map(strip));
  });

  it('기본 모드(mid)와 빈 선택은 URL에 쓰지 않는다', () => {
    const qs = encodeState({ members: [member('강남', [], 'a')], mode: 'mid', areaId: null });
    expect(qs).not.toContain('mode=');
    expect(qs).not.toContain('a=');
  });

  it('m 파라미터가 없으면 null', () => {
    expect(decodeState('?mode=hot')).toBeNull();
  });

  it('없는 역·취향·모드·동네는 버린다', () => {
    const decoded = decodeState('?m=가~없는역~bar~0|나~강남~bar.nope~99&mode=weird&a=atlantis');
    expect(decoded?.members).toHaveLength(1);
    expect(decoded?.members[0]).toMatchObject({ name: '나', station: '강남', prefs: ['bar'] });
    expect(decoded?.members[0]?.colorIndex).toBeLessThan(10);
    expect(decoded?.mode).toBe('mid');
    expect(decoded?.areaId).toBeNull();
  });

  it('이름의 구분자 문자는 제거되고 길이는 12자로 자른다', () => {
    expect(sanitizeName('  가~나|다  ')).toBe('가나다');
    expect(sanitizeName('가'.repeat(20))).toHaveLength(12);
  });

  it('최대 10명까지만 읽는다', () => {
    const many = Array.from({ length: 14 }, (_, i) => `p${i}~강남~~0`).join('|');
    expect(decodeState(`?m=${encodeURIComponent(many)}`)?.members).toHaveLength(10);
  });
});
