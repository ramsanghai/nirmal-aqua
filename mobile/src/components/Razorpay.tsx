import React from 'react';
import { Linking, Modal, Pressable, SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { RZP_KEY } from '../firebase';
import { useTheme } from '../theme';
import { Icon } from '../icons';
import { T } from '../ui';

/** Razorpay Standard Checkout in a WebView (test mode key, no native module, works in Expo Go). */
export function RazorpayCheckout({ visible, amount, description, prefill, onSuccess, onCancel, onFail }: {
  visible: boolean; amount: number; description: string; prefill: { name: string; email: string; contact: string };
  onSuccess: (paymentId: string) => void; onCancel: () => void; onFail: (msg: string) => void;
}) {
  const { c } = useTheme();
  const opts = JSON.stringify({ key: RZP_KEY, amount: Math.round(amount * 100), currency: 'INR', name: 'Nirmal Aqua', description, prefill, theme: { color: '#0F4C4A' } });
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;background:#0F4C4A">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script><script>
function post(m){window.ReactNativeWebView.postMessage(JSON.stringify(m))}
var o=${opts};
o.handler=function(r){post({t:'ok',id:r.razorpay_payment_id})};
o.modal={ondismiss:function(){post({t:'cancel'})}};
window.onload=function(){try{var z=new Razorpay(o);z.on('payment.failed',function(r){post({t:'fail',msg:r.error&&r.error.description})});z.open()}catch(e){post({t:'fail',msg:String(e)})}};
</script></body></html>`;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F4C4A' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}>
          <Pressable onPress={onCancel} hitSlop={10}><Icon name="x" color="#F6F1E7" /></Pressable>
          <T v="h2" color="#F6F1E7">Secure payment · Test mode</T>
        </View>
        <WebView originWhitelist={['*']} source={{ html, baseUrl: 'https://checkout.razorpay.com' }} javaScriptEnabled domStorageEnabled setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(r) => {
            if (/^(https?:|about:|data:)/.test(r.url)) return true;
            Linking.openURL(r.url).catch(() => {}); return false; // UPI / bank app intents
          }}
          onMessage={(e) => {
            try {
              const m = JSON.parse(e.nativeEvent.data);
              if (m.t === 'ok') onSuccess(m.id); else if (m.t === 'cancel') onCancel(); else onFail(m.msg || 'Payment failed');
            } catch {}
          }} />
      </SafeAreaView>
    </Modal>
  );
}
