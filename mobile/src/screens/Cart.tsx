import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import { useTheme } from '../theme';
import { Icon } from '../icons';
import { Button, Card, Empty, Row, Stepper, T } from '../ui';
import { inr } from '../format';
import type { Nav } from '../nav';

export function CartScreen() {
  const { c } = useTheme();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { isDealer, minQty } = useAuth();
  const { lines, subtotal, setQty, remove, count } = useCart();
  const delivery = isDealer || subtotal >= 1999 || subtotal === 0 ? 0 : 99;

  if (!lines.length)
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', paddingTop: insets.top }}>
        <Empty icon="cart" title="Your cart is empty" hint="Add a purifier, pump or filter and it will wait for you here."
          action={<Button title="Browse the shop" onPress={() => nav.navigate('Tabs', { screen: 'Shop' })} />} />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={lines} keyExtractor={(l) => l.product.id}
        contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 150 }}
        ListHeaderComponent={<View style={{ marginBottom: 14 }}><T v="label" muted>{count} item{count > 1 ? 's' : ''}</T><T v="display" style={{ fontSize: 30 }}>Your cart</T></View>}
        renderItem={({ item: { product: p, qty, unit } }) => (
          <Card style={{ flexDirection: 'row', gap: 12, marginBottom: 12, padding: 10 }}>
            <Pressable onPress={() => nav.navigate('Product', { id: p.id })}>
              <Image source={{ uri: p.image }} style={{ width: 86, height: 86, borderRadius: 10 }} contentFit="cover" />
            </Pressable>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <T v="h2" numberOfLines={2} style={{ flex: 1, fontSize: 14 }}>{p.name}</T>
                <Pressable onPress={() => remove(p.id)} hitSlop={10}><Icon name="trash" size={18} color={c.muted} /></Pressable>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stepper value={qty} min={minQty(p)} max={Math.max(minQty(p), p.stock)} onChange={(n) => setQty(p.id, n)} />
                <T v="price" style={{ fontSize: 17 }}>{inr(unit * qty)}</T>
              </View>
              {isDealer && <T v="small">Bulk minimum {p.minBulkQty} · {inr(unit)} each</T>}
            </View>
          </Card>
        )}
        ListFooterComponent={
          <Card style={{ marginTop: 6 }}>
            <Row left="Subtotal" right={inr(subtotal)} />
            <Row left="Delivery" right={delivery ? inr(delivery) : 'Free'} />
            {!delivery && !isDealer && subtotal < 1999 ? null : null}
            <View style={{ height: 6 }} />
            <Row left="Total" right={inr(subtotal + delivery)} bold />
            {isDealer && <T v="small" style={{ marginTop: 6 }}>Bulk order · GST invoice will be shared by email.</T>}
          </Card>
        }
      />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 16, backgroundColor: c.bg, borderTopWidth: 1, borderColor: c.line }}>
        <Button title={`Checkout · ${inr(subtotal + delivery)}`} icon="right" onPress={() => nav.navigate('Checkout')} />
      </View>
    </View>
  );
}
