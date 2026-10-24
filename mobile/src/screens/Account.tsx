import React from 'react';
import { Alert, Pressable, ScrollView, Share, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { Mode, useTheme } from '../theme';
import { Icon } from '../icons';
import { Button, Card, Chip, Rule, T } from '../ui';
import { registerForPush } from '../push';
import { inr } from '../format';

export function AccountScreen() {
  const { c, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, user, signOut, update } = useAuth();
  if (!profile || !user) return null;
  const initials = profile.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  const dealer = profile.role === 'Dealer';
  const msg = `Get clean water at your door with Nirmal Aqua. Use my code ${profile.referralCode} when you sign up and we both get ₹100 off.`;

  const enablePush = async () => {
    const t = await registerForPush();
    if (!t) return Alert.alert('Notifications', 'Could not enable notifications. Allow them in system settings (a real device build is required).');
    await update({ fcmToken: t });
    Alert.alert('Notifications on', 'You will get order and service updates.');
  };
  const removeAddr = (i: number) => update({ addresses: (profile.addresses ?? []).filter((_, k) => k !== i) });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 50 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <T v="h1" color={c.onPrimary}>{initials}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T v="h1">{profile.name}</T>
          <T v="small">{profile.email}</T><T v="small">☎ {profile.phone}</T>
        </View>
      </View>

      <Card style={{ marginBottom: 14 }}>
        <T v="label" muted>Account type</T>
        <T v="h2" style={{ marginTop: 2 }}>{dealer ? `Dealer · ${profile.businessName || ''}` : 'Customer'}</T>
        {dealer && (
          <View style={{ marginTop: 8 }}>
            <T v="small" color={profile.dealerStatus === 'approved' ? c.ok : profile.dealerStatus === 'rejected' ? c.danger : c.accent} style={{ fontFamily: 'Manrope_700Bold' }}>
              {profile.dealerStatus === 'approved' ? 'Approved · wholesale prices active' : profile.dealerStatus === 'rejected' ? 'Application not approved' : 'Pending approval from our team'}
            </T>
            {!!profile.gstin && <T v="small">GSTIN {profile.gstin}</T>}
          </View>
        )}
      </Card>

      <View style={{ borderRadius: 18, backgroundColor: c.primary, padding: 18, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="gift" color={c.accent} /><T v="label" color={c.onPrimary}>Refer & earn</T></View>
        <T v="h1" color={c.onPrimary} style={{ marginTop: 6 }}>Give ₹100, get ₹100</T>
        <T v="small" color={c.onPrimary} style={{ opacity: 0.8, marginTop: 2 }}>When a friend signs up with your code, you both get ₹100 credit for your next order.</T>
        <Pressable onPress={async () => { await Clipboard.setStringAsync(profile.referralCode); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); Alert.alert('Copied', 'Referral code copied.'); }}
          style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.accent, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
          <T v="display" color={c.accent} style={{ letterSpacing: 4, fontSize: 28 }}>{profile.referralCode}</T>
          <Icon name="copy" color={c.accent} />
        </Pressable>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <View><T v="small" color={c.onPrimary} style={{ opacity: 0.75 }}>Credits available</T><T v="price" color={c.onPrimary}>{inr(profile.referralCredits)}</T></View>
          <Button small kind="accent" icon="share" title="Share code" onPress={() => Share.share({ message: msg })} />
        </View>
      </View>

      <T v="label" muted style={{ marginBottom: 8 }}>Appearance</T>
      <View style={{ flexDirection: 'row', marginBottom: 18 }}>
        {(['system', 'light', 'dark'] as Mode[]).map((m) => <Chip key={m} label={m === 'system' ? 'Auto' : m[0].toUpperCase() + m.slice(1)} active={mode === m} onPress={() => setMode(m)} />)}
      </View>

      <T v="label" muted style={{ marginBottom: 8 }}>Saved addresses</T>
      <Card style={{ marginBottom: 18 }}>
        {(profile.addresses ?? []).length === 0 && <T v="small">Addresses you save at checkout appear here.</T>}
        {(profile.addresses ?? []).map((a, i) => (
          <View key={i}>
            {i > 0 && <Rule style={{ marginVertical: 10 }} />}
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{ flex: 1 }}><T v="label" color={c.primary}>{a.label}</T><T numberOfLines={2}>{a.line}</T></View>
              <Pressable hitSlop={10} onPress={() => removeAddr(i)}><Icon name="trash" size={18} color={c.muted} /></Pressable>
            </View>
          </View>
        ))}
      </Card>

      <Button kind="ghost" icon="info" title="Enable push notifications" onPress={enablePush} style={{ marginBottom: 10 }} />
      <Button kind="ghost" icon="logout" title="Sign out" onPress={() => Alert.alert('Sign out?', undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: signOut }])} />
    </ScrollView>
  );
}
