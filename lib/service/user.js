import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Get a user's profile data
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Create a new user profile
 * @param {string} userId - The user ID
 * @param {Object} userData - User profile data
 * @returns {Promise<void>}
 */
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Update a user's profile
 * @param {string} userId - The user ID
 * @param {Object} userData - User profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Update user dietary preferences
 * @param {string} userId - The user ID
 * @param {Object} preferences - Dietary preferences
 * @returns {Promise<void>}
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { 
      preferences,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

/**
 * Update user health goals
 * @param {string} userId - The user ID
 * @param {Object} healthGoals - Health goals data
 * @returns {Promise<void>}
 */
export const updateHealthGoals = async (userId, healthGoals) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { 
      healthGoals,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating health goals:", error);
    throw error;
  }
};

/**
 * Get users by dietary preference
 * @param {string} dietType - The diet type to filter by
 * @returns {Promise<Array>} - Array of user profiles
 */
export const getUsersByDiet = async (dietType) => {
  try {
    const q = query(collection(db, "users"), where("preferences.diet", "==", dietType));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting users by diet:", error);
    throw error;
  }
};