import { AREA_BY_ID } from '../data/areas';
import { MAX_MEMBERS, MEMBER_COLORS } from '../data/lines';
import { isPrefKey } from '../data/prefs';
import { STATIONS } from '../data/stations';
import type { Member, Mode } from '../types';
import { createId } from './id';

/**
 * 모임 상태를 URL 쿼리로 직렬화한다. 서버 없이 링크 하나로 같은 모임을 연다.
 *
 *   ?m=지우~노원~bar.cheap~0|태현~신도림~food~1&mode=taste&a=seongsu
 */
export interface ShareState {
  members: Member[];
  mode: Mode;
  areaId: string | null;
}

const MODES: readonly Mode[] = ['mid', 'taste', 'hot'];
export const NAME_MAX = 12;

/** 구분자로 쓰는 문자는 이름에서 제거 */
export const sanitizeName = (name: string) => name.replace(/[~|]/g, '').trim().slice(0, NAME_MAX);

export function encodeState({ members, mode, areaId }: ShareState): string {
  const params = new URLSearchParams();
  if (members.length) {
    params.set(
      'm',
      members.map((m) => [sanitizeName(m.name), m.station, m.prefs.join('.'), m.colorIndex].join('~')).join('|'),
    );
  }
  if (mode !== 'mid') params.set('mode', mode);
  if (areaId) params.set('a', areaId);
  return params.toString();
}

/** 알 수 없는 역·취향·모드는 조용히 버린다 (링크가 오래돼도 앱이 깨지지 않게) */
export function decodeState(search: string): ShareState | null {
  const params = new URLSearchParams(search);
  const raw = params.get('m');
  if (!raw) return null;

  const members: Member[] = [];
  for (const chunk of raw.split('|')) {
    const [rawName = '', station = '', prefs = '', color = ''] = chunk.split('~');
    const name = sanitizeName(rawName);
    if (!name || !STATIONS.has(station)) continue;
    const colorIndex = Number(color);
    members.push({
      id: createId(),
      name,
      station,
      prefs: [...new Set(prefs.split('.').filter(isPrefKey))],
      colorIndex:
        Number.isInteger(colorIndex) && colorIndex >= 0 && colorIndex < MEMBER_COLORS.length
          ? colorIndex
          : members.length % MEMBER_COLORS.length,
    });
    if (members.length >= MAX_MEMBERS) break;
  }
  if (!members.length) return null;

  const mode = params.get('mode');
  const areaId = params.get('a');
  return {
    members,
    mode: MODES.includes(mode as Mode) ? (mode as Mode) : 'mid',
    areaId: areaId && AREA_BY_ID.has(areaId) ? areaId : null,
  };
}
