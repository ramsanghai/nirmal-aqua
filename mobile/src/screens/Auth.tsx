import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { useTheme } from '../theme';
import { DropMark } from '../icons';
import { Button, Chip, Field, Rise, T } from '../ui';

const friendly = (e: any) => {
  const code = String(e?.code || '');
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Email or password is incorrect.';
  if (code.includes('email-already-in-use')) return 'An account with this email already exists. Try signing in.';
  if (code.includes('weak-password')) return 'Choose a password with at least 6 characters.';
  if (code.includes('network')) return 'No connection. Check your internet and try again.';
  return e?.message || 'Something went wrong. Please try again.';
};

export function AuthScreen() {
  const { c } = useTheme();
  const { signIn, signUp, reset } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [role, setRole] = useState<'Customer' | 'Dealer'>('Customer');
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '', businessName: '', gstin: '', city: '', referral: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email';
    if (f.password.length < 6) e.password = 'At least 6 characters';
    if (mode === 'up') {
      if (!f.name.trim()) e.name = 'Enter your name';
      if (!/^\d{10}$/.test(f.phone.trim())) e.phone = 'Enter a 10-digit mobile number';
      if (role === 'Dealer' && !f.businessName.trim()) e.businessName = 'Enter your business name';
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };
  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === 'in') await signIn(f.email, f.password);
      else await signUp({ ...f, role });
    } catch (e) { Alert.alert(mode === 'in' ? 'Sign in failed' : 'Could not create account', friendly(e)); }
    setBusy(false);
  };
  const forgot = async () => {
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setErr({ email: 'Enter your email first' });
    try { await reset(f.email); Alert.alert('Check your inbox', 'We sent a password reset link.'); } catch (e) { Alert.alert('Error', friendly(e)); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ backgroundColor: c.primary, paddingTop: insets.top + 28, paddingHorizontal: 22, paddingBottom: 54, borderBottomLeftRadius: 36 }}>
          <Rise>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <DropMark size={30} />
              <T v="h1" color={c.onPrimary} style={{ fontSize: 26 }}>nirmal aqua</T>
            </View>
            <T v="display" color={c.onPrimary} style={{ marginTop: 26, fontSize: 36, lineHeight: 40 }}>Water you can{'\n'}trust, at your door.</T>
            <T v="body" color={c.onPrimary} style={{ marginTop: 10, opacity: 0.8 }}>Purifiers, pumps, filters and same-week service.</T>
          </Rise>
        </View>

        <View style={{ padding: 22, marginTop: -26 }}>
          <View style={{ backgroundColor: c.card, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 18 }}>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <Chip label="Sign in" active={mode === 'in'} onPress={() => setMode('in')} />
              <Chip label="Create account" active={mode === 'up'} onPress={() => setMode('up')} />
            </View>

            {mode === 'up' && (
              <>
                <T v="label" muted style={{ marginBottom: 8 }}>I am a</T>
                <View style={{ flexDirection: 'row', marginBottom: 14 }}>
                  <Chip label="Customer" active={role === 'Customer'} onPress={() => setRole('Customer')} />
                  <Chip label="Dealer / bulk buyer" active={role === 'Dealer'} onPress={() => setRole('Dealer')} />
                </View>
                {role === 'Dealer' && <T v="small" style={{ marginBottom: 14 }}>Dealer accounts see wholesale prices after our team approves the application.</T>}
                <Field label="Full name" value={f.name} onChangeText={set('name')} error={err.name} autoCapitalize="words" />
                <Field label="Mobile" value={f.phone} onChangeText={set('phone')} error={err.phone} keyboardType="number-pad" maxLength={10} />
              </>
            )}
            <Field label="Email" value={f.email} onChangeText={set('email')} error={err.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <Field label="Password" value={f.password} onChangeText={set('password')} error={err.password} secureTextEntry autoCapitalize="none" />
            {mode === 'up' && role === 'Dealer' && (
              <>
                <Field label="Business name" value={f.businessName} onChangeText={set('businessName')} error={err.businessName} />
                <Field label="GSTIN (optional)" value={f.gstin} onChangeText={(v) => set('gstin')(v.toUpperCase())} autoCapitalize="characters" maxLength={15} />
                <Field label="City" value={f.city} onChangeText={set('city')} />
              </>
            )}
            {mode === 'up' && <Field label="Referral code (optional)" value={f.referral} onChangeText={(v) => set('referral')(v.toUpperCase())} autoCapitalize="characters" maxLength={6} />}
            <Button title={mode === 'in' ? 'Sign in' : role === 'Dealer' ? 'Apply as dealer' : 'Create account'} onPress={submit} loading={busy} />
            {mode === 'in' && <T v="small" style={{ textAlign: 'center', marginTop: 14, textDecorationLine: 'underline' }} onPress={forgot}>Forgot password?</T>}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
