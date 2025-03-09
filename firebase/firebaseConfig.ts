import { getApp, getApps, initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC3asIejQ5bP-29GhIZIO4CnlAZO0wETqQ",
  authDomain: "sacred-armor-452904-c0.firebaseapp.com",
  projectId: "sacred-armor-452904-c0",
  storageBucket: "sacred-armor-452904-c0.firebasestorage.app",
  messagingSenderId: "461776259687",
  appId: "1:461776259687:web:558026e90baef5a63522c2",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export {app,auth};
