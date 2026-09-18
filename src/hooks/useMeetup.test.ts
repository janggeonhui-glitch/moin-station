import { describe, expect, it } from 'vitest';
import { EXAMPLE_MEMBERS } from '../data/example';
import { MAX_MEMBERS } from '../data/lines';
import { meetupReducer, type MeetupState } from './useMeetup';

const base = (patch: Partial<MeetupState> = {}): MeetupState => ({
  members: [],
  mode: 'mid',
  selectedId: null,
  isExample: false,
  ...patch,
});

const add = (state: MeetupState, name = '민지') =>
  meetupReducer(state, { type: 'add', member: { name, station: '강남', prefs: [] } });

describe('meetupReducer', () => {
  it('예시를 보던 중 멤버를 추가하면 예시가 비워진다', () => {
    const next = add(base({ members: [...EXAMPLE_MEMBERS], isExample: true }));
    expect(next.isExample).toBe(false);
    expect(next.members.map((m) => m.name)).toEqual(['민지']);
  });

  it('빈 색 슬롯을 재사용한다', () => {
    let s = add(add(add(base(), 'a'), 'b'), 'c');
    s = meetupReducer(s, { type: 'remove', id: s.members[1]!.id });
    s = add(s, 'd');
    expect(s.members.map((m) => m.colorIndex)).toEqual([0, 2, 1]);
  });

  it(`최대 ${MAX_MEMBERS}명을 넘기지 않는다`, () => {
    let s = base();
    for (let i = 0; i < MAX_MEMBERS + 3; i++) s = add(s, `p${i}`);
    expect(s.members).toHaveLength(MAX_MEMBERS);
  });

  it('모드를 바꾸면 선택한 동네가 초기화된다', () => {
    const s = meetupReducer(base({ selectedId: 'seongsu' }), { type: 'setMode', mode: 'hot' });
    expect(s).toMatchObject({ mode: 'hot', selectedId: null });
  });
});
