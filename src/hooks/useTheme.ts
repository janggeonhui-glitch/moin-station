import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../lib/storage';

export type ThemePref = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const KEY = 'moim:theme';
const ORDER: readonly ThemePref[] = ['system', 'light', 'dark'];
const DARK_QUERY = '(prefers-color-scheme: dark)';

const systemPrefersDark = () =>
  typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches;

/**
 * 시스템 / 라이트 / 다크 3단계 테마.
 * system일 때는 data-theme을 지워 CSS의 prefers-color-scheme가 적용되게 한다.
 */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(() => {
    const saved = readStorage<unknown>(KEY, 'system');
    return ORDER.includes(saved as ThemePref) ? (saved as ThemePref) : 'system';
  });
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (pref === 'system') delete root.dataset.theme;
    else root.dataset.theme = pref;
    writeStorage(KEY, pref);
  }, [pref]);

  const cycle = useCallback(() => setPref((p) => ORDER[(ORDER.indexOf(p) + 1) % ORDER.length]), []);

  const resolved: ResolvedTheme = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref;
  return { pref, resolved, cycle };
}
