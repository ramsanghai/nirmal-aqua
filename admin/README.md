# Nirmal Aqua - Admin panel

Next.js (App Router, TypeScript) back office plus the `/api/notify` endpoint used by the mobile app.
Contract: see `../SPEC.md`. Firestore rules: `../firestore.rules`.

Stack: Firebase Auth + Firestore (Spark plan), Vercel Hobby, EmailJS free, TextBee free. This app needs **no Firebase Storage**;
product images are static files in `public/products/<id>.png`, served at `/products/<id>.png`.

## Local run

```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. Vercel: **Add New > Project**, import the repo.
3. Set **Root Directory** to `admin`. Framework preset: Next.js (auto).
4. Add every variable from `.env.example` under Settings > Environment Variables.
   `FIREBASE_SERVICE_ACCOUNT_JSON` is the whole service-account key file (Firebase console > Project settings > Service accounts > Generate new private key), pasted as one line, or base64 of the file.
5. Deploy. Set the resulting URL as the notify base URL (`ADMIN_URL`) in the mobile app.
6. Firebase console > Authentication > Settings > Authorized domains: add your Vercel domain.

EmailJS template must use the params `to_email`, `to_name`, `subject`, `message`. Missing EmailJS/TextBee/FCM config just skips that channel.

## Create the first Admin

1. Create the user in Firebase console > Authentication (email + password), or sign up through the mobile app.
2. Run:

```bash
export FIREBASE_SERVICE_ACCOUNT_JSON="$(cat serviceAccount.json)"
node scripts/make-admin.mjs you@example.com
```

It sets `users/{uid}.role = 'Admin'`, creating the document if absent. Then sign in at `/login`.
Non-admin accounts are signed out with a message.

## Notify API

`POST /api/notify` with `Authorization: Bearer <Firebase ID token>` and `{ "kind", "id" }`.
Returns `{ "push", "email", "sms" }`, each `"sent" | "skipped" | "failed"`. CORS is open for the mobile app.
