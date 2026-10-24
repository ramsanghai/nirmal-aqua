import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, SafeAreaView, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { F, useTheme } from '../theme';
import { Icon } from '../icons';
import { Button, T } from '../ui';
import { reverseGeocode, searchPlace } from '../geo';

const html = (lat: number, lng: number) => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><style>html,body,#m{height:100%;margin:0;background:#e8e4d8}.leaflet-control-attribution{font-size:9px}</style></head>
<body><div id="m"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
var map=L.map('m',{zoomControl:false}).setView([${lat},${lng}],15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
function send(){var c=map.getCenter();window.ReactNativeWebView.postMessage(JSON.stringify({lat:c.lat,lng:c.lng}))}
map.on('moveend',send);
function setPos(a,b){map.setView([a,b],17)}
send();
</script></body></html>`;

export interface Picked { lat: number; lng: number; line: string }

export function MapPicker({ visible, initial, onClose, onPick }: { visible: boolean; initial?: { lat: number; lng: number }; onClose: () => void; onPick: (p: Picked) => void }) {
  const { c } = useTheme();
  const web = useRef<any>(null);
  const start = initial ?? { lat: 18.5204, lng: 73.8567 }; // Pune default
  const pos = useRef(start);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ lat: number; lng: number; name: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const jump = (lat: number, lng: number) => { web.current?.injectJavaScript(`setPos(${lat},${lng});true;`); setResults([]); };
  const search = async () => { if (q.trim().length < 3) return; setBusy(true); setResults(await searchPlace(q)); setBusy(false); };
  const locate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const l = await Location.getCurrentPositionAsync({});
    jump(l.coords.latitude, l.coords.longitude);
  };
  const confirm = async () => {
    setBusy(true);
    const line = await reverseGeocode(pos.current.lat, pos.current.lng);
    setBusy(false);
    onPick({ ...pos.current, line });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}>
          <Pressable onPress={onClose} hitSlop={10}><Icon name="left" color={c.ink} /></Pressable>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 12, paddingHorizontal: 12 }}>
            <Icon name="search" size={18} color={c.muted} />
            <TextInput value={q} onChangeText={setQ} onSubmitEditing={search} returnKeyType="search" placeholder="Search area, landmark or pincode" placeholderTextColor={c.muted}
              style={{ flex: 1, fontFamily: F.body, fontSize: 14.5, color: c.ink, paddingVertical: 11, paddingHorizontal: 8 }} />
            {busy && <ActivityIndicator color={c.primary} />}
          </View>
        </View>
        {results.length > 0 && (
          <FlatList data={results} keyExtractor={(r) => r.name} style={{ maxHeight: 190, backgroundColor: c.card, borderBottomWidth: 1, borderColor: c.line }}
            renderItem={({ item }) => (
              <Pressable onPress={() => jump(item.lat, item.lng)} style={{ padding: 12, borderBottomWidth: 1, borderColor: c.line }}>
                <T numberOfLines={2}>{item.name}</T>
              </Pressable>
            )} />
        )}
        <View style={{ flex: 1 }}>
          <WebView ref={web} originWhitelist={['*']} source={{ html: html(start.lat, start.lng) }} javaScriptEnabled domStorageEnabled
            onMessage={(e) => { try { pos.current = JSON.parse(e.nativeEvent.data); } catch {} }} />
          <View pointerEvents="none" style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -22, marginTop: -44 }}>
            <Icon name="pin" size={44} color={c.danger} fill={c.danger} stroke={1.4} />
          </View>
          <Pressable onPress={locate} style={{ position: 'absolute', right: 14, bottom: 14, backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Icon name="pin" size={16} color={c.primary} /><T v="h2" style={{ fontSize: 13 }}>My location</T>
          </Pressable>
        </View>
        <View style={{ padding: 14, gap: 6, backgroundColor: c.bg }}>
          <T v="small">Move the map so the pin sits on your doorstep.</T>
          <Button title="Confirm this location" icon="check" onPress={confirm} loading={busy} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
