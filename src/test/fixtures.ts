import type { Member, PrefKey } from '../types';

let seq = 0;

export const member = (station: string, prefs: PrefKey[] = [], name = `친구${++seq}`): Member => ({
  id: `t-${seq}-${station}`,
  name,
  station,
  prefs,
  colorIndex: seq % 10,
});
