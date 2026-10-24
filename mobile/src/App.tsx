import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createNavigationContainerRef, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold, Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces';
import { Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';

import { AuthProvider, useAuth } from './auth';
import { DataProvider } from './data';
import { CartProvider, useCart } from './cart';
import { ThemeProvider, useTheme } from './theme';
import { initNotifications, onNotificationTap, registerForPush } from './push';
import { DropMark, Icon, IconName } from './icons';
import { Button, T } from './ui';
import { AuthScreen } from './screens/Auth';
import { ShopScreen } from './screens/Shop';
import { ProductScreen } from './screens/Product';
import { CartScreen } from './screens/Cart';
import { CheckoutScreen } from './screens/Checkout';
import { OrderDetailScreen, OrderDoneScreen, OrdersScreen } from './screens/Orders';
import { ServiceScreen } from './screens/Service';
import { AccountScreen } from './screens/Account';
import type { RootStack } from './nav';

const Stack = createNativeStackNavigator<RootStack>();
const Tab = createBottomTabNavigator();
const navRef = createNavigationContainerRef<RootStack>();

const TABS: Record<string, { icon: IconName; label: string }> = {
  Shop: { icon: 'shop', label: 'Shop' }, Cart: { icon: 'cart', label: 'Cart' }, Orders: { icon: 'orders', label: 'Orders' },
  Service: { icon: 'service', label: 'Service' }, Account: { icon: 'user', label: 'Account' },
};

function TabBar({ state, navigation }: BottomTabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { count } = useCart();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.card, borderTopWidth: 1, borderColor: c.line, paddingBottom: insets.bottom + 4, paddingTop: 8 }}>
      {state.routes.map((r, i) => {
        const on = state.index === i;
        const t = TABS[r.name];
        return (
          <Pressable key={r.key} onPress={() => navigation.navigate(r.name)} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
            <View style={{ width: 52, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.water : 'transparent' }}>
              <Icon name={t.icon} size={21} color={on ? c.primary : c.muted} stroke={on ? 2.2 : 1.8} />
              {r.name === 'Cart' && count > 0 && (
                <View style={{ position: 'absolute', top: -4, right: 2, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                  <T v="label" color={c.onAccent} style={{ fontSize: 9 }}>{count}</T>
                </View>
              )}
            </View>
            <T v="label" color={on ? c.primary : c.muted} style={{ fontSize: 9.5, letterSpacing: 0.6 }}>{t.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Service" component={ServiceScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function Splash() {
  const { c } = useTheme();
  return <View style={{ flex: 1, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', gap: 16 }}><DropMark size={56} /><ActivityIndicator color={c.onPrimary} /></View>;
}

function Gate() {
  const { c, isDark } = useTheme();
  const { user, profile, ready, update, signOut } = useAuth();

  useEffect(() => {
    if (!user || !profile || profile.role === 'Admin') return;
    registerForPush().then((t) => { if (t && t !== profile.fcmToken) update({ fcmToken: t }); });
  }, [user?.uid, !!profile]);
  useEffect(() => {
    initNotifications();
    return onNotificationTap((d) => {
      if (!navRef.isReady()) return;
      if (String(d.kind || '').startsWith('service')) navRef.navigate('Tabs', { screen: 'Service' });
      else navRef.navigate('Tabs', { screen: 'Orders' });
    });
  }, []);

  const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: c.bg, card: c.card, text: c.ink, border: c.line, primary: c.primary } };
  let body: React.ReactNode;
  if (!ready || (user && !profile)) body = <Splash />;
  else if (!user) body = <AuthScreen />;
  else if (profile?.role === 'Admin') {
    body = (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 }}>
        <T v="h1" style={{ textAlign: 'center' }}>This is an admin account</T>
        <T muted style={{ textAlign: 'center' }}>Admins manage orders, dealers and the service desk from the web panel.</T>
        <Button title="Sign out" onPress={signOut} />
      </View>
    );
  } else {
    body = (
      <NavigationContainer ref={navRef} theme={theme}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="Product" component={ProductScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Order" component={OrderDetailScreen} />
          <Stack.Screen name="OrderDone" component={OrderDoneScreen} options={{ gestureEnabled: false, animation: 'fade' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  return <><StatusBar style={isDark || !user || !ready ? 'light' : 'dark'} />{body}</>;
}

export default function App() {
  const [loaded] = useFonts({ Fraunces_600SemiBold, Fraunces_600SemiBold_Italic, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <CartProvider>
              <Gate />
            </CartProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
