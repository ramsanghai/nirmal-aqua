import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
export type RootStack = {
  Tabs: { screen?: 'Shop' | 'Cart' | 'Orders' | 'Service' | 'Account' } | undefined;
  Product: { id: string };
  Checkout: undefined;
  OrderDone: { orderId: string };
  Order: { id: string };
};
export type Nav = NativeStackNavigationProp<RootStack>;
