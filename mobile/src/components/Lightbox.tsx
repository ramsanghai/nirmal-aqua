import React from 'react';
import { Modal, Pressable, SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Icon } from '../icons';
import { T } from '../ui';

// Pinch-to-zoom, pan and double-tap zoom implemented inside a tiny HTML page (works on every Android WebView).
const page = (uri: string) => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>html,body{margin:0;height:100%;background:#0b1211;overflow:hidden;touch-action:none}img{position:absolute;left:50%;top:50%;max-width:100%;max-height:100%;transform:translate(-50%,-50%);will-change:transform}</style></head>
<body><img id="i" src="${uri}"/><script>
var i=document.getElementById('i'),s=1,x=0,y=0,ps=1,d0=0,lx=0,ly=0,last=0;
function ap(){i.style.transform='translate(calc(-50% + '+x+'px), calc(-50% + '+y+'px)) scale('+s+')'}
function dist(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)}
document.addEventListener('touchstart',function(e){
 if(e.touches.length==2){d0=dist(e.touches);ps=s}
 else{lx=e.touches[0].clientX;ly=e.touches[0].clientY;var n=Date.now();if(n-last<280){s=s>1.2?1:2.6;x=0;y=0;ap()}last=n}
},{passive:false});
document.addEventListener('touchmove',function(e){e.preventDefault();
 if(e.touches.length==2){s=Math.min(6,Math.max(1,ps*dist(e.touches)/d0));if(s==1){x=0;y=0}ap()}
 else if(s>1){x+=e.touches[0].clientX-lx;y+=e.touches[0].clientY-ly;lx=e.touches[0].clientX;ly=e.touches[0].clientY;ap()}
},{passive:false});
</script></body></html>`;

export function Lightbox({ uri, title, onClose }: { uri: string | null; title?: string; onClose: () => void }) {
  return (
    <Modal visible={!!uri} animationType="fade" transparent onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1211' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 }}>
          <T v="h2" color="#EFE9DB" numberOfLines={1} style={{ flex: 1 }}>{title}</T>
          <Pressable onPress={onClose} hitSlop={12}><Icon name="x" color="#EFE9DB" size={26} /></Pressable>
        </View>
        {uri && <WebView originWhitelist={['*']} source={{ html: page(uri) }} style={{ backgroundColor: '#0b1211' }} scrollEnabled={false} />}
        <T v="small" color="#9AA8A4" style={{ textAlign: 'center', padding: 12 }}>Pinch to zoom · double-tap to toggle</T>
      </SafeAreaView>
    </Modal>
  );
}
