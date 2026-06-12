import { db } from "../config/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  limitToLast,
  startAfter,
  endBefore,
  serverTimestamp,
  getCountFromServer,
  increment
} from "firebase/firestore";

// -- USERS --
export const registerUser = async (name, mobile, pin) => {
  const userRef = doc(db, "users", mobile);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    throw new Error("User with this mobile number already exists.");
  }

  const userData = {
    userId: mobile,
    name,
    mobile,
    pin,
    points: 0,
    status: "pending", // pending, approved, rejected
    createdAt: serverTimestamp()
  };

  await setDoc(userRef, userData);
  return userData;
};

export const loginUser = async (mobile, pin) => {
  const userRef = doc(db, "users", mobile);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error("User not found. Please register first.");
  }
  
  const userData = userSnap.data();
  if (userData.pin && userData.pin !== pin) {
    throw new Error("Invalid PIN.");
  }
  
  if (userData.status === "pending") {
    throw new Error("Your account is pending admin approval.");
  }
  if (userData.status === "rejected") {
    throw new Error("Your account registration was rejected.");
  }
  
  return userData;
};

export const getUserStats = async (mobile) => {
  const userRef = doc(db, "users", mobile);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error("User not found.");
  }
  
  // Get predictions count
  const q = query(collection(db, "predictions"), where("userId", "==", mobile));
  const querySnapshot = await getDocs(q);
  
  let correctPredictions = 0;
  querySnapshot.forEach((doc) => {
    if (doc.data().points > 0) {
      correctPredictions++;
    }
  });

  return {
    ...userSnap.data(),
    predictionsCount: querySnapshot.size,
    correctPredictions
  };
};


// -- ADMIN --
export const loginAdmin = async (username, password) => {
  const adminRef = doc(db, "admins", username);
  const adminSnap = await getDoc(adminRef);
  
  if (!adminSnap.exists() || adminSnap.data().password !== password) {
    throw new Error("Invalid admin credentials.");
  }
  
  return { username };
};

export const getPendingUsers = async () => {
  const q = query(collection(db, "users"), where("status", "==", "pending"));
  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs.map(doc => doc.data());
  
  // Sort descending by createdAt to avoid requiring a composite index in Firestore
  return users.sort((a, b) => {
    const getMs = (date) => {
      if (!date) return 0;
      return date.seconds ? date.seconds * 1000 : new Date(date).getTime();
    };
    return getMs(b.createdAt) - getMs(a.createdAt);
  });
};

export const approveUser = async (mobile) => {
  const userRef = doc(db, "users", mobile);
  await updateDoc(userRef, { status: "approved" });
};

export const rejectUser = async (mobile) => {
  const userRef = doc(db, "users", mobile);
  await updateDoc(userRef, { status: "rejected" });
};


// -- MATCHES --
export const getMatches = async () => {
  const matchesRef = collection(db, "matches");
  const q = query(matchesRef, orderBy("matchDateTime", "asc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const createMatch = async (matchData) => {
  const matchRef = doc(collection(db, "matches"));
  await setDoc(matchRef, {
    matchId: matchRef.id,
    ...matchData,
    status: "upcoming" // upcoming, completed
  });
  return matchRef.id;
};

export const updateMatch = async (matchId, matchData) => {
  const matchRef = doc(db, "matches", matchId);
  await updateDoc(matchRef, matchData);
};

export const deleteMatch = async (matchId) => {
  await deleteDoc(doc(db, "matches", matchId));
};


// -- PREDICTIONS --
export const submitPrediction = async (userId, matchId, predictedA, predictedB) => {
  const predictionId = `${userId}_${matchId}`;
  const predictionRef = doc(db, "predictions", predictionId);
  
  await setDoc(predictionRef, {
    predictionId,
    userId,
    matchId,
    predictedA: parseInt(predictedA),
    predictedB: parseInt(predictedB),
    points: 0,
    submittedAt: serverTimestamp()
  });
};

export const getUserPredictions = async (userId) => {
  const q = query(collection(db, "predictions"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data());
};

export const getAllPredictions = async () => {
  const q = query(collection(db, "predictions"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

export const getPredictionsPaginated = async (pageSize = 10, lastDocSnap = null, direction = "next", firstDocSnap = null) => {
  const predictionsRef = collection(db, "predictions");
  let q;

  if (direction === "next" && lastDocSnap) {
    q = query(predictionsRef, orderBy("submittedAt", "desc"), startAfter(lastDocSnap), limit(pageSize));
  } else if (direction === "prev" && firstDocSnap) {
    q = query(predictionsRef, orderBy("submittedAt", "desc"), endBefore(firstDocSnap), limitToLast(pageSize));
  } else {
    // Initial load
    q = query(predictionsRef, orderBy("submittedAt", "desc"), limit(pageSize));
  }

  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;
  
  return {
    predictions: docs.map(doc => doc.data()),
    firstDocSnap: docs.length > 0 ? docs[0] : null,
    lastDocSnap: docs.length > 0 ? docs[docs.length - 1] : null,
    isEmpty: docs.length === 0,
    hasMore: docs.length === pageSize
  };
};


// -- RESULTS & LEADERBOARD --
export const setMatchResult = async (matchId, scoreA, scoreB) => {
  const matchRef = doc(db, "matches", matchId);
  await updateDoc(matchRef, {
    scoreA: parseInt(scoreA),
    scoreB: parseInt(scoreB),
    status: "completed"
  });

  // Calculate points for all predictions for this match
  const q = query(collection(db, "predictions"), where("matchId", "==", matchId));
  const querySnapshot = await getDocs(q);

  for (const predictionDoc of querySnapshot.docs) {
    const prediction = predictionDoc.data();
    let oldPoints = prediction.points || 0;
    let newPoints = 0;
    
    // Rule: Exact score prediction = 1 point, otherwise 0
    if (prediction.predictedA === parseInt(scoreA) && prediction.predictedB === parseInt(scoreB)) {
      newPoints = 1;
    }
    
    const pointDiff = newPoints - oldPoints;
    
    // Update prediction points if they changed
    if (oldPoints !== newPoints) {
      await updateDoc(predictionDoc.ref, { points: newPoints });
    }

    // Safely update user's total points only by the difference
    if (pointDiff !== 0) {
      const userRef = doc(db, "users", prediction.userId);
      await updateDoc(userRef, { points: increment(pointDiff) });
    }
  }
};

const recalculateUserPoints = async (userId) => {
  const q = query(collection(db, "predictions"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  let totalPoints = 0;
  querySnapshot.forEach((doc) => {
    totalPoints += doc.data().points || 0;
  });

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { points: totalPoints });
};

export const getLeaderboard = async () => {
  // Same rank logic handled on the frontend based on the sorted list
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("points", "desc"), limit(10));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data());
};

export const getAllUsers = async () => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);
  return querySnapshot.docs.map(doc => doc.data());
};

export const getTotalUsersCount = async () => {
  const coll = collection(db, "users");
  const snapshot = await getCountFromServer(coll);
  return snapshot.data().count;
};

export const getUsersPaginated = async (pageSize = 10, lastDocSnap = null, direction = "next", firstDocSnap = null) => {
  const usersRef = collection(db, "users");
  let q;

  // We order by name as the default in Dashboard, but Firestore needs an index if we order by name.
  // Wait, if we just orderBy("createdAt", "desc") it might be easier or we can order by name.
  // The original dashboard sorted by name locally. We'll order by userId to keep it simple, or 'name' if we create an index.
  // Let's order by 'createdAt' descending, which is standard for user lists. Or by 'name'.
  // Actually, let's stick to 'name' ascending. If it fails, we will see an error.
  
  if (direction === "next" && lastDocSnap) {
    q = query(usersRef, orderBy("name", "asc"), startAfter(lastDocSnap), limit(pageSize));
  } else if (direction === "prev" && firstDocSnap) {
    q = query(usersRef, orderBy("name", "asc"), endBefore(firstDocSnap), limitToLast(pageSize));
  } else {
    q = query(usersRef, orderBy("name", "asc"), limit(pageSize));
  }

  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;
  
  return {
    users: docs.map(doc => doc.data()),
    firstDocSnap: docs.length > 0 ? docs[0] : null,
    lastDocSnap: docs.length > 0 ? docs[docs.length - 1] : null,
    isEmpty: docs.length === 0,
    hasMore: docs.length === pageSize
  };
};


export const getUsersByIds = async (userIds) => {
  if (!userIds || userIds.length === 0) return [];
  
  const uniqueIds = [...new Set(userIds)];
  const results = [];
  
  for (let i = 0; i < uniqueIds.length; i += 10) {
    const chunk = uniqueIds.slice(i, i + 10);
    const q = query(collection(db, "users"), where("userId", "in", chunk));
    const snap = await getDocs(q);
    snap.forEach(doc => results.push(doc.data()));
  }
  
  return results;
};

export const recalculateAllUsersPoints = async () => {
  const usersRef = collection(db, "users");
  const usersSnap = await getDocs(usersRef);
  
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const q = query(collection(db, "predictions"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    let totalPoints = 0;
    querySnapshot.forEach((doc) => {
      totalPoints += doc.data().points || 0;
    });

    await updateDoc(doc(db, "users", userId), { points: totalPoints });
  }
};
