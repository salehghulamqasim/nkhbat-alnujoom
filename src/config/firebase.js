import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

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

export const db = getFirestore(app)
export const rtdb = getDatabase(app)

export default app
