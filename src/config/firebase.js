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

// Enable offline persistence for Firestore
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

export const rtdb = getDatabase(app)

// Connect to emulators locally during development & testing
const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname === 'localhost')
if (isDev) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectDatabaseEmulator(rtdb, '127.0.0.1', 9000)
}

export default app
