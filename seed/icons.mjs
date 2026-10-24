import { chromium } from 'playwright';
const drop = (fill, shine, scale = 1, bg = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${bg}<g transform="translate(512 512) scale(${scale}) translate(-512 -512)"><path d="M512 150 C512 150 780 430 780 640 A268 268 0 0 1 244 640 C244 430 512 150 512 150 Z" fill="${fill}"/><path d="M365 640 C372 735 420 790 490 812" stroke="${shine}" stroke-opacity=".8" stroke-width="42" stroke-linecap="round" fill="none"/></g></svg>`;
const out = new URL('../mobile/assets/', import.meta.url).pathname;
const jobs = {
  'icon.png': drop('#E8A33D', '#fff', 0.85, '<rect width="1024" height="1024" fill="#0F4C4A"/>'),
  'android-icon-foreground.png': drop('#E8A33D', '#fff', 0.62),
  'android-icon-background.png': '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#0F4C4A"/></svg>',
  'android-icon-monochrome.png': drop('#000', '#fff', 0.62),
  'splash-icon.png': drop('#E8A33D', '#fff', 0.8),
  'favicon.png': drop('#E8A33D', '#fff', 0.85, '<rect width="1024" height="1024" fill="#0F4C4A"/>'),
};
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1024, height: 1024 } });
for (const [f, svg] of Object.entries(jobs)) { await pg.setContent(`<body style="margin:0;background:transparent">${svg}</body>`); await pg.screenshot({ path: out + f, omitBackground: true }); }
await b.close(); console.log('icons ok');
