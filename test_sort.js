import { db } from "./src/config/firebase.js";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

async function run() {
  console.log("Fetching predictions...");
  const q = query(collection(db, "predictions"), orderBy("submittedAt", "desc"), limit(5));
  try {
    const snap = await getDocs(q);
    snap.docs.forEach(doc => {
      const data = doc.data();
      let time = "No timestamp";
      if (data.submittedAt) {
        if (typeof data.submittedAt.toDate === 'function') {
          time = data.submittedAt.toDate().toISOString();
        } else {
          time = JSON.stringify(data.submittedAt);
        }
      }
      console.log(`ID: ${doc.id}, Time: ${time}`);
    });
  } catch (err) {
    console.error("Query failed:", err);
  }
  process.exit(0);
}

run();
