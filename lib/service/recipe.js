import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Create a new collection
 * @param {string} userId - User ID
 * @param {Object} collectionData - Collection data
 * @returns {Promise<Object>} - Created collection
 */
export const createCollection = async (userId, collectionData) => {
  try {
    const collectionRef = await addDoc(collection(db, "collections"), {
      ...collectionData,
      userId,
      recipes: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const newCollection = await getDoc(collectionRef);
    return { id: newCollection.id, ...newCollection.data() };
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
};

/**
 * Get a collection by ID
 * @param {string} collectionId - Collection ID
 * @returns {Promise<Object|null>} - Collection data or null if not found
 */
export const getCollection = async (collectionId) => {
  try {
    const docRef = doc(db, "collections", collectionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting collection:", error);
    throw error;
  }
};

/**
 * Get all collections for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - User's collections
 */
export const getUserCollections = async (userId) => {
  try {
    const collectionsQuery = query(
      collection(db, "collections"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(collectionsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting user collections:", error);
    throw error;
  }
};

/**
 * Add a recipe to a collection
 * @param {string} collectionId - Collection ID
 * @param {string} recipeId - Recipe ID to add
 * @returns {Promise<void>}
 */
export const addRecipeToCollection = async (collectionId, recipeId) => {
  try {
    const collectionRef = doc(db, "collections", collectionId);
    await updateDoc(collectionRef, {
      recipes: arrayUnion(recipeId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding recipe to collection:", error);
    throw error;
  }
};

/**
 * Remove a recipe from a collection
 * @param {string} collectionId - Collection ID
 * @param {string} recipeId - Recipe ID to remove
 * @returns {Promise<void>}
 */
export const removeRecipeFromCollection = async (collectionId, recipeId) => {
  try {
    const collectionRef = doc(db, "collections", collectionId);
    await updateDoc(collectionRef, {
      recipes: arrayRemove(recipeId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error removing recipe from collection:", error);
    throw error;
  }
};

/**
 * Update a collection
 * @param {string} collectionId - Collection ID
 * @param {Object} collectionData - Updated collection data
 * @returns {Promise<void>}
 */
export const updateCollection = async (collectionId, collectionData) => {
  try {
    const collectionRef = doc(db, "collections", collectionId);
    await updateDoc(collectionRef, {
      ...collectionData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    throw error;
  }
};

/**
 * Delete a collection
 * @param {string} collectionId - Collection ID
 * @returns {Promise<void>}
 */
export const deleteCollection = async (collectionId) => {
  try {
    await deleteDoc(doc(db, "collections", collectionId));
  } catch (error) {
    console.error("Error deleting collection:", error);
    throw error;
  }
};

