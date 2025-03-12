import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  startAfter,
  limitToLast
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

/**
 * Create a new recipe
 * @param {string} userId - User ID of the creator
 * @param {Object} recipeData - Recipe data
 * @returns {Promise<Object>} - Created recipe with ID
 */
export const createRecipe = async (userId, recipeData) => {
  try {
    const recipeRef = await addDoc(collection(db, "recipes"), {
      ...recipeData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rating: 0,
      ratingCount: 0,
    });
    
    const newRecipe = await getDoc(recipeRef);
    return { id: newRecipe.id, ...newRecipe.data() };
  } catch (error) {
    console.error("Error creating recipe:", error);
    throw error;
  }
};

/**
 * Get a recipe by ID
 * @param {string} recipeId - Recipe ID
 * @returns {Promise<Object|null>} - Recipe data or null if not found
 */
export const getRecipe = async (recipeId) => {
  try {
    const docRef = doc(db, "recipes", recipeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting recipe:", error);
    throw error;
  }
};

/**
 * Get recipes with filtering and pagination
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {string} options.cuisine - Filter by cuisine
 * @param {string} options.diet - Filter by diet type
 * @param {string} options.sortBy - Field to sort by
 * @param {boolean} options.sortDesc - Sort in descending order
 * @param {number} options.pageSize - Number of recipes per page
 * @param {Object} options.lastDoc - Last document for pagination
 * @returns {Promise<Object>} - Recipes and pagination info
 */
export const getRecipes = async (options = {}) => {
  try {
    const {
      category,
      cuisine,
      diet,
      sortBy = 'createdAt',
      sortDesc = true,
      pageSize = 10,
      lastDoc = null,
    } = options;
    
    let recipesQuery = collection(db, "recipes");
    const filters = [];
    
    if (category) {
      filters.push(where("category", "==", category));
    }
    
    if (cuisine) {
      filters.push(where("cuisine", "==", cuisine));
    }
    
    if (diet) {
      filters.push(where("dietType", "==", diet));
    }
    
    if (filters.length > 0) {
      recipesQuery = query(recipesQuery, ...filters);
    }
    
    // Add sorting
    recipesQuery = query(
      recipesQuery, 
      orderBy(sortBy, sortDesc ? 'desc' : 'asc')
    );
    
    // Add pagination
    if (lastDoc) {
      recipesQuery = query(recipesQuery, startAfter(lastDoc), limit(pageSize));
    } else {
      recipesQuery = query(recipesQuery, limit(pageSize));
    }
    
    const querySnapshot = await getDocs(recipesQuery);
    const recipes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      recipes,
      lastVisible,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error("Error getting recipes:", error);
    throw error;
  }
};

/**
 * Get recipes created by a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - User's recipes
 */
export const getUserRecipes = async (userId) => {
  try {
    const userRecipesQuery = query(
      collection(db, "recipes"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(userRecipesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting user recipes:", error);
    throw error;
  }
};

/**
 * Update a recipe
 * @param {string} recipeId - Recipe ID
 * @param {Object} recipeData - Updated recipe data
 * @returns {Promise<void>}
 */
export const updateRecipe = async (recipeId, recipeData) => {
  try {
    const recipeRef = doc(db, "recipes", recipeId);
    await updateDoc(recipeRef, {
      ...recipeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating recipe:", error);
    throw error;
  }
};

/**
 * Delete a recipe
 * @param {string} recipeId - Recipe ID
 * @returns {Promise<void>}
 */
export const deleteRecipe = async (recipeId) => {
  try {
    await deleteDoc(doc(db, "recipes", recipeId));
  } catch (error) {
    console.error("Error deleting recipe:", error);
    throw error;
  }
};

/**
 * Upload a recipe image
 * @param {string} recipeId - Recipe ID
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<string>} - Download URL of the image
 */
export const uploadRecipeImage = async (recipeId, imageFile) => {
  try {
    const fileRef = ref(storage, `recipes/${recipeId}/${Date.now()}-${imageFile.name}`);
    await uploadBytes(fileRef, imageFile);
    const downloadURL = await getDownloadURL(fileRef);
    
    // Update the recipe with the image URL
    const recipeRef = doc(db, "recipes", recipeId);
    await updateDoc(recipeRef, {
      imageUrl: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading recipe image:", error);
    throw error;
  }
};

/**
 * Search recipes by keyword
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} - Matching recipes
 */
export const searchRecipes = async (keyword) => {
  try {
    // Firestore doesn't support native full-text search,
    // This is a simple implementation using field matches
    // For production, consider using Algolia or ElasticSearch
    const nameQuery = query(
      collection(db, "recipes"),
      where("name", ">=", keyword),
      where("name", "<=", keyword + '\uf8ff')
    );
    
    const nameSnapshot = await getDocs(nameQuery);
    const nameResults = nameSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Return unique results
    return Array.from(new Set(nameResults.map(r => r.id)))
      .map(id => nameResults.find(r => r.id === id));
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw error;
  }
};