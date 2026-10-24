import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import { useData } from '../data';
import { F, useTheme } from '../theme';
import { DropMark, Icon } from '../icons';
import { Chip, Rise, Skeleton, T } from '../ui';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../types';
import type { Nav } from '../nav';

const SORTS = ['Featured', 'Price: low to high', 'Price: high to low', 'Top rated'] as const;

export function ShopScreen() {
  const { c } = useTheme();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { profile, isDealer, unitPrice } = useAuth();
  const { add } = useCart();
  const { products, loading } = useData();
  const [cat, setCat] = useState<string>('All');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Featured');

  const list = useMemo(() => {
    let l = products.filter((p) => (cat === 'All' || p.category === cat) && (!q.trim() || (p.name + p.category + p.description).toLowerCase().includes(q.trim().toLowerCase())));
    if (sort === 'Price: low to high') l = [...l].sort((a, b) => unitPrice(a) - unitPrice(b));
    else if (sort === 'Price: high to low') l = [...l].sort((a, b) => unitPrice(b) - unitPrice(a));
    else if (sort === 'Top rated') l = [...l].sort((a, b) => b.rating - a.rating);
    else l = [...l].sort((a, b) => Number(b.featured) - Number(a.featured));
    return l;
  }, [products, cat, q, sort, isDealer]);

  const pad = 16, gap = 12, cw = (width - pad * 2 - gap) / 2;
  const first = profile?.name?.split(' ')[0] || '';
  const pending = profile?.role === 'Dealer' && profile.dealerStatus === 'pending';
  const rejected = profile?.role === 'Dealer' && profile.dealerStatus === 'rejected';

  const header = (
    <View>
      <Rise>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <View>
            <T v="label" muted>{isDealer ? 'Dealer portal' : 'Good to see you'}</T>
            <T v="display" style={{ fontSize: 30 }}>{first ? `Hello, ${first}.` : 'Hello.'}</T>
          </View>
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}><DropMark size={26} /></View>
        </View>
      </Rise>

      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 14, paddingHorizontal: 14, marginTop: 16 }}>
        <Icon name="search" size={19} color={c.muted} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search purifiers, pumps, filters…" placeholderTextColor={c.muted}
          style={{ flex: 1, fontFamily: F.body, fontSize: 15, color: c.ink, paddingVertical: 13, paddingHorizontal: 10 }} />
        {q ? <Icon name="x" size={18} color={c.muted} /> : null}
      </View>

      {(pending || rejected) && (
        <View style={{ marginTop: 14, padding: 14, borderRadius: 14, backgroundColor: rejected ? c.danger : c.accent }}>
          <T v="h2" color={rejected ? '#fff' : c.onAccent}>{rejected ? 'Dealer application not approved' : 'Dealer application under review'}</T>
          <T v="small" color={rejected ? '#fff' : c.onAccent} style={{ marginTop: 2, opacity: 0.85 }}>
            {rejected ? 'Contact support for details. You can still shop at retail prices.' : 'Wholesale prices unlock once approved. We will notify you. Until then you see retail prices.'}
          </T>
        </View>
      )}
      {isDealer && (
        <View style={{ marginTop: 14, padding: 14, borderRadius: 14, backgroundColor: c.primary }}>
          <T v="h2" color={c.onPrimary}>Wholesale pricing is active</T>
          <T v="small" color={c.onPrimary} style={{ marginTop: 2, opacity: 0.85 }}>Prices below are dealer rates. Each product has a minimum bulk quantity.</T>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginHorizontal: -pad }} contentContainerStyle={{ paddingHorizontal: pad }}>
        {['All', ...CATEGORIES].map((k) => <Chip key={k} label={k} active={cat === k} onPress={() => setCat(k)} />)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginBottom: 14, marginHorizontal: -pad }} contentContainerStyle={{ paddingHorizontal: pad }}>
        {SORTS.map((k) => <Chip key={k} label={k} active={sort === k} onPress={() => setSort(k)} style={{ paddingVertical: 5 }} />)}
      </ScrollView>
      <T v="label" muted style={{ marginBottom: 10 }}>{loading ? 'Loading catalogue…' : `${list.length} products`}</T>
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: c.bg }}
      data={loading ? [] : list}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={{ gap }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: pad, paddingBottom: 30 }}
      ListHeaderComponent={header}
      ListEmptyComponent={loading ? (
        <View style={{ flexDirection: 'row', gap }}><Skeleton h={250} style={{ width: cw }} /><Skeleton h={250} style={{ width: cw }} /></View>
      ) : <T muted style={{ textAlign: 'center', padding: 30 }}>Nothing matches “{q}”. Try another word.</T>}
      renderItem={({ item }) => <ProductCard p={item} width={cw} onPress={() => nav.navigate('Product', { id: item.id })} onAdd={() => add(item)} />}
    />
  );
}
