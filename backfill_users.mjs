import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUN5MTJDJ2M0BLHTeS0xAflj0n9wRkGME",
  authDomain: "world-cup-2026-71e07.firebaseapp.com",
  projectId: "world-cup-2026-71e07",
  storageBucket: "world-cup-2026-71e07.firebasestorage.app",
  messagingSenderId: "341389631611",
  appId: "1:341389631611:web:85936db4a7afcc64c9c2de"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Starting backfill of nameLower for existing users...");
  const snap = await getDocs(collection(db, "users"));
  
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.name && !data.nameLower) {
      await updateDoc(docSnap.ref, { nameLower: data.name.toLowerCase() });
      updated++;
    }
  }

  console.log(`Successfully backfilled ${updated} users with nameLower field!`);
  process.exit(0);
}

run();
