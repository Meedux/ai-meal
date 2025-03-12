import { 
  httpsCallable 
} from "firebase/functions";
import { 
  collection, 
  addDoc,
  doc,
  getDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db, functions } from "../firebaseServices";

/**
 * Calculate nutrition for a recipe
 * @param {Object} recipe - Recipe to calculate nutrition for
 * @returns {Promise<Object>} - Nutritional information
 */
export const calculateNutrition = async (recipe) => {
  try {
    // First check if we already have nutrition data for this recipe
    if (recipe.id) {
      const recipeDoc = await getDoc(doc(db, "recipes", recipe.id));
      if (recipeDoc.exists() && recipeDoc.data().nutrition) {
        return recipeDoc.data().nutrition;
      }
    }
    
    // Call the Cloud Function to calculate nutrition
    const nutritionCalculation = httpsCallable(functions, 'calculateRecipeNutrition');
    const result = await nutritionCalculation({ recipe });
    
    // If this is a saved recipe, update it with the nutrition data
    if (recipe.id) {
      const recipeRef = doc(db, "recipes", recipe.id);
      await updateDoc(recipeRef, {
        nutrition: result.data.nutrition,
        updatedAt: serverTimestamp()
      });
    }
    
    return result.data.nutrition;
  } catch (error) {
    console.error("Error calculating nutrition:", error);
    throw error;
  }
};

/**
 * Get health insights for a recipe
 * @param {Object} recipe - Recipe to analyze
 * @param {Object} userPreferences - User health preferences/goals
 * @returns {Promise<Object>} - Health insights
 */
export const getHealthInsights = async (recipe, userPreferences = null) => {
  try {
    const healthInsights = httpsCallable(functions, 'getRecipeHealthInsights');
    const result = await healthInsights({
      recipe,
      userPreferences
    });
    
    return result.data.insights;
  } catch (error) {
    console.error("Error getting health insights:", error);
    throw error;
  }
};

/**
 * Get nutrition comparison between recipes
 * @param {Array} recipeIds - Array of recipe IDs to compare
 * @returns {Promise<Object>} - Comparison data
 */
export const compareRecipeNutrition = async (recipeIds) => {
  try {
    const compareNutrition = httpsCallable(functions, 'compareRecipeNutrition');
    const result = await compareNutrition({ recipeIds });
    
    return result.data.comparison;
  } catch (error) {
    console.error("Error comparing recipe nutrition:", error);
    throw error;
  }
};

/**
 * Track user's daily nutrient intake
 * @param {string} userId - User ID
 * @param {string} date - Date in ISO format (YYYY-MM-DD)
 * @param {Object} consumedItem - Consumed food item with nutritional data
 * @returns {Promise<Object>} - Updated daily nutrition
 */
export const trackNutrientIntake = async (userId, date, consumedItem) => {
  try {
    const trackIntake = httpsCallable(functions, 'trackNutrientIntake');
    const result = await trackIntake({
      userId,
      date,
      consumedItem
    });
    
    return result.data.dailyNutrition;
  } catch (error) {
    console.error("Error tracking nutrient intake:", error);
    throw error;
  }
};

/**
 * Get nutrition recommendations based on user's health goals
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Nutrition recommendations
 */
export const getNutritionRecommendations = async (userId) => {
  try {
    const nutritionRecs = httpsCallable(functions, 'getNutritionRecommendations');
    const result = await nutritionRecs({ userId });
    
    return result.data.recommendations;
  } catch (error) {
    console.error("Error getting nutrition recommendations:", error);
    throw error;
  }
};