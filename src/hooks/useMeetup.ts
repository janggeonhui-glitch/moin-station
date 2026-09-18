import { useCallback, useEffect, useReducer } from 'react';
import { EXAMPLE_MEMBERS } from '../data/example';
import { MAX_MEMBERS, MEMBER_COLORS } from '../data/lines';
import { createId } from '../lib/id';
import { decodeState, encodeState } from '../lib/share';
import { readStorage, writeStorage } from '../lib/storage';
import type { Member, Mode } from '../types';

export interface MeetupState {
  members: Member[];
  mode: Mode;
  selectedId: string | null;
  /** 첫 방문 예시 데이터를 보여주는 중인지 */
  isExample: boolean;
}

export type NewMember = Omit<Member, 'id' | 'colorIndex'>;

export type MeetupAction =
  | { type: 'add'; member: NewMember }
  | { type: 'remove'; id: string }
  | { type: 'setMode'; mode: Mode }
  | { type: 'select'; id: string }
  | { type: 'startFresh' };

const STORAGE_KEY = 'moim:v1';

const exampleState = (): MeetupState => ({
  members: [...EXAMPLE_MEMBERS],
  mode: 'mid',
  selectedId: null,
  isExample: true,
});

export function meetupReducer(state: MeetupState, action: MeetupAction): MeetupState {
  switch (action.type) {
    case 'add': {
      // 예시를 보던 중 첫 멤버를 추가하면 예시를 비우고 새 모임을 시작한다
      const base = state.isExample ? [] : state.members;
      if (base.length >= MAX_MEMBERS) return state;
      const used = new Set(base.map((m) => m.colorIndex));
      const free = MEMBER_COLORS.findIndex((_, i) => !used.has(i));
      const member: Member = {
        ...action.member,
        id: createId(),
        colorIndex: free >= 0 ? free : base.length % MEMBER_COLORS.length,
      };
      return { ...state, isExample: false, selectedId: null, members: [...base, member] };
    }
    case 'remove':
      return { ...state, members: state.members.filter((m) => m.id !== action.id) };
    case 'setMode':
      return { ...state, mode: action.mode, selectedId: null };
    case 'select':
      return { ...state, selectedId: action.id };
    case 'startFresh':
      return { members: [], mode: 'mid', selectedId: null, isExample: false };
  }
}

/** 우선순위: 공유 링크(URL) → 이 기기에 저장된 모임 → 예시 */
function initState(): MeetupState {
  const fromUrl = decodeState(window.location.search);
  if (fromUrl) return { members: fromUrl.members, mode: fromUrl.mode, selectedId: fromUrl.areaId, isExample: false };

  const saved = readStorage<unknown>(STORAGE_KEY, null);
  const fromStorage = typeof saved === 'string' ? decodeState(saved) : null;
  if (fromStorage) {
    return { members: fromStorage.members, mode: fromStorage.mode, selectedId: fromStorage.areaId, isExample: false };
  }
  return exampleState();
}

const toQuery = (s: MeetupState) =>
  s.isExample ? '' : encodeState({ members: s.members, mode: s.mode, areaId: s.selectedId });

export function useMeetup() {
  const [state, dispatch] = useReducer(meetupReducer, undefined, initState);

  // URL과 localStorage를 상태와 동기화 — 새로고침·링크 공유 모두 같은 화면을 복원한다
  useEffect(() => {
    const query = toQuery(state);
    const { pathname, hash } = window.location;
    window.history.replaceState(null, '', `${pathname}${query ? `?${query}` : ''}${hash}`);
    writeStorage(STORAGE_KEY, query || null);
  }, [state]);

  const buildShareUrl = useCallback(() => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}?${toQuery(state)}`;
  }, [state]);

  return { state, dispatch, buildShareUrl };
}
