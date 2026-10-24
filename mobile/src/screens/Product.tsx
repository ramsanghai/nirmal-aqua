import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import { useData } from '../data';
import { useTheme } from '../theme';
import { Icon } from '../icons';
import { Button, Rise, Rule, Stepper, T } from '../ui';
import { Lightbox } from '../components/Lightbox';
import { inr, pctOff } from '../format';
import type { Nav, RootStack } from '../nav';

export function ProductScreen() {
  const { c } = useTheme();
  const nav = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStack, 'Product'>>();
  const insets = useSafeAreaInsets();
  const { byId } = useData();
  const { isDealer, unitPrice, minQty } = useAuth();
  const { add, count } = useCart();
  const p = byId[params.id];
  const [qty, setQty] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const [added, setAdded] = useState(false);
  if (!p) return null;

  const q = qty ?? minQty(p);
  const price = unitPrice(p);
  const off = pctOff(p.mrp, price);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <Pressable onPress={() => setZoom(true)}>
          <Image source={{ uri: p.image }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" transition={300} />
          <View style={{ position: 'absolute', right: 14, bottom: 14, flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(16,33,31,0.78)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99 }}>
            <Icon name="zoom" size={15} color="#EFE9DB" /><T v="label" color="#EFE9DB" style={{ fontSize: 9.5 }}>Tap to zoom</T>
          </View>
        </Pressable>
        <Pressable onPress={() => nav.goBack()} style={{ position: 'absolute', top: insets.top + 10, left: 14, width: 42, height: 42, borderRadius: 21, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.line }}>
          <Icon name="left" color={c.ink} />
        </Pressable>
        <Pressable onPress={() => nav.navigate('Tabs', { screen: 'Cart' })} style={{ position: 'absolute', top: insets.top + 10, right: 14, width: 42, height: 42, borderRadius: 21, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.line }}>
          <Icon name="cart" color={c.ink} />
          {count > 0 && <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}><T v="label" color={c.onAccent} style={{ fontSize: 9 }}>{count}</T></View>}
        </Pressable>

        <Rise style={{ padding: 18 }}>
          <T v="label" color={c.primary}>{p.category} · {p.brand}</T>
          <T v="display" style={{ fontSize: 28, lineHeight: 33, marginTop: 4 }}>{p.name}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Icon name="star" size={16} color={c.accent} fill={c.accent} />
            <T v="h2" style={{ fontSize: 14 }}>{p.rating.toFixed(1)}</T><T v="small">· {p.reviews} reviews</T>
            <T v="small" color={p.stock > 5 ? c.ok : c.danger} style={{ marginLeft: 'auto' }}>{p.stock > 5 ? 'In stock' : p.stock > 0 ? `Only ${p.stock} left` : 'Out of stock'}</T>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 16 }}>
            <T v="display" style={{ fontSize: 34 }}>{inr(price)}</T>
            <T v="body" muted style={{ textDecorationLine: 'line-through', marginBottom: 5 }}>{inr(p.mrp)}</T>
            {off > 0 && <T v="h2" color={c.ok} style={{ marginBottom: 5 }}>{off}% off</T>}
          </View>
          {isDealer
            ? <T v="small" style={{ marginTop: 4 }}>Wholesale rate · retail {inr(p.price)} · min. order {p.minBulkQty} units</T>
            : <T v="small" style={{ marginTop: 4 }}>Inclusive of GST · free delivery above ₹1,999</T>}

          <Rule style={{ marginVertical: 18 }} />
          <T v="body">{p.description}</T>

          <T v="label" muted style={{ marginTop: 22, marginBottom: 6 }}>Specification</T>
          {p.specs.map((s, i) => (
            <View key={s}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
                <T v="body" style={{ fontFamily: 'Manrope_600SemiBold' }}>{s}</T>
              </View>
              {i < p.specs.length - 1 && <Rule />}
            </View>
          ))}
        </Rise>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: insets.bottom + 12, paddingTop: 12, paddingHorizontal: 16, backgroundColor: c.bg, borderTopWidth: 1, borderColor: c.line, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Stepper value={q} min={minQty(p)} max={Math.max(minQty(p), p.stock)} onChange={setQty} />
        <Button style={{ flex: 1 }} kind={added ? 'accent' : 'primary'} icon={added ? 'check' : 'cart'} disabled={p.stock < 1}
          title={added ? 'Added · view cart' : `Add · ${inr(price * q)}`}
          onPress={() => { if (added) return nav.navigate('Tabs', { screen: 'Cart' }); add(p, q); setAdded(true); setTimeout(() => setAdded(false), 4000); }} />
      </View>
      <Lightbox uri={zoom ? p.image : null} title={p.name} onClose={() => setZoom(false)} />
    </View>
  );
}
