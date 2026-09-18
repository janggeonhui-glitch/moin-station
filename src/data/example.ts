import type { Member } from '../types';

/** 첫 방문 시 앱이 어떻게 동작하는지 보여주는 예시 모임 */
export const EXAMPLE_MEMBERS: readonly Member[] = [
  { id: 'ex-1', name: '지우', station: '노원', prefs: ['bar', 'cheap', 'game'], colorIndex: 0 },
  { id: 'ex-2', name: '태현', station: '신도림', prefs: ['food', 'show', 'bar'], colorIndex: 1 },
  { id: 'ex-3', name: '하린', station: '판교', prefs: ['cafe', 'exhibit', 'photo'], colorIndex: 2 },
];
