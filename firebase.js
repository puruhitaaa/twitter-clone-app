import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_API_KEY,
  authDomain: 'twitter-clone-dceb0.firebaseapp.com',
  projectId: 'twitter-clone-dceb0',
  storageBucket: 'twitter-clone-dceb0.appspot.com',
  messagingSenderId: '561208701998',
  appId: '1:561208701998:web:74f270a9a333e8d521dbbf',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
const storage = getStorage(app);

export default app;
export { firestore, storage };
