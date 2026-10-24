// Procedural studio-style product renders (SVG). Each drawer returns [svgBody, floorY, floorRx].
let n = 0;
let defs = '';
const gid = () => 'g' + n++;
export const reset = () => { n = 0; defs = ''; };
export const getDefs = () => defs;

export const sh = (hex, a) => {
  const v = parseInt(hex.slice(1), 16), r = v >> 16, g = (v >> 8) & 255, b = v & 255;
  const f = (c) => Math.max(0, Math.min(255, Math.round(a < 0 ? c * (1 + a) : c + (255 - c) * a)));
  return '#' + [f(r), f(g), f(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
};
const grad = (stops, { x1 = 0, y1 = 0, x2 = 1, y2 = 0 } = {}) => {
  const i = gid();
  defs += `<linearGradient id="${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`;
  return `url(#${i})`;
};
const radial = (stops, cx = 0.35, cy = 0.3, r = 0.8) => {
  const i = gid();
  defs += `<radialGradient id="${i}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`;
  return `url(#${i})`;
};
const cylStops = (c) => [[0, sh(c, -0.4)], [0.2, sh(c, 0.4)], [0.5, c], [0.82, sh(c, -0.2)], [1, sh(c, -0.45)]];
const hgrad = (c) => grad(cylStops(c));
const hgradV = (c) => grad(cylStops(c), { x1: 0, y1: 0, x2: 0, y2: 1 });
const vgrad = (c, a = 0.2, b = -0.12) => grad([[0, sh(c, a)], [1, sh(c, b)]], { x1: 0, y1: 0, x2: 0, y2: 1 });
const CHROME = () => grad([[0, '#6c7378'], [0.2, '#f6f9fb'], [0.5, '#a9b1b7'], [0.8, '#eef2f4'], [1, '#68717a']]);
const CHROMEV = () => grad([[0, '#6c7378'], [0.2, '#f6f9fb'], [0.5, '#a9b1b7'], [0.8, '#eef2f4'], [1, '#68717a']], { x1: 0, y1: 0, x2: 0, y2: 1 });
const BRASS = () => grad([[0, '#7a5a1c'], [0.25, '#f1d58a'], [0.55, '#c39a3a'], [1, '#6a4c14']]);
const FONT = 'font-family="Helvetica, Arial, sans-serif"';

const cyl = (x, y, w, h, c, { ry = Math.max(5, w * 0.1), fill, op = 1 } = {}) => {
  const f = fill || hgrad(c);
  return `<g opacity="${op}"><ellipse cx="${x + w / 2}" cy="${y + h - ry}" rx="${w / 2}" ry="${ry}" fill="${f}"/><rect x="${x}" y="${y + ry}" width="${w}" height="${h - 2 * ry}" fill="${f}"/><ellipse cx="${x + w / 2}" cy="${y + ry}" rx="${w / 2}" ry="${ry}" fill="${sh(c, 0.28)}"/><ellipse cx="${x + w / 2}" cy="${y + ry}" rx="${w / 2 - 3}" ry="${Math.max(2, ry - 2)}" fill="${sh(c, 0.1)}" opacity=".75"/></g>`;
};
const hcyl = (x, y, w, h, c, { rx = Math.max(5, h * 0.1), fill } = {}) => {
  const f = fill || hgradV(c);
  return `<ellipse cx="${x + rx}" cy="${y + h / 2}" rx="${rx}" ry="${h / 2}" fill="${sh(c, -0.25)}"/><rect x="${x + rx}" y="${y}" width="${w - 2 * rx}" height="${h}" fill="${f}"/><ellipse cx="${x + w - rx}" cy="${y + h / 2}" rx="${rx}" ry="${h / 2}" fill="${sh(c, 0.12)}"/>`;
};
const rbox = (x, y, w, h, r, c) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${vgrad(c)}"/><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="${r - 3}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>`;
const T = (x, y, s, size, fill, { w = 700, ls = 0, anchor = 'middle' } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" ${FONT} font-size="${size}" font-weight="${w}" letter-spacing="${ls}" fill="${fill}">${s}</text>`;
const shade = () => grad([[0, '#000', 0.42], [0.22, '#fff', 0.3], [0.5, '#fff', 0], [0.85, '#000', 0.16], [1, '#000', 0.5]]);
const water = (x, y, w, h, a = '#3fb6c9') =>
  `<clipPath id="wc${x}${y}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18"/></clipPath><g clip-path="url(#wc${x}${y})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#06383d"/><path d="M${x} ${y + h * 0.4} q${w / 8} -22 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0 V${y + h} H${x}z" fill="${a}" opacity=".8"/></g>`;
const drop = (x, y, s, c) => `<path d="M${x} ${y} c${-s * 0.7} ${s * 0.9} ${-s * 0.55} ${s * 1.5} 0 ${s * 1.5} s${s * 0.7} ${-s * 0.6} 0 ${-s * 1.5}z" fill="${c}"/>`;

// ---------- Purifiers ----------
const wall = (c, a, label, sub) => {
  let s = rbox(270, 140, 460, 660, 64, c);
  for (let i = 0; i < 6; i++) s += `<rect x="${340 + i * 54}" y="184" width="32" height="8" rx="4" fill="${sh(c, -0.22)}"/>`;
  s += `<rect x="310" y="236" width="380" height="410" rx="34" fill="${grad([[0, '#243a3f'], [1, '#0a1315']], { x1: 0, y1: 0, x2: 1, y2: 1 })}"/>`;
  s += `<path d="M344 236 h130 l-92 410 h-38 a34 34 0 0 1 -34 -34 v-342 a34 34 0 0 1 34 -34z" fill="#fff" opacity=".055"/>`;
  s += `<circle cx="500" cy="326" r="64" fill="none" stroke="${a}" stroke-width="7"/><circle cx="500" cy="326" r="52" fill="#0a1315"/>`;
  s += T(500, 336, '48', 40, a) + T(500, 366, 'TDS', 13, '#8fa9ad', { ls: 3 });
  s += water(350, 428, 300, 170);
  s += `<rect x="350" y="428" width="300" height="170" rx="18" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>`;
  [0, 1, 2].forEach((i) => (s += `<circle cx="${455 + i * 45}" cy="618" r="5" fill="${i === 0 ? a : '#37494d'}"/>`));
  s += T(500, 710, 'NIRMAL', 34, sh(c, -0.6), { ls: 10 }) + T(500, 746, sub, 17, sh(c, -0.5), { w: 600, ls: 2 });
  s += `<rect x="470" y="798" width="60" height="30" rx="8" fill="${sh(c, -0.25)}"/><rect x="494" y="826" width="12" height="26" rx="5" fill="${CHROMEV()}"/>`;
  return [s, 862, 250];
};
const under = (c, a, label, sub, big = false) => {
  let s = `<path d="M330 330 C330 250 420 250 500 250 S 700 250 700 330" stroke="${a}" stroke-width="14" fill="none" opacity=".8"/>`;
  const cols = ['#f1f3f2', '#26292c', '#f7f7f4'];
  [0, 1, 2].forEach((i) => {
    const x = 170 + i * 150;
    s += cyl(x, 330, 120, 440, cols[i]) + cyl(x - 6, 300, 132, 62, a === '#E8A33D' ? '#1f5fbf' : '#2a6fd1');
    s += `<rect x="${x + 22}" y="460" width="76" height="130" rx="8" fill="#fff" opacity=".92"/>` + T(x + 60, 510, ['5μ', 'CTO', 'RO'][i], 28, '#10211F') + T(x + 60, 548, ['SEDIMENT', 'CARBON', big ? '100 GPD' : '75 GPD'][i], 11, '#5b6a68', { ls: 1 });
  });
  s += `<rect x="640" y="300" width="230" height="470" rx="110" fill="${vgrad('#e9f0f8')}"/>` + `<clipPath id="tk"><rect x="640" y="300" width="230" height="470" rx="110"/></clipPath><rect x="640" y="535" width="230" height="235" fill="#2d6fd1" clip-path="url(#tk)"/><rect x="640" y="300" width="230" height="470" rx="110" fill="${shade()}"/>`;
  s += T(755, 505, '12 L', 24, '#10211F', { ls: 2 }) + cyl(725, 760, 60, 40, '#b9bec3');
  s += `<path d="M755 300 V270 H620" stroke="${a}" stroke-width="10" fill="none"/><rect x="150" y="768" width="740" height="16" rx="6" fill="#aab1b6"/>`;
  s += T(330, 840, sub, 22, '#10211F', { ls: 3, w: 600 });
  return [s, 790, 380];
};
const gravity = (c, a, label, sub, steel = false) => {
  const body = steel ? '#cfd5da' : c;
  let s = cyl(290, 480, 420, 330, body, { ry: 36 });
  s += cyl(310, 190, 380, 330, '#cfe9f5', { ry: 34, fill: grad([[0, '#9ccbe0', 0.55], [0.3, '#ffffff', 0.5], [0.7, '#bfe0ee', 0.45], [1, '#7fb2cc', 0.6]]) });
  s += `<clipPath id="gv"><rect x="310" y="330" width="380" height="190"/></clipPath><rect x="310" y="330" width="380" height="190" fill="#4fb8d0" opacity=".45" clip-path="url(#gv)"/>`;
  [0, 1].forEach((i) => (s += cyl(400 + i * 130, 400, 70, 120, '#f7f1e4')));
  s += cyl(300, 150, 400, 66, sh(body, -0.05), { ry: 26 }) + `<rect x="478" y="132" width="44" height="30" rx="10" fill="${sh(body, -0.3)}"/>`;
  s += T(500, 700, 'NIRMAL', 34, sh(body, -0.62), { ls: 10 }) + T(500, 738, sub, 17, sh(body, -0.55), { w: 600, ls: 2 });
  s += `<rect x="470" y="780" width="60" height="26" rx="8" fill="${a}"/><rect x="494" y="800" width="12" height="40" rx="5" fill="${CHROMEV()}"/>` + drop(500, 846, 10, '#58c4d8');
  return [s, 850, 260];
};
const counter = (c, a, label, sub) => {
  let s = cyl(335, 130, 330, 260, '#cfe9f5', { ry: 30, fill: grad([[0, '#9ccbe0', 0.55], [0.3, '#fff', 0.5], [0.7, '#bfe0ee', 0.45], [1, '#7fb2cc', 0.6]]) });
  s += `<clipPath id="ct"><rect x="335" y="270" width="330" height="120"/></clipPath><rect x="335" y="270" width="330" height="140" fill="#4fb8d0" opacity=".5" clip-path="url(#ct)"/>`;
  s += rbox(290, 370, 420, 430, 54, c) + `<rect x="330" y="420" width="340" height="190" rx="28" fill="#0e1b1d"/>`;
  s += `<circle cx="500" cy="515" r="52" fill="none" stroke="${a}" stroke-width="6"/><circle cx="500" cy="515" r="12" fill="${a}"/>` + [...Array(8)].map((_, i) => `<line x1="500" y1="515" x2="${500 + 44 * Math.cos((i * Math.PI) / 4)}" y2="${515 + 44 * Math.sin((i * Math.PI) / 4)}" stroke="${a}" stroke-width="4" opacity=".7"/>`).join('');
  s += T(500, 690, 'NIRMAL', 32, sh(c, -0.6), { ls: 9 }) + T(500, 726, sub, 16, sh(c, -0.5), { w: 600, ls: 2 });
  s += `<rect x="472" y="770" width="56" height="26" rx="8" fill="${sh(c, -0.3)}"/><rect x="494" y="790" width="12" height="22" rx="5" fill="${CHROMEV()}"/>`;
  return [s, 826, 260];
};
const commercial = (c, a, label, sub) => {
  let s = rbox(200, 130, 600, 690, 28, c) + `<rect x="240" y="170" width="520" height="80" rx="14" fill="#0e1b1d"/>`;
  [0, 1].forEach((i) => {
    const cx = 330 + i * 190;
    s += `<circle cx="${cx}" cy="210" r="30" fill="${CHROMEV()}"/><circle cx="${cx}" cy="210" r="24" fill="#fff"/><path d="M${cx - 16} ${210 + 12} A 20 20 0 1 1 ${cx + 16} ${210 + 12}" stroke="#10211F" stroke-width="2" fill="none"/><line x1="${cx}" y1="210" x2="${cx + 12}" y2="${196}" stroke="#d1432f" stroke-width="3"/>`;
  });
  s += T(660, 222, sub, 26, a, { ls: 2 });
  s += `<rect x="240" y="290" width="520" height="400" rx="16" fill="#0b1315"/>`;
  [0, 1, 2, 3].forEach((i) => (s += cyl(280 + i * 120, 320, 84, 340, i === 0 ? '#f1f3f2' : '#dfe4e6') + cyl(274 + i * 120, 300, 96, 50, '#2a6fd1')));
  s += `<path d="M322 305 V270 H700" stroke="${a}" stroke-width="8" fill="none"/>` + T(500, 750, 'NIRMAL COMMERCIAL', 28, sh(c, -0.6), { ls: 6 }) + `<rect x="260" y="812" width="40" height="20" rx="4" fill="#333"/><rect x="700" y="812" width="40" height="20" rx="4" fill="#333"/>`;
  return [s, 836, 330];
};

// ---------- Dispensers ----------
const bottle = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.3}" fill="${grad([[0, '#8fc2e3', 0.65], [0.3, '#fff', 0.6], [0.7, '#a9d4ee', 0.55], [1, '#6aa6cc', 0.7]])}"/><clipPath id="bw${x}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.3}"/></clipPath><rect x="${x}" y="${y + h * 0.28}" width="${w}" height="${h}" fill="#4aa9d6" opacity=".4" clip-path="url(#bw${x})"/>` +
  cyl(x + w * 0.3, y - 26, w * 0.4, 40, '#2a6fd1');
const taps = (x, y, w, c, a, sensor) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="150" rx="18" fill="#10191b"/>`;
  if (sensor) {
    s += `<circle cx="${x + w / 2}" cy="${y + 52}" r="26" fill="none" stroke="${a}" stroke-width="5"/><circle cx="${x + w / 2}" cy="${y + 52}" r="8" fill="${a}"/><rect x="${x + w / 2 - 14}" y="${y + 86}" width="28" height="40" rx="8" fill="${CHROMEV()}"/>`;
  } else {
    [['#d1432f', 0.28], ['#2f7fd6', 0.72]].forEach(([col, p]) => (s += `<rect x="${x + w * p - 22}" y="${y + 24}" width="44" height="26" rx="8" fill="${col}"/><rect x="${x + w * p - 14}" y="${y + 48}" width="28" height="52" rx="8" fill="${CHROMEV()}"/>`));
  }
  s += `<rect x="${x}" y="${y + 150}" width="${w}" height="14" rx="5" fill="${sh(c, -0.3)}"/>`;
  return s;
};
const floor = (c, a, label, sub, { bottom = false, sensor = false } = {}) => {
  let s = '';
  if (!bottom) {
    s += bottle(395, 50, 210, 250) + rbox(330, 270, 340, 540, 38, c);
  } else s += rbox(330, 90, 340, 720, 40, c);
  const ty = bottom ? 250 : 400;
  s += taps(370, ty, 260, c, a, sensor);
  s += T(500, ty - 38, 'NIRMAL', 20, sh(c, -0.6), { ls: 7 }) + T(500, ty + 205, sub, 14, sh(c, -0.5), { w: 600, ls: 2 });
  s += bottom
    ? `<rect x="352" y="560" width="296" height="224" rx="22" fill="${sh(c, -0.1)}"/><rect x="352" y="560" width="296" height="224" rx="22" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><rect x="470" y="580" width="60" height="9" rx="4" fill="${sh(c, -0.45)}"/>`
    : `<rect x="360" y="600" width="280" height="180" rx="16" fill="${sh(c, -0.08)}"/><rect x="360" y="600" width="280" height="180" rx="16" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><rect x="480" y="612" width="40" height="8" rx="4" fill="${sh(c, -0.45)}"/>`;
  return [s, 830, 200];
};
const tabletop = (c, a, label, sub, hot = true) => {
  let s = bottle(400, 130, 200, 230) + rbox(340, 340, 320, 470, 36, c);
  s += taps(370, 430, 260, c, a, false);
  s += T(500, 400, 'NIRMAL', 20, sh(c, -0.6), { ls: 7 }) + T(500, 650, sub, 15, sh(c, -0.5), { w: 600, ls: 2 });
  s += `<rect x="380" y="690" width="240" height="90" rx="14" fill="${sh(c, -0.08)}"/>`;
  s += `<rect x="360" y="808" width="40" height="16" rx="5" fill="#333"/><rect x="600" y="808" width="40" height="16" rx="5" fill="#333"/>`;
  return [s, 828, 190];
};
const bottlepump = (c, a) => {
  let s = `<rect x="340" y="280" width="320" height="520" rx="110" fill="${grad([[0, '#8fc2e3', 0.7], [0.3, '#fff', 0.6], [0.7, '#a9d4ee', 0.55], [1, '#6aa6cc', 0.75]])}"/><clipPath id="bp"><rect x="340" y="280" width="320" height="520" rx="110"/></clipPath><rect x="340" y="400" width="320" height="400" fill="#4aa9d6" opacity=".45" clip-path="url(#bp)"/>`;
  s += cyl(430, 210, 140, 90, '#2a6fd1') + cyl(465, 130, 70, 100, '#1c2024');
  s += `<rect x="440" y="96" width="120" height="44" rx="16" fill="${a}"/>` + `<path d="M560 150 Q 650 150 650 230" stroke="#1c2024" stroke-width="30" fill="none" stroke-linecap="round"/>` + `<rect x="632" y="236" width="36" height="44" rx="12" fill="#1c2024"/>`;
  s += T(500, 620, 'NIRMAL', 30, '#1c4a63', { ls: 8 }) + T(500, 656, '20 L', 18, '#1c4a63', { ls: 3 });
  return [s, 812, 210];
};

// ---------- Pumps ----------
const motorFins = (x, y, w, h, c) => [...Array(Math.floor(w / 26))].map((_, i) => `<rect x="${x + 14 + i * 26}" y="${y + 6}" width="6" height="${h - 12}" rx="3" fill="${sh(c, -0.3)}" opacity=".55"/>`).join('');
const plate = (x, y, txt, sub) => `<rect x="${x}" y="${y}" width="120" height="62" rx="8" fill="#f4f1e8"/>` + T(x + 60, y + 30, txt, 24, '#10211F') + T(x + 60, y + 50, sub, 11, '#5b6a68', { ls: 1 });
const monoblock = (c, a, label, sub, jet = false) => {
  let s = `<rect x="200" y="740" width="640" height="30" rx="8" fill="#4a4f55"/><rect x="230" y="768" width="60" height="16" rx="4" fill="#2b2f33"/><rect x="750" y="768" width="60" height="16" rx="4" fill="#2b2f33"/>`;
  s += hcyl(420, 430, 360, 250, c, { rx: 22 }) + motorFins(420, 430, 340, 250, c) + hcyl(764, 456, 76, 198, sh(c, -0.25), { rx: 14 });
  s += `<circle cx="330" cy="560" r="150" fill="${radial([[0, sh(jet ? '#2f8f5f' : '#8d949a', 0.3)], [1, sh(jet ? '#2f8f5f' : '#8d949a', -0.25)]])}"/><circle cx="330" cy="560" r="104" fill="${sh('#8d949a', 0.1)}" opacity=".5"/>`;
  [...Array(8)].forEach((_, i) => (s += `<circle cx="${330 + 128 * Math.cos((i * Math.PI) / 4)}" cy="${560 + 128 * Math.sin((i * Math.PI) / 4)}" r="9" fill="#3a3f45"/>`));
  s += `<circle cx="330" cy="560" r="34" fill="${CHROME()}"/>`;
  s += cyl(284, 250, 92, 190, '#8d949a') + cyl(268, 232, 124, 40, '#b6bcc1');
  if (jet) s += cyl(480, 330, 60, 110, '#8d949a') + cyl(466, 316, 88, 30, '#2f8f5f') + `<path d="M330 250 V210 H480" stroke="#8d949a" stroke-width="30" fill="none"/>`;
  s += hcyl(150, 536, 120, 50, '#8d949a') + plate(520, 456, sub.split(' ')[0], 'MONOBLOCK');
  return [s, 786, 360];
};
const submersible = (c, a, label, sub) => {
  let s = cyl(410, 170, 180, 560, '#b9c0c6', { ry: 22 });
  s += cyl(410, 520, 180, 150, '#2a2f34', { ry: 20 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 7; j++) s += `<circle cx="${440 + j * 20}" cy="${560 + i * 26}" r="4" fill="#8d949a"/>`;
  s += `<rect x="410" y="360" width="180" height="90" fill="${c}" opacity=".95"/>` + T(500, 412, sub, 26, '#fff', { ls: 2 }) + T(500, 440, 'SUBMERSIBLE', 11, '#fff', { ls: 3, w: 600 });
  s += cyl(450, 100, 100, 90, '#8d949a') + cyl(470, 60, 60, 60, '#b6bcc1') + `<path d="M545 170 C700 170 700 380 640 560 S 660 760 760 800" stroke="#1c2024" stroke-width="16" fill="none" stroke-linecap="round"/>`;
  s += cyl(410, 700, 180, 60, '#2a2f34', { ry: 18 });
  return [s, 770, 180];
};
const booster = (c, a, label, sub) => {
  let s = `<rect x="200" y="720" width="620" height="28" rx="8" fill="#4a4f55"/>`;
  s += hcyl(450, 440, 300, 230, c, { rx: 20 }) + motorFins(450, 440, 280, 230, c);
  s += rbox(270, 440, 190, 230, 18, '#9aa3aa') + cyl(310, 280, 100, 180, '#9aa3aa') + `<rect x="300" y="262" width="120" height="30" rx="8" fill="${CHROME()}"/>` + hcyl(180, 520, 110, 70, '#9aa3aa');
  s += rbox(500, 300, 190, 130, 20, '#eceff1') + `<circle cx="550" cy="365" r="34" fill="${CHROMEV()}"/><circle cx="550" cy="365" r="28" fill="#fff"/><line x1="550" y1="365" x2="566" y2="348" stroke="#d1432f" stroke-width="3"/><circle cx="640" cy="340" r="9" fill="#2fb36a"/><circle cx="640" cy="372" r="9" fill="#d9d9d9"/>`;
  s += plate(560, 520, sub.split(' ')[0], 'BOOSTER');
  return [s, 760, 360];
};

// ---------- Filters ----------
const shadeOver = (x, y, w, h, ry) => `<rect x="${x}" y="${y + ry}" width="${w}" height="${h - 2 * ry}" fill="${shade()}"/>`;
const pattern = (kind, c) => {
  const i = gid();
  defs += kind === 'spun'
    ? `<pattern id="${i}" patternUnits="userSpaceOnUse" width="16" height="16" patternTransform="rotate(32)"><rect width="16" height="16" fill="${c}"/><line x1="0" y1="0" x2="0" y2="16" stroke="${sh(c, -0.2)}" stroke-width="4"/><line x1="8" y1="0" x2="8" y2="16" stroke="${sh(c, 0.35)}" stroke-width="2"/></pattern>`
    : `<pattern id="${i}" patternUnits="userSpaceOnUse" width="12" height="12"><rect width="12" height="12" fill="${c}"/><circle cx="3" cy="4" r="1.6" fill="${sh(c, 0.3)}"/><circle cx="9" cy="9" r="1.4" fill="${sh(c, -0.3)}"/></pattern>`;
  return `url(#${i})`;
};
const cartridge = (x, y, w, h, kind, c, capC = '#2d3338') => {
  const ry = Math.max(8, w * 0.09);
  return cyl(x, y, w, h, c, { ry, fill: pattern(kind, c) }) + shadeOver(x, y, w, h, ry) + cyl(x - 5, y, w + 10, 38, capC, { ry: 12 }) + cyl(x - 5, y + h - 38, w + 10, 38, capC, { ry: 12 });
};
const candle = (c) => {
  let s = cyl(430, 190, 140, 560, c, { ry: 18 }) + `<rect x="430" y="208" width="140" height="520" fill="${shade()}" opacity=".7"/>`;
  s += cyl(415, 700, 170, 70, '#2d3338', { ry: 16 }) + cyl(470, 120, 60, 90, '#9aa3aa', { ry: 10 });
  for (let i = 0; i < 5; i++) s += `<rect x="470" y="${136 + i * 14}" width="60" height="3" fill="#6f777d" opacity=".7"/>`;
  s += `<rect x="440" y="440" width="120" height="70" rx="6" fill="#fff" opacity=".9"/>` + T(500, 470, 'CERAMIC', 17, '#10211F', { ls: 2 }) + T(500, 496, '0.3 μm', 13, '#5b6a68');
  return [s, 772, 160];
};
const spun = (c, a, label, sub, dark = false) => {
  let s = cartridge(430, 160, 140, 600, dark ? 'block' : 'spun', c);
  s += `<rect x="438" y="400" width="124" height="130" rx="8" fill="#fff" opacity=".93"/>` + T(500, 440, label, 26, '#10211F') + T(500, 472, sub, 13, '#5b6a68', { ls: 1.5 }) + `<rect x="450" y="490" width="100" height="6" rx="3" fill="${a}"/>`;
  return [s, 764, 170];
};
const membrane = (c, a, label, sub) => {
  let s = cyl(440, 150, 120, 620, '#f3f6f7', { ry: 14 }) + `<rect x="440" y="164" width="120" height="590" fill="${shade()}"/>`;
  s += cyl(436, 150, 128, 56, a, { ry: 12 }) + cyl(436, 714, 128, 56, a, { ry: 12 }) + cyl(484, 80, 32, 80, '#fff', { ry: 6 });
  s += `<rect x="446" y="300" width="108" height="300" rx="6" fill="${a}" opacity=".95"/>` + T(500, 360, 'RO', 34, '#fff') + T(500, 394, 'MEMBRANE', 11, '#fff', { ls: 2 }) + T(500, 450, sub, 22, '#fff') + T(500, 478, 'GPD', 13, '#fff', { ls: 3 }) + `<rect x="456" y="510" width="88" height="4" fill="#fff" opacity=".7"/>` + T(500, 540, '1812', 16, '#fff', { ls: 2 });
  return [s, 784, 150];
};
const uvlamp = (c, a, label, sub) => {
  const halo = radial([[0, '#9fc2ff', 0.55], [1, '#9fc2ff', 0]], 0.5, 0.5, 0.5);
  let s = `<ellipse cx="500" cy="430" rx="260" ry="380" fill="${halo}"/>`;
  s += cyl(470, 150, 60, 560, '#eaf2ff', { ry: 12, fill: grad([[0, '#6f9bf0'], [0.3, '#ffffff'], [0.55, '#dce9ff'], [1, '#5f8fe6']]) });
  s += cyl(462, 690, 76, 70, '#d9d4c4', { ry: 12 }) + [488, 512].map((x) => `<rect x="${x - 4}" y="750" width="8" height="40" fill="${CHROMEV()}"/>`).join('') + [488, 512].map((x) => `<rect x="${x - 4}" y="110" width="8" height="48" fill="${CHROMEV()}"/>`).join('');
  s += T(500, 620, sub, 20, '#1a3f8f', { ls: 2 });
  return [s, 796, 140];
};
const inline = (c, a, label, sub) => {
  let s = hcyl(250, 475, 140, 56, '#9ab6c9') + hcyl(610, 475, 140, 56, '#9ab6c9');
  s += cyl(380, 250, 240, 440, c, { ry: 26 }) + `<rect x="380" y="276" width="240" height="388" fill="${shade()}"/>`;
  s += `<rect x="406" y="400" width="188" height="170" rx="10" fill="#fff" opacity=".94"/>` + T(500, 450, label, 26, '#10211F') + T(500, 482, sub, 13, '#5b6a68', { ls: 1.5 }) + `<path d="M440 530 H540 M522 516 L540 530 L522 544" stroke="${a}" stroke-width="5" fill="none"/>`;
  s += cyl(440, 190, 120, 80, '#2a6fd1', { ry: 14 });
  return [s, 690, 250];
};
const housing = (c, a, label, sub, big = false) => {
  const h = big ? 600 : 520, top = big ? 190 : 230;
  let s = hcyl(210, 200, 130, 70, a) + hcyl(660, 200, 130, 70, a);
  s += cyl(330, 150, 340, 120, a, { ry: 30 }) + `<circle cx="500" cy="170" r="30" fill="#d1432f"/><circle cx="500" cy="170" r="30" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`;
  s += cyl(345, top + 60, 310, h - 40, '#cfe8ff', { ry: 30, fill: grad([[0, '#8fc2e3', 0.55], [0.3, '#fff', 0.5], [0.7, '#bfe0ee', 0.4], [1, '#6aa6cc', 0.6]]), op: 0.95 });
  s += cartridge(405, top + 90, 190, h - 130, 'spun', '#f4f0e6', '#d9d4c4');
  s += T(500, 215, sub, 26, '#fff', { ls: 3 });
  return [s, top + h + 14, 200];
};

// ---------- Spares ----------
const solenoid = () => {
  let s = hcyl(250, 480, 140, 70, '#e8eef0') + hcyl(610, 480, 140, 70, '#e8eef0');
  s += rbox(370, 440, 260, 170, 30, '#23272b') + cyl(410, 230, 180, 260, '#2b3035', { ry: 24 });
  s += `<rect x="440" y="300" width="120" height="70" rx="8" fill="#f1f1ec"/>` + T(500, 332, '24V DC', 22, '#10211F') + T(500, 354, 'SOLENOID', 11, '#5b6a68', { ls: 2 });
  s += `<path d="M470 240 C470 170 380 160 340 120" stroke="#d1432f" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M530 240 C530 170 620 160 660 120" stroke="#1c2024" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  return [s, 626, 300];
};
const smps = () => {
  let s = rbox(340, 340, 320, 230, 26, '#2a2e32');
  for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) s += `<rect x="${380 + i * 34}" y="${368 + j * 24}" width="20" height="8" rx="4" fill="#0e1113"/>`;
  s += `<rect x="372" y="440" width="256" height="100" rx="8" fill="#f1f1ec"/>` + T(500, 482, 'SMPS 24V 1.5A', 24, '#10211F') + T(500, 512, 'INPUT 100–240V AC', 13, '#5b6a68', { ls: 1 });
  s += `<path d="M340 460 C230 460 230 560 140 560" stroke="#1c2024" stroke-width="14" fill="none" stroke-linecap="round"/><rect x="100" y="540" width="60" height="40" rx="8" fill="#1c2024"/>`;
  s += `<path d="M660 450 C770 450 770 330 860 330" stroke="#1c2024" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="880" cy="330" r="22" fill="#1c2024"/><circle cx="880" cy="330" r="8" fill="#9aa3aa"/>`;
  return [s, 586, 300];
};
const diaphragm = () => {
  let s = rbox(470, 330, 230, 330, 36, '#2b2f33');
  for (let i = 0; i < 5; i++) s += `<rect x="496" y="${360 + i * 52}" width="178" height="12" rx="6" fill="#3d4349"/>`;
  s += cyl(290, 380, 200, 240, '#2a6fd1', { ry: 28 }) + `<circle cx="390" cy="500" r="40" fill="${sh('#2a6fd1', -0.2)}"/>`;
  s += cyl(330, 270, 44, 120, '#e8eef0', { ry: 8 }) + cyl(410, 270, 44, 120, '#e8eef0', { ry: 8 }) + T(390, 520, 'RO BOOSTER', 18, '#fff', { ls: 2 }) + T(390, 548, '100 GPD', 14, '#cfe0fb', { ls: 2 });
  s += `<path d="M700 520 C780 520 780 620 850 620" stroke="#d1432f" stroke-width="9" fill="none"/><path d="M700 560 C760 560 770 660 850 660" stroke="#1c2024" stroke-width="9" fill="none"/>`;
  return [s, 668, 300];
};
const faucet = () => {
  let s = cyl(420, 660, 160, 140, '#b9c0c6', { fill: CHROME() }) + cyl(455, 360, 90, 310, '#b9c0c6', { fill: CHROME() });
  s += `<path d="M500 380 V300 Q500 190 620 190 Q720 190 720 290 V400" stroke="${CHROMEV()}" stroke-width="58" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += cyl(690, 390, 60, 70, '#8d949a', { fill: CHROME() }) + `<rect x="430" y="470" width="120" height="30" rx="14" fill="#2a6fd1"/>` + drop(720, 480, 10, '#58c4d8');
  s += `<rect x="540" y="520" width="140" height="28" rx="14" fill="${CHROMEV()}" transform="rotate(-18 540 534)"/>`;
  return [s, 802, 220];
};
const floatv = () => {
  let s = cyl(260, 330, 140, 190, '#f1f3f2', { ry: 20 }) + cyl(280, 270, 100, 80, '#2a6fd1', { ry: 14 }) + hcyl(180, 400, 90, 44, '#e8eef0');
  s += `<path d="M390 440 L650 600" stroke="#8d949a" stroke-width="22" stroke-linecap="round"/><rect x="396" y="426" width="40" height="40" rx="12" fill="#2a6fd1" transform="rotate(30 416 446)"/>`;
  s += `<circle cx="720" cy="650" r="130" fill="${radial([[0, '#ffffff'], [0.6, '#d9e8f7'], [1, '#8fb4d9']])}"/><ellipse cx="720" cy="650" rx="130" ry="30" fill="#2a6fd1" opacity=".18"/><rect x="680" y="505" width="80" height="30" rx="10" fill="#8d949a"/>` + T(720, 662, 'FLOAT', 22, '#2a6fd1', { ls: 3 });
  return [s, 786, 340];
};
const tank = () => {
  let s = `<rect x="320" y="170" width="360" height="620" rx="170" fill="${vgrad('#eef2f6')}"/><clipPath id="tkc"><rect x="320" y="170" width="360" height="620" rx="170"/></clipPath><rect x="320" y="480" width="360" height="320" fill="#2b69c9" clip-path="url(#tkc)"/><rect x="320" y="170" width="360" height="620" rx="170" fill="${shade()}"/>`;
  s += `<rect x="320" y="470" width="360" height="14" fill="#1f4f9e" opacity=".8"/>` + T(500, 600, '12 L', 48, '#fff') + T(500, 636, 'PRESSURE TANK', 15, '#cfe0fb', { ls: 3 }) + T(500, 330, 'NIRMAL', 26, '#10211F', { ls: 8 });
  s += cyl(470, 770, 60, 70, '#b9c0c6', { fill: CHROME() }) + cyl(480, 130, 40, 60, '#b9c0c6', { fill: CHROME() });
  return [s, 842, 230];
};
const tubing = () => {
  let s = '';
  for (let i = 0; i < 7; i++) {
    const r = 120 + i * 28;
    s += `<ellipse cx="500" cy="520" rx="${r}" ry="${r * 0.62}" fill="none" stroke="${grad([[0, '#1d63c4'], [0.5, '#8fc0f5'], [1, '#1d63c4']])}" stroke-width="26"/>`;
  }
  s += `<path d="M690 560 C760 600 820 640 860 700" stroke="#2a6fd1" stroke-width="26" fill="none" stroke-linecap="round"/>` + `<ellipse cx="500" cy="520" rx="96" ry="58" fill="#e9eef0"/>` + T(500, 530, '¼″ · 10 m', 22, '#10211F', { ls: 2 });
  return [s, 760, 360];
};
const fittings = () => {
  let s = cyl(220, 300, 110, 200, '#e8eef0', { ry: 14 }) + cyl(205, 280, 140, 40, '#2a6fd1', { ry: 10 }) + cyl(205, 480, 140, 40, '#2a6fd1', { ry: 10 });
  s += hcyl(430, 350, 200, 90, '#e8eef0') + cyl(480, 280, 90, 100, '#e8eef0', { ry: 12 }) + hcyl(400, 380, 50, 100, '#2a6fd1', { rx: 10 }) + hcyl(610, 380, 50, 100, '#2a6fd1', { rx: 10 });
  s += cyl(700, 330, 100, 190, '#e8eef0', { ry: 14 }) + hcyl(640, 460, 160, 70, '#e8eef0') + cyl(690, 310, 120, 36, '#2a6fd1', { ry: 10 });
  s += hcyl(260, 600, 160, 70, '#e8eef0') + hcyl(240, 596, 40, 78, '#2a6fd1', { rx: 10 }) + hcyl(400, 596, 40, 78, '#2a6fd1', { rx: 10 });
  s += cyl(520, 570, 110, 140, '#e8eef0', { ry: 14 }) + cyl(505, 560, 140, 34, '#2a6fd1', { ry: 9 }) + `<circle cx="760" cy="640" r="46" fill="none" stroke="#2a6fd1" stroke-width="22"/>`;
  s += T(500, 790, 'PUSH-FIT 1/4″ ASSORTMENT', 22, '#10211F', { ls: 3, w: 600 });
  return [s, 810, 380];
};
const tds = () => {
  let s = cyl(440, 190, 120, 560, '#1e8a8a', { ry: 16 }) + cyl(430, 90, 140, 130, '#1c2024', { ry: 16 }) + `<rect x="458" y="270" width="84" height="64" rx="8" fill="#0c1513"/><rect x="462" y="274" width="76" height="56" rx="6" fill="#b9dcc9"/>` + T(500, 316, '048', 34, '#10211F', { w: 800 }) + T(500, 262, 'ppm', 11, '#fff', { ls: 2 });
  s += `<circle cx="500" cy="410" r="22" fill="${CHROMEV()}"/>` + T(500, 500, 'TDS', 28, '#fff', { ls: 3 }) + T(500, 530, 'METER', 12, '#cfe', { ls: 4 });
  s += `<rect x="470" y="745" width="12" height="70" rx="5" fill="${CHROMEV()}"/><rect x="518" y="745" width="12" height="70" rx="5" fill="${CHROMEV()}"/>`;
  return [s, 820, 130];
};
const gauge = () => {
  let s = cyl(455, 690, 90, 130, '#c39a3a', { fill: BRASS(), ry: 14 });
  s += `<circle cx="500" cy="450" r="250" fill="${CHROME()}"/><circle cx="500" cy="450" r="216" fill="#fbfbf8"/><circle cx="500" cy="450" r="216" fill="none" stroke="#c9ced3" stroke-width="3"/>`;
  for (let i = 0; i <= 20; i++) { const ang = (135 + i * 13.5) * (Math.PI / 180), r1 = i % 5 ? 182 : 168; s += `<line x1="${500 + r1 * Math.cos(ang)}" y1="${450 + r1 * Math.sin(ang)}" x2="${500 + 200 * Math.cos(ang)}" y2="${450 + 200 * Math.sin(ang)}" stroke="#10211F" stroke-width="${i % 5 ? 3 : 5}"/>`; }
  s += `<path d="M ${500 + 200 * Math.cos((135 + 216) * Math.PI / 180)} ${450 + 200 * Math.sin((135 + 216) * Math.PI / 180)} A 200 200 0 0 1 ${500 + 200 * Math.cos((135 + 270) * Math.PI / 180)} ${450 + 200 * Math.sin((135 + 270) * Math.PI / 180)}" stroke="#d1432f" stroke-width="12" fill="none"/>`;
  s += `<line x1="500" y1="450" x2="${500 + 150 * Math.cos(205 * Math.PI / 180)}" y2="${450 + 150 * Math.sin(205 * Math.PI / 180)}" stroke="#d1432f" stroke-width="7" stroke-linecap="round"/><circle cx="500" cy="450" r="20" fill="#10211F"/>` + T(500, 540, 'PSI', 30, '#10211F', { ls: 4 }) + T(500, 350, 'NIRMAL', 20, '#5b6a68', { ls: 6 });
  return [s, 822, 220];
};
const flowres = () => {
  let s = '';
  [[430, '300'], [540, '400'], [650, '500']].forEach(([y, t]) => {
    s += hcyl(220, y - 40, 120, 56, '#2a6fd1', { rx: 10 }) + hcyl(330, y - 52, 340, 80, '#e8e1cf', { rx: 16 }) + hcyl(660, y - 40, 120, 56, '#2a6fd1', { rx: 10 }) + T(500, y - 3, `FR ${t} ml/min`, 20, '#10211F', { ls: 1.5, w: 600 });
  });
  return [s, 720, 330];
};
const uvchamber = () => {
  let s = hcyl(250, 215, 160, 60, '#b9c0c6', { fill: CHROMEV() }) + hcyl(590, 665, 160, 60, '#b9c0c6', { fill: CHROMEV() });
  s += cyl(400, 180, 200, 600, '#c9ced3', { ry: 24, fill: CHROME() }) + `<rect x="400" y="200" width="200" height="560" fill="${shade()}" opacity=".5"/>`;
  [300, 640].forEach((y) => (s += `<rect x="396" y="${y}" width="208" height="14" rx="5" fill="#8d949a"/>`));
  s += cyl(450, 100, 100, 100, '#1c2024', { ry: 14 }) + `<path d="M550 130 C680 130 700 60 800 60" stroke="#1c2024" stroke-width="12" fill="none"/>` + T(500, 500, 'UV', 52, '#3a4047', { ls: 4 }) + T(500, 536, '316 STAINLESS', 13, '#3a4047', { ls: 3, w: 600 });
  return [s, 782, 200];
};
const memhousing = () => {
  let s = cyl(430, 150, 140, 610, '#f4f6f7', { ry: 16 }) + `<rect x="430" y="166" width="140" height="578" fill="${shade()}"/>`;
  s += cyl(420, 130, 160, 90, '#1c2024', { ry: 16 }) + cyl(420, 700, 160, 70, '#1c2024', { ry: 16 }) + hcyl(300, 150, 130, 44, '#e8eef0') + hcyl(570, 150, 130, 44, '#e8eef0') + cyl(480, 70, 40, 70, '#e8eef0', { ry: 8 });
  s += T(500, 450, 'RO', 40, '#10211F') + T(500, 484, 'MEMBRANE HOUSING', 12, '#5b6a68', { ls: 2 }) + T(500, 512, '1812 · 300 PSI', 12, '#5b6a68', { ls: 2 });
  return [s, 772, 170];
};

export const ART = { wall, under, gravity, counter, commercial, floor, tabletop, bottlepump, monoblock, submersible, booster, candle, spun, membrane, uvlamp, inline, housing, solenoid, smps, diaphragm, faucet, floatv, tank, tubing, fittings, tds, gauge, flowres, uvchamber, memhousing };

const TINT = { Purifiers: '#d9e8ea', Dispensers: '#eadfc9', Pumps: '#dfe3e6', Filters: '#dfeadf', Spares: '#ebe4d6' };
export function renderSvg(category, type, args) {
  reset();
  const [body, fy, frx] = ART[type](...args);
  const t = TINT[category] || '#e5e5e5';
  const bg = `<radialGradient id="bg" cx=".5" cy=".38" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${t}"/></radialGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000"><defs>${getDefs()}${bg}<filter id="ds" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#10211F" flood-opacity=".2"/></filter><filter id="bl"><feGaussianBlur stdDeviation="16"/></filter></defs><rect width="1000" height="1000" fill="url(#bg)"/><rect y="${fy - 2}" width="1000" height="${1000 - fy + 2}" fill="${sh(t, -0.07)}" opacity=".55"/><ellipse cx="500" cy="${fy + 6}" rx="${frx}" ry="26" fill="#10211F" opacity=".28" filter="url(#bl)"/><g filter="url(#ds)">${body}</g></svg>`;
}
