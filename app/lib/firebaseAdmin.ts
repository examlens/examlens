import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase Admin SDK
let app;

if (getApps().length === 0) {
  // Try to use service account credentials from environment
  if (process.env.FIREBASE_ADMIN_SDK_KEY) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_ADMIN_SDK_KEY
    );
    app = initializeApp({
      credential: cert(serviceAccount),
      ...firebaseAdminConfig,
    });
  } else {
    // Fallback: use Application Default Credentials
    // This works in Firebase App Hosting and Cloud Functions
    app = initializeApp(firebaseAdminConfig);
  }
}

export const adminStorage = getStorage(app);
export const adminApp = app;
