import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth';
import { useData } from '../data';
import { useTheme } from '../theme';
import { Button, Card, Chip, Empty, Field, StatusPill, T } from '../ui';
import { MapPicker, Picked } from '../components/MapPicker';
import { notify } from '../api';
import { dateFmt, nextDays } from '../format';
import type { ServiceReq, ServiceType } from '../types';

const TYPES: { t: ServiceType; hint: string }[] = [
  { t: 'Installation', hint: 'New purifier, pump or dispenser' },
  { t: 'Repair', hint: 'Leak, low flow, noise, no power' },
  { t: 'Filter change', hint: 'Candle, membrane, UV lamp' },
  { t: 'AMC', hint: 'Yearly maintenance plan' },
];
const SLOTS: ServiceReq['slot'][] = ['10-12', '12-3', '3-6'];
const SLOT_LABEL = { '10-12': '10 am – 12 pm', '12-3': '12 – 3 pm', '3-6': '3 – 6 pm' };

export function ServiceScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { orders, services } = useData();
  const [tab, setTab] = useState<'book' | 'mine'>('book');
  const [type, setType] = useState<ServiceType>('Installation');
  const [product, setProduct] = useState('');
  const days = nextDays(10);
  const [date, setDate] = useState(days[0].iso);
  const [slot, setSlot] = useState<ServiceReq['slot']>('10-12');
  const [loc, setLoc] = useState<{ line: string; lat: number; lng: number } | null>(null);
  const [map, setMap] = useState(false);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { const a = profile?.addresses?.[0]; if (a && !loc) setLoc({ line: a.line, lat: a.lat, lng: a.lng }); }, [profile?.addresses]);
  const owned = Array.from(new Set(orders.flatMap((o) => o.items.map((i) => i.name)))).slice(0, 6);

  const submit = async () => {
    if (!user || !profile) return;
    if (!product.trim()) return Alert.alert('Which product?', 'Tell us which product needs service.');
    if (!loc) return Alert.alert('Service address', 'Pick the address on the map.');
    setBusy(true);
    try {
      const now = Date.now();
      const doc: Omit<ServiceReq, 'id'> = {
        userId: user.uid, userName: profile.name, userEmail: profile.email, userPhone: profile.phone,
        type, productName: product.trim(), date, slot, address: loc, notes: notes.trim(), status: 'requested', createdAt: now, updatedAt: now,
      };
      const ref = await addDoc(collection(db, 'services'), doc);
      notify('service_booked', ref.id);
      setProduct(''); setNotes(''); setTab('mine');
      Alert.alert('Request received', 'Our service desk will confirm your slot shortly. You will get a notification.');
    } catch (e: any) { Alert.alert('Could not book', e?.message || 'Please try again.'); }
    setBusy(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <T v="label" muted>Service desk</T>
        <T v="display" style={{ fontSize: 30, marginBottom: 12 }}>Book a technician</T>
        <View style={{ flexDirection: 'row' }}>
          <Chip label="New request" active={tab === 'book'} onPress={() => setTab('book')} />
          <Chip label={`My requests${services.length ? ` (${services.length})` : ''}`} active={tab === 'mine'} onPress={() => setTab('mine')} />
        </View>
      </View>

      {tab === 'book' ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <T v="label" muted style={{ marginBottom: 8 }}>What do you need?</T>
          {TYPES.map((x) => (
            <Card key={x.t} style={{ marginBottom: 8, padding: 12, borderColor: type === x.t ? c.primary : c.line, borderWidth: type === x.t ? 2 : 1 }}>
              <T v="h2" onPress={() => setType(x.t)}>{x.t}</T><T v="small" onPress={() => setType(x.t)}>{x.hint}</T>
            </Card>
          ))}

          <View style={{ height: 8 }} />
          <Field label="Product" value={product} onChangeText={setProduct} placeholder="e.g. Nirmal Pure RO+UV 10 L" />
          {owned.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: -6, marginBottom: 14 }}>
              {owned.map((n) => <Chip key={n} label={n.length > 28 ? n.slice(0, 27) + '…' : n} onPress={() => setProduct(n)} active={product === n} />)}
            </ScrollView>
          )}

          <T v="label" muted style={{ marginBottom: 8 }}>Date</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {days.map((d) => (
              <View key={d.iso} style={{ marginRight: 8 }}>
                <Card style={{ alignItems: 'center', paddingVertical: 10, width: 62, borderColor: date === d.iso ? c.primary : c.line, borderWidth: date === d.iso ? 2 : 1, backgroundColor: date === d.iso ? c.primary : c.card }}>
                  <T v="label" color={date === d.iso ? c.onPrimary : c.muted} onPress={() => setDate(d.iso)}>{d.dow}</T>
                  <T v="price" color={date === d.iso ? c.onPrimary : c.ink} onPress={() => setDate(d.iso)}>{d.dom}</T>
                  <T v="small" color={date === d.iso ? c.onPrimary : c.muted} onPress={() => setDate(d.iso)}>{d.mon}</T>
                </Card>
              </View>
            ))}
          </ScrollView>

          <T v="label" muted style={{ marginBottom: 8 }}>Time slot</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
            {SLOTS.map((s) => <Chip key={s} label={SLOT_LABEL[s]} active={slot === s} onPress={() => setSlot(s)} />)}
          </View>

          <T v="label" muted style={{ marginBottom: 8 }}>Service address</T>
          <Card style={{ marginBottom: 14 }}>
            <T numberOfLines={3}>{loc?.line || 'No address selected yet.'}</T>
            <Button small kind="ghost" icon="pin" title={loc ? 'Change on map' : 'Pick on map'} onPress={() => setMap(true)} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
          </Card>

          <Field label="Notes (optional)" value={notes} onChangeText={setNotes} multiline placeholder="Describe the problem or access instructions" style={{ minHeight: 80, textAlignVertical: 'top' }} />
          <Button title="Request service" icon="check" onPress={submit} loading={busy} />
        </ScrollView>
      ) : (
        <FlatList data={services} keyExtractor={(s) => s.id} contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Empty icon="service" title="No service requests" hint="Book installation, repair or a filter change and track it here." />}
          renderItem={({ item: s }) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T v="h2">{s.type}</T><StatusPill status={s.status} />
              </View>
              <T v="body" style={{ marginTop: 4 }}>{s.productName}</T>
              <T v="small" style={{ marginTop: 6 }}>{dateFmt(new Date(s.date).getTime())} · {SLOT_LABEL[s.slot]}</T>
              <T v="small" numberOfLines={2}>{s.address.line}</T>
              {!!s.adminNote && <View style={{ marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: c.water }}><T v="small" color={c.ink}>Service desk: {s.adminNote}</T></View>}
            </Card>
          )} />
      )}
      <MapPicker visible={map} onClose={() => setMap(false)} initial={loc ?? undefined} onPick={(p: Picked) => { setLoc({ line: p.line, lat: p.lat, lng: p.lng }); setMap(false); }} />
    </View>
  );
}
