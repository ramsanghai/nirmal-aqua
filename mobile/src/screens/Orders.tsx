import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../cart';
import { useData } from '../data';
import { useTheme } from '../theme';
import { Icon } from '../icons';
import { Button, Card, Empty, Row, StatusPill, T } from '../ui';
import { dateFmt, inr, shortId } from '../format';
import type { Nav, RootStack } from '../nav';
import type { OrderStatus } from '../types';

export function OrdersScreen() {
  const { c } = useTheme();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { orders } = useData();
  if (!orders.length)
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', paddingTop: insets.top }}>
        <Empty icon="orders" title="No orders yet" hint="Your orders and their delivery progress will show up here." action={<Button title="Start shopping" onPress={() => nav.navigate('Tabs', { screen: 'Shop' })} />} />
      </View>
    );
  return (
    <FlatList style={{ flex: 1, backgroundColor: c.bg }} data={orders} keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12 }}
      ListHeaderComponent={<View style={{ marginBottom: 14 }}><T v="label" muted>{orders.length} order{orders.length > 1 ? 's' : ''}</T><T v="display" style={{ fontSize: 30 }}>Order history</T></View>}
      renderItem={({ item: o }) => (
        <Pressable onPress={() => nav.navigate('Order', { id: o.id })} style={{ marginBottom: 12 }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View><T v="label" muted>Order #{shortId(o.id)}{o.isBulk ? ' · Bulk' : ''}</T><T v="small">{dateFmt(o.createdAt)}</T></View>
              <StatusPill status={o.status} />
            </View>
            <View style={{ flexDirection: 'row', gap: 6, marginVertical: 12 }}>
              {o.items.slice(0, 4).map((i) => <Image key={i.productId} source={{ uri: i.image }} style={{ width: 52, height: 52, borderRadius: 8 }} />)}
              {o.items.length > 4 && <View style={{ width: 52, height: 52, borderRadius: 8, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}><T v="h2">+{o.items.length - 4}</T></View>}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T v="small">{o.items.reduce((a, i) => a + i.qty, 0)} units · {o.paymentStatus === 'paid' ? 'Paid online' : 'Pay on delivery'}</T>
              <T v="price" style={{ fontSize: 18 }}>{inr(o.total)}</T>
            </View>
          </Card>
        </Pressable>
      )} />
  );
}

const STEPS: OrderStatus[] = ['placed', 'confirmed', 'shipped', 'delivered'];
const STEP_LABEL = { placed: 'Order placed', confirmed: 'Confirmed', shipped: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

export function OrderDetailScreen() {
  const { c } = useTheme();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStack, 'Order'>>();
  const { orders, byId } = useData();
  const { add } = useCart();
  const o = orders.find((x) => x.id === params.id);
  const prog = useRef(new Animated.Value(0)).current;
  const idx = o ? Math.max(0, STEPS.indexOf(o.status)) : 0;
  useEffect(() => { Animated.timing(prog, { toValue: idx / (STEPS.length - 1), duration: 700, useNativeDriver: false }).start(); }, [idx]);
  if (!o) return null;

  const reorder = () => { o.items.forEach((i) => byId[i.productId] && add(byId[i.productId], i.qty)); nav.navigate('Tabs', { screen: 'Cart' }); };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8, paddingBottom: 40 }}>
      <Pressable onPress={() => nav.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}><Icon name="left" size={18} color={c.ink} /><T v="h2" style={{ fontSize: 14 }}>Orders</T></Pressable>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View><T v="label" muted>{dateFmt(o.createdAt)}</T><T v="display" style={{ fontSize: 30 }}>#{shortId(o.id)}</T></View>
        <StatusPill status={o.status} />
      </View>

      {o.status !== 'cancelled' ? (
        <Card style={{ marginTop: 16 }}>
          <View style={{ height: 6, backgroundColor: c.tint, borderRadius: 3, marginHorizontal: 12, marginBottom: 12, marginTop: 6 }}>
            <Animated.View style={{ height: 6, borderRadius: 3, backgroundColor: c.primary, width: prog.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {STEPS.map((s, i) => (
              <View key={s} style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: i <= idx ? c.primary : c.tint, alignItems: 'center', justifyContent: 'center' }}>
                  {i <= idx ? <Icon name="check" size={14} color={c.onPrimary} stroke={2.6} /> : null}
                </View>
                <T v="small" color={i <= idx ? c.ink : c.muted} style={{ marginTop: 6, fontSize: 11, textAlign: 'center' }}>{STEP_LABEL[s]}</T>
              </View>
            ))}
          </View>
        </Card>
      ) : <Card style={{ marginTop: 16, borderColor: c.danger }}><T v="h2" color={c.danger}>This order was cancelled.</T></Card>}

      <T v="label" muted style={{ marginTop: 22, marginBottom: 8 }}>Items</T>
      <Card>
        {o.items.map((i) => (
          <View key={i.productId} style={{ flexDirection: 'row', gap: 12, paddingVertical: 8, alignItems: 'center' }}>
            <Image source={{ uri: i.image }} style={{ width: 56, height: 56, borderRadius: 8 }} />
            <View style={{ flex: 1 }}><T v="h2" numberOfLines={2} style={{ fontSize: 13.5 }}>{i.name}</T><T v="small">{i.qty} × {inr(i.unitPrice)}</T></View>
            <T v="h2" style={{ fontSize: 14 }}>{inr(i.qty * i.unitPrice)}</T>
          </View>
        ))}
      </Card>

      <T v="label" muted style={{ marginTop: 22, marginBottom: 8 }}>Payment</T>
      <Card>
        <Row left="Subtotal" right={inr(o.subtotal)} />
        {o.discount > 0 && <Row left="Referral credits" right={`− ${inr(o.discount)}`} />}
        <Row left="Delivery" right={o.deliveryFee ? inr(o.deliveryFee) : 'Free'} />
        <Row left={o.paymentStatus === 'paid' ? 'Paid' : 'To pay on delivery'} right={inr(o.total)} bold />
        {!!o.paymentId && <T v="small" style={{ marginTop: 6 }}>Payment ID {o.paymentId}</T>}
      </Card>

      <T v="label" muted style={{ marginTop: 22, marginBottom: 8 }}>Delivering to</T>
      <Card><T v="label" color={c.primary}>{o.address.label}</T><T>{o.address.line}</T><T v="small">☎ {o.address.phone}</T></Card>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
        <Button style={{ flex: 1 }} kind="ghost" title="Reorder" icon="cart" onPress={reorder} />
        <Button style={{ flex: 1 }} title="Need service?" icon="service" onPress={() => nav.navigate('Tabs', { screen: 'Service' })} />
      </View>
    </ScrollView>
  );
}

export function OrderDoneScreen() {
  const { c } = useTheme();
  const nav = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStack, 'OrderDone'>>();
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(s, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start(); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <Animated.View style={{ transform: [{ scale: s }], width: 112, height: 112, borderRadius: 56, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={56} color={c.onAccent} stroke={3} />
      </Animated.View>
      <T v="display" color={c.onPrimary} style={{ marginTop: 28, textAlign: 'center' }}>Order placed</T>
      <T color={c.onPrimary} style={{ marginTop: 8, textAlign: 'center', opacity: 0.85 }}>Order #{shortId(params.orderId)} is confirmed. We have sent you an email and SMS, and you will get a push when it ships.</T>
      <View style={{ width: '100%', gap: 10, marginTop: 34 }}>
        <Button kind="accent" title="Track order" onPress={() => nav.reset({ index: 1, routes: [{ name: 'Tabs', params: { screen: 'Orders' } }, { name: 'Order', params: { id: params.orderId } }] })} />
        <Button kind="ghost" title="Keep shopping" style={{ borderColor: c.onPrimary }} onPress={() => nav.reset({ index: 0, routes: [{ name: 'Tabs' }] })} />
      </View>
    </View>
  );
}
