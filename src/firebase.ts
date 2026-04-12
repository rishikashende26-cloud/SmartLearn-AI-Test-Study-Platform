import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This will be replaced by the actual config once Firebase is set up
const firebaseConfig = {
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder"
};

let app;
try {
  // Try to import the real config if it exists
  // @ts-ignore
  const realConfig = await import('./firebase-applet-config.json');
  app = initializeApp(realConfig.default);
} catch (e) {
  app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
