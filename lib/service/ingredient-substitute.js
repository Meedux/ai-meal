import { 
  httpsCallable 
} from "firebase/functions";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";
import { db, functions } from "../firebaseServices";

/**
 * Find substitutes for an ingredient
 * @param {string} ingredient - Ingredient to find substitutes for
 * @param {string} dietType - Optional diet type to consider
 * @param {Array} allergies - Optional allergies to avoid
 * @returns {Promise<Array>} - Substitute ingredients
 */
export const findIngredientSubstitutes = async (ingredient, dietType = null, allergies = []) => {
  try {
    // First check the cache
    const cacheQuery = query(
      collection(db, "ingredientSubstitutes"),
      where("originalIngredient", "==", ingredient),
      where("dietType", "==", dietType || "all")
    );
    
    const querySnapshot = await getDocs(cacheQuery);
    if (!querySnapshot.empty) {
      const cachedData = querySnapshot.docs[0].data();
      // Check if the cached data is still valid (less than 30 days old)
      const cachedTime = cachedData.timestamp.toDate();
      const now = new Date();
      const daysSinceCached = (now - cachedTime) / (1000 * 60 * 60 * 24);
      
      if (daysSinceCached < 30) {
        return cachedData.substitutes;
      }
    }
    
    // Call the Cloud Function to get substitutes
    const getSubstitutes = httpsCallable(functions, 'findIngredientSubstitutes');
    const result = await getSubstitutes({ ingredient, dietType, allergies });
    
    // Cache the result
    await addDoc(collection(db, "ingredientSubstitutes"), {
      originalIngredient: ingredient,
      dietType: dietType || "all",
      substitutes: result.data.substitutes,
      timestamp: serverTimestamp()
    });
    
    return result.data.substitutes;
  } catch (error) {
    console.error("Error finding ingredient substitutes:", error);
    throw error;
  }
};

/**
 * Check a recipe for missing ingredients based on user's pantry
 * @param {Array} recipeIngredients - Recipe ingredients
 * @param {string} userId - User ID to check against their pantry
 * @returns {Promise<Object>} - Missing ingredients and substitutes
 */
export const checkMissingIngredients = async (recipeIngredients, userId) => {
  try {
    // Call the Cloud Function
    const checkIngredients = httpsCallable(functions, 'checkMissingIngredients');
    const result = await checkIngredients({ recipeIngredients, userId });
    
    return {
      missingIngredients: result.data.missingIngredients,
      possibleSubstitutes: result.data.possibleSubstitutes
    };
  } catch (error) {
    console.error("Error checking missing ingredients:", error);
    throw error;
  }
};

/**
 * Update user's pantry items
 * @param {string} userId - User ID
 * @param {Array} pantryItems - List of items in the user's pantry
 * @returns {Promise<void>}
 */
export const updateUserPantry = async (userId, pantryItems) => {
  try {
    const updatePantry = httpsCallable(functions, 'updateUserPantry');
    await updatePantry({ userId, pantryItems });
  } catch (error) {
    console.error("Error updating user pantry:", error);
    throw error;
  }
};

/**
 * Get a user's pantry items
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Pantry items
 */
export const getUserPantry = async (userId) => {
  try {
    const getUserPantry = httpsCallable(functions, 'getUserPantry');
    const result = await getUserPantry({ userId });
    
    return result.data.pantryItems;
  } catch (error) {
    console.error("Error getting user pantry:", error);
    throw error;
  }
};