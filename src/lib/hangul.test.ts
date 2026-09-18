import { describe, expect, it } from 'vitest';
import { STATION_LIST } from '../data/stations';
import { searchStations, toChosung } from './hangul';

describe('toChosung', () => {
  it('한글 음절을 초성으로 바꾼다', () => {
    expect(toChosung('강남')).toBe('ㄱㄴ');
    expect(toChosung('쌍문')).toBe('ㅆㅁ');
  });

  it('한글이 아닌 글자는 그대로 둔다', () => {
    expect(toChosung('GTX-A 동탄')).toBe('GTX-A ㄷㅌ');
  });
});

describe('searchStations', () => {
  const names = (q: string) => searchStations(q, STATION_LIST).map((s) => s.name);

  it('빈 입력이면 결과 없음', () => {
    expect(names('   ')).toEqual([]);
  });

  it('앞부분 일치 + 짧은 이름이 먼저 온다', () => {
    expect(names('강남').slice(0, 2)).toEqual(['강남', '강남구청']);
  });

  it('"역" 접미사와 공백을 무시한다', () => {
    expect(names('강남역')[0]).toBe('강남');
    expect(names('안산중앙')[0]).toBe('안산 중앙');
  });

  it('초성으로 검색한다', () => {
    expect(names('ㅍㄱ')).toContain('판교');
    expect(names('ㄱㄴ')[0]).toBe('강남');
  });

  it('최대 개수를 지킨다', () => {
    expect(searchStations('ㅅ', STATION_LIST, 5)).toHaveLength(5);
  });
});
