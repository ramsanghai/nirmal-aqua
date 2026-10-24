# Nirmal Aqua — Califnco Round 1 submission

E-commerce water purifier platform: **Android app** (Customer + Dealer) · **Admin panel on Vercel** · **daily AI Instagram + WhatsApp automation**. Everything runs on free tiers (₹0).

```
mobile/       Expo (React Native, TypeScript) Android app, Firebase Auth + Firestore + FCM
admin/        Next.js admin panel + /api/notify (FCM, EmailJS, TextBee) → deploy on Vercel
automation/   n8n workflow + WAHA docker-compose + Node fallback script (Instagram + WhatsApp Status)
seed/         52-product catalogue, generated product images, Firestore seed script
firestore.rules   security rules (roles enforced server-side)
SPEC.md       the shared Firestore / API contract
```

## What is built

| Brief requirement | Where |
|---|---|
| Catalog of 50+ items, images match names | `seed/catalog.mjs` (52 products, 5 categories); images in `admin/public/products/*.jpg` |
| Customer: cart, checkout, order history, service booking, profile, push | `mobile/src/screens/*` |
| Dealer: separate login (`role: "Dealer"`), wholesale prices, bulk orders, order history | sign-up as Dealer → `dealerStatus: pending` → admin approves → wholesale price + per-product min bulk qty |
| Admin: orders, approve/reject dealers, service desk, live on Vercel | `admin/` |
| Firebase Auth + Firestore + FCM | `mobile/src/firebase.ts`, `push.ts`, `admin/lib/server/*` |
| Razorpay test mode | `mobile/src/components/Razorpay.tsx` (Standard Checkout in a WebView, `rzp_test_` key) |
| Free maps / address | Leaflet + OpenStreetMap tiles + Nominatim search/reverse geocode (`MapPicker.tsx`) |
| Email + SMS | server-side in `/api/notify`: EmailJS REST + TextBee REST |
| AI automation (daily, image + caption + hashtags, no manual work) | `automation/` |
| Bonus: WhatsApp Status via WAHA | `automation/docker-compose.yml` + workflow node |
| Bonus: polish | dark mode (Auto/Light/Dark), animations, pinch-zoom lightbox, referral system (₹100 each, credited server-side) |

## Setup (about 45 minutes, all free)

1. **Firebase** — create a project (Spark plan). Enable *Authentication → Email/Password* and *Firestore*. Paste `firestore.rules` into Firestore → Rules. Add a **Web app** (copy config) and an **Android app** with package `com.nirmalaqua.app` (download `google-services.json` into `mobile/`). Project settings → Service accounts → generate a key (for the admin app and seed).
2. **Admin on Vercel** — push the repo to GitHub → Vercel → New Project → Root Directory `admin` → add env vars from `admin/.env.example` → Deploy. Note the URL.
3. **Seed products** — `cd seed && npm i && IMAGE_BASE=https://YOUR-ADMIN.vercel.app FIREBASE_SERVICE_ACCOUNT_JSON="$(cat key.json)" node seed.mjs`
4. **First admin** — sign up once in the app (or Firebase console), then `cd admin && node scripts/make-admin.mjs you@email.com` (see `admin/README.md`).
5. **Mobile** — `cd mobile && cp .env.example .env` and fill it (Firebase web config, `EXPO_PUBLIC_API_URL` = your Vercel URL, `EXPO_PUBLIC_RZP_KEY` = `rzp_test_…`). Run `npm i && npx expo start` for a quick look in Expo Go (push needs a real build), then build the APK: `npx eas-cli login && npx eas-cli build -p android --profile preview`.
6. **Automation** — follow `automation/README.md` (Google Sheet from `seed/products.csv`, Groq + Hugging Face + ImgBB keys, Meta Instagram token, WAHA QR scan with the secondary number).

Test card/UPI: Razorpay test mode accepts card `4111 1111 1111 1111` (any future expiry, any CVV) and UPI id `success@razorpay`.

## Tool choices and alternatives (state these in the form)

- **Product images:** generated locally (vector studio renders) and hosted from the admin app's `public/` folder on Vercel instead of Cloudinary/ImgBB — zero accounts, public URLs, same result.
- **Razorpay:** Standard Checkout inside a WebView, so no native module/ejecting is needed and it works with the test key only.
- **Maps:** OpenStreetMap + Nominatim (no key, no card).
- **Notifications:** FCM push, EmailJS email and TextBee SMS are all sent from one Vercel API route so no secrets live in the app.
- **Automation:** n8n (Docker) primary; `automation/scripts/post-daily.mjs` + GitHub Actions cron is a zero-cost fallback; Pollinations is the image fallback if the Hugging Face free tier is exhausted.

## Honest status

Code compiles: mobile `tsc` clean and `expo export --platform android` bundles; admin `tsc` passes and `next build` passes (with Google Fonts stubbed, because the sandbox blocks them); workflow JSON validated; automation script dry-run passes. **Not run against live services** (no Firebase / Vercel / Meta / WAHA / Razorpay accounts in the build environment), and the app was not run on a device — expect to spend a few minutes on first-run key fixes. FCM push only works in a real APK (not Expo Go) with `google-services.json`.
