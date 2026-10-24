import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { F, useTheme } from './theme';
import { Icon, IconName } from './icons';

type V = 'display' | 'h1' | 'h2' | 'body' | 'small' | 'label' | 'price';
const SIZES: Record<V, TextStyle> = {
  display: { fontFamily: F.display, fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },
  h1: { fontFamily: F.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.3 },
  h2: { fontFamily: F.bold, fontSize: 16, lineHeight: 21 },
  body: { fontFamily: F.body, fontSize: 14.5, lineHeight: 21 },
  small: { fontFamily: F.body, fontSize: 12.5, lineHeight: 17 },
  label: { fontFamily: F.bold, fontSize: 10.5, letterSpacing: 1.4, textTransform: 'uppercase' },
  price: { fontFamily: F.display, fontSize: 20, lineHeight: 24 },
};
export function T({ v = 'body', muted, color, style, children, ...rest }: { v?: V; muted?: boolean; color?: string; style?: StyleProp<TextStyle>; children?: React.ReactNode } & React.ComponentProps<typeof Text>) {
  const { c } = useTheme();
  return <Text {...rest} style={[SIZES[v], { color: color ?? (muted || v === 'small' ? c.muted : c.ink) }, style]}>{children}</Text>;
}

export function Button({ title, onPress, kind = 'primary', icon, loading, disabled, style, small }: {
  title: string; onPress?: () => void; kind?: 'primary' | 'accent' | 'ghost' | 'danger'; icon?: IconName; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean;
}) {
  const { c } = useTheme();
  const bg = kind === 'primary' ? c.primary : kind === 'accent' ? c.accent : kind === 'danger' ? c.danger : 'transparent';
  const fg = kind === 'primary' ? c.onPrimary : kind === 'accent' ? c.onAccent : kind === 'danger' ? '#fff' : c.ink;
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 }, style]}>
      <Pressable
        disabled={disabled || loading}
        onPressIn={() => to(0.97)} onPressOut={() => to(1)}
        onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress?.(); }}
        style={[s.btn, small && { paddingVertical: 9, paddingHorizontal: 14 }, { backgroundColor: bg, borderColor: kind === 'ghost' ? c.line : bg }]}
      >
        {loading ? <ActivityIndicator color={fg} /> : (
          <>
            {icon && <Icon name={icon} size={18} color={fg} />}
            <Text style={{ fontFamily: F.bold, fontSize: small ? 13 : 15, color: fg, letterSpacing: 0.2 }}>{title}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function Chip({ label, active, onPress, style }: { label: string; active?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} style={[s.chip, { backgroundColor: active ? c.ink : 'transparent', borderColor: active ? c.ink : c.line }, style]}>
      <Text style={{ fontFamily: F.semi, fontSize: 13, color: active ? c.bg : c.ink }}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, error, ...p }: TextInputProps & { label: string; error?: string }) {
  const { c } = useTheme();
  const [focus, setFocus] = React.useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <T v="label" muted style={{ marginBottom: 6 }}>{label}</T>
      <TextInput
        placeholderTextColor={c.muted} {...p}
        onFocus={(e) => { setFocus(true); p.onFocus?.(e); }} onBlur={(e) => { setFocus(false); p.onBlur?.(e); }}
        style={[{ fontFamily: F.body, fontSize: 15, color: c.ink, backgroundColor: c.card, borderColor: error ? c.danger : focus ? c.primary : c.line, borderWidth: focus ? 1.5 : 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 }, p.style]}
      />
      {!!error && <T v="small" color={c.danger} style={{ marginTop: 4 }}>{error}</T>}
    </View>
  );
}

export function Stepper({ value, min = 1, max = 99, onChange, step = 1 }: { value: number; min?: number; max?: number; onChange: (n: number) => void; step?: number }) {
  const { c } = useTheme();
  const btn = (name: IconName, delta: number, off: boolean) => (
    <Pressable disabled={off} onPress={() => { Haptics.selectionAsync().catch(() => {}); onChange(Math.min(max, Math.max(min, value + delta))); }}
      style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.3 : 1 }}>
      <Icon name={name} size={16} color={c.ink} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.line, borderRadius: 10, backgroundColor: c.card }}>
      {btn('minus', -step, value <= min)}
      <T v="h2" style={{ minWidth: 30, textAlign: 'center' }}>{value}</T>
      {btn('plus', step, value >= max)}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 14 }, style]}>{children}</View>;
}

export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: c.line }, style]} />;
}

export function Row({ left, right, bold }: { left: string; right: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
      <T v={bold ? 'h2' : 'body'} muted={!bold}>{left}</T>
      <T v={bold ? 'price' : 'body'} style={bold ? undefined : { fontFamily: F.semi }}>{right}</T>
    </View>
  );
}

export function StatusPill({ status }: { status: string }) {
  const { c } = useTheme();
  const map: Record<string, string> = { placed: c.accent, requested: c.accent, confirmed: c.primary, scheduled: c.primary, shipped: '#2F7FD6', delivered: c.ok, completed: c.ok, cancelled: c.danger };
  const col = map[status] || c.muted;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1, borderColor: col }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: col }} />
      <T v="label" color={col} style={{ fontSize: 10 }}>{status}</T>
    </View>
  );
}

export function Empty({ icon, title, hint, action }: { icon: IconName; title: string; hint?: string; action?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: 36, gap: 8 }}>
      <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: c.water, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <Icon name={icon} size={34} color={c.primary} />
      </View>
      <T v="h1" style={{ textAlign: 'center' }}>{title}</T>
      {hint && <T v="body" muted style={{ textAlign: 'center' }}>{hint}</T>}
      {action && <View style={{ marginTop: 10 }}>{action}</View>}
    </View>
  );
}

/** Fade + rise on mount. Cheap, native-driven. */
export function Rise({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, []);
  return <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }, style]}>{children}</Animated.View>;
}

export function Skeleton({ h = 120, style }: { h?: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const v = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.timing(v, { toValue: 0.4, duration: 700, useNativeDriver: true })]));
    l.start(); return () => l.stop();
  }, []);
  return <Animated.View style={[{ height: h, backgroundColor: c.tint, borderRadius: 14, opacity: v }, style]} />;
}

const s = StyleSheet.create({
  btn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1, marginRight: 8 },
});
