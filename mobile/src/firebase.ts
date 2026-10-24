import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'missing-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'missing-project',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const fresh = getApps().length === 0;
const app = fresh ? initializeApp(config) : getApp();

// React Native build of firebase/auth exposes getReactNativePersistence (types only ship the web build).
const rnPersistence = (FirebaseAuth as any).getReactNativePersistence?.(AsyncStorage);
export const auth = fresh && rnPersistence
  ? FirebaseAuth.initializeAuth(app, { persistence: rnPersistence })
  : FirebaseAuth.getAuth(app);

// Long polling avoids WebChannel streaming problems on some Android networks.
export const db = fresh ? initializeFirestore(app, { experimentalForceLongPolling: true }) : getFirestore(app);

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
export const RZP_KEY = process.env.EXPO_PUBLIC_RZP_KEY || '';
