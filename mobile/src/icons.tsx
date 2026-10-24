import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const P: Record<string, string[]> = {
  home: ['M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z'],
  shop: ['M4 8h16l-1 12H5z', 'M8 8V6a4 4 0 018 0v2'],
  cart: ['M3 4h2l2.4 11h10.2L20 7H6.2'],
  orders: ['M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z', 'M9 8h6', 'M9 12h6'],
  service: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v4', 'M16 3v4', 'M9 15l2 2 4-4'],
  user: ['M12 12a4 4 0 100-8 4 4 0 000 8z', 'M4 21a8 8 0 0116 0'],
  search: ['M20 20l-4-4'],
  plus: ['M12 5v14M5 12h14'], minus: ['M5 12h14'], x: ['M6 6l12 12M18 6L6 18'],
  check: ['M5 12l5 5 9-10'], right: ['M9 6l6 6-6 6'], left: ['M15 6l-6 6 6 6'],
  pin: ['M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z'],
  moon: ['M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z'],
  sun: ['M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4'],
  share: ['M4 12v7h16v-7', 'M12 3v12', 'M8 7l4-4 4 4'],
  copy: ['M9 9h11v11H9z', 'M5 15V4h11'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13'],
  drop: ['M12 3s6 6.4 6 11a6 6 0 11-12 0c0-4.6 6-11 6-11z'],
  gift: ['M4 10h16v10H4z', 'M3 7h18v3H3z', 'M12 7v13', 'M12 7c-3 0-4-4-1.5-4S12 7 12 7zm0 0c3 0 4-4 1.5-4S12 7 12 7z'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z'],
  mail: ['M3 5h18v14H3z', 'M3 6l9 7 9-7'],
  lock: ['M6 11h12v10H6z', 'M8 11V8a4 4 0 018 0v3'],
  star: ['M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z'],
  truck: ['M2 6h12v10H2z', 'M14 10h4l3 3v3h-7z'],
  box: ['M3 7l9-4 9 4v10l-9 4-9-4z', 'M3 7l9 4 9-4', 'M12 11v10'],
  info: ['M12 8v.01', 'M12 11v6'],
  logout: ['M9 4H4v16h5', 'M16 8l4 4-4 4', 'M20 12H9'],
  zoom: ['M20 20l-4-4', 'M8 11h6', 'M11 8v6'],
};
const CIRCLES: Record<string, [number, number, number][]> = {
  search: [[11, 11, 7]], cart: [[9, 20, 1.5], [17, 20, 1.5]], sun: [[12, 12, 4]], pin: [[12, 10, 2.5]],
  info: [[12, 12, 9]], truck: [[6, 18, 1.8], [17, 18, 1.8]], zoom: [[11, 11, 7]],
};
export type IconName = keyof typeof P;

export function Icon({ name, size = 22, color = '#000', stroke = 1.8, fill }: { name: IconName; size?: number; color?: string; stroke?: number; fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {(P[name] || []).map((d, i) => (
        <Path key={i} d={d} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill={i === 0 && fill ? fill : 'none'} />
      ))}
      {(CIRCLES[name] || []).map(([cx, cy, r], i) => (
        <Circle key={'c' + i} cx={cx} cy={cy} r={r} stroke={color} strokeWidth={stroke} fill={name === 'cart' ? color : 'none'} />
      ))}
    </Svg>
  );
}

export function DropMark({ size = 28, color = '#E8A33D', shine = '#fff' }: { size?: number; color?: string; shine?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2s7 7.2 7 12.4A7 7 0 015 14.4C5 9.200 12 2 12 2z" fill={color} />
      <Path d="M8.600 14.200c.2 1.800 1.200 3 2.800 3.500" stroke={shine} strokeOpacity={0.75} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
