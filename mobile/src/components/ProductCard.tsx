import React, { useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { Icon } from '../icons';
import { T } from '../ui';
import { inr, pctOff } from '../format';
import { useAuth } from '../auth';
import type { Product } from '../types';

export function ProductCard({ p, onPress, onAdd, width }: { p: Product; onPress: () => void; onAdd: () => void; width: number }) {
  const { c } = useTheme();
  const { isDealer, unitPrice, minQty } = useAuth();
  const bump = useRef(new Animated.Value(1)).current;
  const price = unitPrice(p);
  const off = pctOff(p.mrp, price);
  const tap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.sequence([Animated.timing(bump, { toValue: 1.25, duration: 110, useNativeDriver: true }), Animated.spring(bump, { toValue: 1, useNativeDriver: true })]).start();
    onAdd();
  };
  return (
    <Pressable onPress={onPress} style={{ width, marginBottom: 14 }}>
      <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.line, backgroundColor: c.card }}>
        <Image source={{ uri: p.image }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" transition={250} />
        {off > 0 && (
          <View style={{ position: 'absolute', top: 10, left: 0, backgroundColor: isDealer ? c.primary : c.accent, paddingVertical: 3, paddingLeft: 8, paddingRight: 12, borderTopRightRadius: 99, borderBottomRightRadius: 99 }}>
            <T v="label" color={isDealer ? c.onPrimary : c.onAccent} style={{ fontSize: 9.5 }}>{isDealer ? 'Wholesale' : `${off}% off`}</T>
          </View>
        )}
        <View style={{ padding: 11, gap: 3 }}>
          <T v="label" muted style={{ fontSize: 9.5 }}>{p.category}</T>
          <T v="h2" numberOfLines={2} style={{ fontSize: 13.5, lineHeight: 18, minHeight: 36 }}>{p.name}</T>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
            <View>
              <T v="price" style={{ fontSize: 18 }}>{inr(price)}</T>
              <T v="small" style={{ textDecorationLine: 'line-through' }}>{inr(p.mrp)}</T>
            </View>
            <Animated.View style={{ transform: [{ scale: bump }] }}>
              <Pressable onPress={tap} hitSlop={8} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={18} color={c.onPrimary} stroke={2.2} />
              </Pressable>
            </Animated.View>
          </View>
          {isDealer && <T v="small" style={{ marginTop: 2 }}>Min. {minQty(p)} units</T>}
        </View>
      </View>
    </Pressable>
  );
}
