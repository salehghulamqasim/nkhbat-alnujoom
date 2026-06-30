import { initializeApp } from 'firebase/app'
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  connectFirestoreEmulator 
} from 'firebase/firestore'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCfC2gWBc_CNV0vmTUrqPUE-pkO4Q92tHM",
  authDomain: "nkhbat-alnujoom.firebaseapp.com",
  databaseURL: "https://nkhbat-alnujoom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nkhbat-alnujoom",
  storageBucket: "nkhbat-alnujoom.firebasestorage.app",
  messagingSenderId: "309990493425",
  appId: "1:309990493425:web:b3f09955052a1651446d50"
}; 

const app = initializeApp(firebaseConfig)

import { getFirestore } from 'firebase/firestore'

// Disable offline persistence for now so you don't see cached emulator data
export const db = getFirestore(app)

export const rtdb = getDatabase(app)

// Connect to emulators locally during development & testing
// Disabled for production - set VITE_USE_EMULATORS=true in .env.local to enable for local dev
const useEmulators = false
if (useEmulators) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectDatabaseEmulator(rtdb, '127.0.0.1', 9000)
}

export default app
