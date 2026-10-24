import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDoc, collection, increment, updateDoc, doc } from 'firebase/firestore';
import { db, RZP_KEY } from '../firebase';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import { useTheme } from '../theme';
import { Icon } from '../icons';
import { Button, Card, Chip, Field, Row, T } from '../ui';
import { MapPicker, Picked } from '../components/MapPicker';
import { RazorpayCheckout } from '../components/Razorpay';
import { notify } from '../api';
import { inr } from '../format';
import type { Address, Order } from '../types';
import type { Nav } from '../nav';

export function CheckoutScreen() {
  const { c } = useTheme();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { user, profile, isDealer, update } = useAuth();
  const { lines, subtotal, clear } = useCart();

  const saved = profile?.addresses ?? [];
  const [addr, setAddr] = useState<Address | null>(saved[0] ?? null);
  const [map, setMap] = useState(false);
  const [draft, setDraft] = useState<(Picked & { label: string; phone: string }) | null>(null);
  const [method, setMethod] = useState<'razorpay' | 'cod'>(RZP_KEY ? 'razorpay' : 'cod');
  const [useCredits, setUseCredits] = useState(false);
  const [paying, setPaying] = useState(false);
  const [busy, setBusy] = useState(false);

  const credits = profile?.referralCredits ?? 0;
  const discount = useCredits ? Math.min(credits, Math.floor(subtotal * 0.2)) : 0;
  const delivery = isDealer || subtotal >= 1999 ? 0 : 99;
  const total = subtotal - discount + delivery;

  const onPick = (p: Picked) => { setMap(false); setDraft({ ...p, label: 'Home', phone: profile?.phone ?? '' }); };
  const saveDraft = async () => {
    if (!draft) return;
    if (draft.line.trim().length < 8) return Alert.alert('Add more detail', 'Include flat / house number and landmark.');
    if (!/^\d{10}$/.test(draft.phone.trim())) return Alert.alert('Phone number', 'Enter a 10-digit contact number.');
    const a: Address = { label: draft.label, line: draft.line.trim(), lat: draft.lat, lng: draft.lng, phone: draft.phone.trim() };
    await update({ addresses: [a, ...saved].slice(0, 5) });
    setAddr(a); setDraft(null);
  };

  const createOrder = async (paymentId: string) => {
    if (!user || !profile || !addr) return;
    setBusy(true);
    try {
      const now = Date.now();
      const order: Omit<Order, 'id'> = {
        userId: user.uid, userName: profile.name, userEmail: profile.email, userPhone: profile.phone,
        role: profile.role === 'Dealer' && isDealer ? 'Dealer' : 'Customer',
        items: lines.map((l) => ({ productId: l.product.id, name: l.product.name, image: l.product.image, qty: l.qty, unitPrice: l.unit })),
        subtotal, discount, deliveryFee: delivery, total, address: addr, paymentId,
        paymentStatus: paymentId ? 'paid' : 'pending', paymentMethod: paymentId ? 'razorpay' : 'cod',
        status: 'placed', isBulk: isDealer, createdAt: now, updatedAt: now,
      };
      const ref = await addDoc(collection(db, 'orders'), order);
      if (discount > 0) await updateDoc(doc(db, 'users', user.uid), { referralCredits: increment(-discount) });
      clear();
      notify('order_placed', ref.id);
      nav.reset({ index: 0, routes: [{ name: 'Tabs' }, { name: 'OrderDone', params: { orderId: ref.id } }] });
    } catch (e: any) {
      Alert.alert('Order not placed', e?.message || 'Please try again.');
      setBusy(false);
    }
  };

  const place = () => {
    if (!addr) return Alert.alert('Delivery address', 'Pick where we should deliver.');
    if (method === 'razorpay') setPaying(true); else createOrder('');
  };

  const Sec = ({ n, title }: { n: string; title: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22, marginBottom: 10 }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}><T v="label" color={c.bg} style={{ fontSize: 11 }}>{n}</T></View>
      <T v="h1" style={{ fontSize: 20 }}>{title}</T>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => nav.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}><Icon name="left" size={18} color={c.ink} /><T v="h2" style={{ fontSize: 14 }}>Cart</T></Pressable>
        <T v="display" style={{ fontSize: 30 }}>Checkout</T>

        <Sec n="1" title="Delivery address" />
        {saved.map((a, i) => {
          const on = addr?.line === a.line;
          return (
            <Pressable key={i} onPress={() => setAddr(a)} style={{ marginBottom: 10 }}>
              <Card style={{ borderColor: on ? c.primary : c.line, borderWidth: on ? 2 : 1, flexDirection: 'row', gap: 10 }}>
                <Icon name="pin" size={20} color={on ? c.primary : c.muted} />
                <View style={{ flex: 1 }}><T v="label" color={c.primary}>{a.label}</T><T v="body" numberOfLines={3}>{a.line}</T><T v="small">☎ {a.phone}</T></View>
              </Card>
            </Pressable>
          );
        })}
        {draft ? (
          <Card>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {['Home', 'Work', 'Shop'].map((l) => <Chip key={l} label={l} active={draft.label === l} onPress={() => setDraft({ ...draft, label: l })} />)}
            </View>
            <Field label="Full address" value={draft.line} onChangeText={(v) => setDraft({ ...draft, line: v })} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
            <Field label="Contact number" value={draft.phone} onChangeText={(v) => setDraft({ ...draft, phone: v })} keyboardType="number-pad" maxLength={10} />
            <Button title="Save address" onPress={saveDraft} />
          </Card>
        ) : (
          <Button kind="ghost" icon="pin" title={saved.length ? 'Add another address on map' : 'Pick address on map'} onPress={() => setMap(true)} />
        )}

        <Sec n="2" title="Payment" />
        <Pressable onPress={() => RZP_KEY && setMethod('razorpay')} style={{ marginBottom: 10, opacity: RZP_KEY ? 1 : 0.5 }}>
          <Card style={{ borderColor: method === 'razorpay' ? c.primary : c.line, borderWidth: method === 'razorpay' ? 2 : 1 }}>
            <T v="h2">Pay online · UPI, cards, netbanking</T>
            <T v="small">Razorpay secure checkout (test mode){RZP_KEY ? '' : ' · key not configured'}</T>
          </Card>
        </Pressable>
        <Pressable onPress={() => setMethod('cod')}>
          <Card style={{ borderColor: method === 'cod' ? c.primary : c.line, borderWidth: method === 'cod' ? 2 : 1 }}>
            <T v="h2">{isDealer ? 'Pay on delivery / against invoice' : 'Cash or UPI on delivery'}</T>
            <T v="small">Pay when the order reaches you.</T>
          </Card>
        </Pressable>

        {credits > 0 && (
          <Card style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="gift" color={c.accent} />
            <View style={{ flex: 1 }}><T v="h2" style={{ fontSize: 14 }}>Use referral credits</T><T v="small">{inr(credits)} available · up to 20% of the order</T></View>
            <Switch value={useCredits} onValueChange={setUseCredits} trackColor={{ true: c.primary, false: c.line }} thumbColor="#fff" />
          </Card>
        )}

        <Sec n="3" title="Summary" />
        <Card>
          {lines.map((l) => <Row key={l.product.id} left={`${l.qty} × ${l.product.name}`.slice(0, 34)} right={inr(l.qty * l.unit)} />)}
          <View style={{ height: 8 }} />
          <Row left="Subtotal" right={inr(subtotal)} />
          {discount > 0 && <Row left="Referral credits" right={`− ${inr(discount)}`} />}
          <Row left="Delivery" right={delivery ? inr(delivery) : 'Free'} />
          <View style={{ height: 6 }} />
          <Row left="To pay" right={inr(total)} bold />
        </Card>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 12, backgroundColor: c.bg, borderTopWidth: 1, borderColor: c.line }}>
        <Button title={method === 'razorpay' ? `Pay ${inr(total)}` : `Place order · ${inr(total)}`} icon="check" onPress={place} loading={busy} disabled={!lines.length} />
      </View>

      <MapPicker visible={map} onClose={() => setMap(false)} onPick={onPick} initial={addr ? { lat: addr.lat, lng: addr.lng } : undefined} />
      <RazorpayCheckout visible={paying} amount={total} description={`${lines.length} item order`}
        prefill={{ name: profile?.name ?? '', email: profile?.email ?? '', contact: addr?.phone ?? profile?.phone ?? '' }}
        onSuccess={(id) => { setPaying(false); createOrder(id); }} onCancel={() => setPaying(false)}
        onFail={(m) => { setPaying(false); Alert.alert('Payment failed', m); }} />
    </View>
  );
}
