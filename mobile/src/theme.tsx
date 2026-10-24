import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const light = {
  bg: '#F6F1E7', card: '#FFFDF8', ink: '#10211F', muted: '#5E6B68', line: '#DDD5C3', tint: '#EAE3D2',
  primary: '#0F4C4A', onPrimary: '#F6F1E7', accent: '#E8A33D', onAccent: '#2A1D05',
  danger: '#B3382C', ok: '#2E7D5B', water: '#CFE3E1',
};
export const dark: typeof light = {
  bg: '#0B1514', card: '#132220', ink: '#EFE9DB', muted: '#9AA8A4', line: '#243634', tint: '#1A302D',
  primary: '#5CC2B6', onPrimary: '#06201E', accent: '#F0B04F', onAccent: '#2A1D05',
  danger: '#E2705F', ok: '#5CC2A0', water: '#1E3B38',
};
export type Palette = typeof light;
export type Mode = 'system' | 'light' | 'dark';

export const F = {
  display: 'Fraunces_600SemiBold', displayItalic: 'Fraunces_600SemiBold_Italic',
  body: 'Manrope_500Medium', semi: 'Manrope_600SemiBold', bold: 'Manrope_700Bold', xbold: 'Manrope_800ExtraBold',
};

interface Ctx { c: Palette; isDark: boolean; mode: Mode; setMode: (m: Mode) => void }
const ThemeCtx = createContext<Ctx>({ c: light, isDark: false, mode: 'system', setMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme();
  const [mode, setModeState] = useState<Mode>('system');
  useEffect(() => {
    AsyncStorage.getItem('theme-mode').then((m) => { if (m === 'light' || m === 'dark' || m === 'system') setModeState(m); }).catch(() => {});
  }, []);
  const setMode = (m: Mode) => { setModeState(m); AsyncStorage.setItem('theme-mode', m).catch(() => {}); };
  const isDark = mode === 'system' ? sys === 'dark' : mode === 'dark';
  const value = useMemo(() => ({ c: isDark ? dark : light, isDark, mode, setMode }), [isDark, mode]);
  useEffect(() => { Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode); }, [mode]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);
