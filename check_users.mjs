import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";

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
  console.log("Fetching user names...");
  const q = query(collection(db, "users"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  
  let count = 0;
  snap.docs.forEach(doc => {
    const data = doc.data();
    if (count < 20) {
      console.log(`"${data.name}"`);
    }
    count++;
  });
  
  console.log(`Total users: ${count}`);
  process.exit(0);
}

run();
