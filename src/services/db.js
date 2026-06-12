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
  serverTimestamp
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
  
  const userPointUpdates = {};

  for (const predictionDoc of querySnapshot.docs) {
    const prediction = predictionDoc.data();
    let points = 0;
    
    // Rule: Exact score prediction = 1 point, otherwise 0
    if (prediction.predictedA === parseInt(scoreA) && prediction.predictedB === parseInt(scoreB)) {
      points = 1;
    }
    
    // Update prediction points
    await updateDoc(predictionDoc.ref, { points });

    // We need to recalculate total points for this user later, or increment here
    // But since results can be corrected, it's safer to recalculate total points from all predictions
    if (!userPointUpdates[prediction.userId]) {
      userPointUpdates[prediction.userId] = true;
    }
  }

  // Recalculate total points for affected users
  for (const userId of Object.keys(userPointUpdates)) {
    await recalculateUserPoints(userId);
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
