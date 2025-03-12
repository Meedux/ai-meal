import { 
  httpsCallable 
} from "firebase/functions";
import { 
  collection, 
  addDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db, functions } from "../firebaseServices";

/**
 * Generate a new recipe using AI
 * @param {Object} recipeParams - Parameters for recipe generation
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Generated recipe
 */
export const generateRecipe = async (recipeParams, userId) => {
  try {
    const {
      ingredients = [],
      cuisine = null,
      dietType = null,
      mealType = null,
      difficulty = "medium",
      prepTime = null,
      excludeIngredients = []
    } = recipeParams;
    
    // Call the Cloud Function to generate recipe
    const recipeGeneration = httpsCallable(functions, 'generateRecipe');
    const result = await recipeGeneration({
      userId,
      ingredients,
      cuisine,
      dietType,
      mealType,
      difficulty,
      prepTime,
      excludeIngredients
    });
    
    const generatedRecipe = result.data.recipe;
    
    // Save the generated recipe to Firestore with draft status
    const recipeDoc = {
      ...generatedRecipe,
      userId,
      generated: true,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "recipes"), recipeDoc);
    
    return {
      ...generatedRecipe,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
};

/**
 * Adjust recipe for different portion size
 * @param {Object} recipe - Original recipe
 * @param {number} servings - Desired number of servings
 * @returns {Promise<Object>} - Adjusted recipe
 */
export const adjustRecipePortions = async (recipe, servings) => {
  try {
    const adjustPortions = httpsCallable(functions, 'adjustRecipePortions');
    const result = await adjustPortions({
      recipe,
      servings
    });
    
    return result.data.adjustedRecipe;
  } catch (error) {
    console.error("Error adjusting recipe portions:", error);
    throw error;
  }
};

/**
 * Enhance a recipe with AI suggestions
 * @param {Object} recipe - Recipe to enhance
 * @param {string} enhancementType - Type of enhancement (flavor, nutrition, presentation)
 * @returns {Promise<Object>} - Enhanced recipe
 */
export const enhanceRecipe = async (recipe, enhancementType) => {
  try {
    const enhance = httpsCallable(functions, 'enhanceRecipe');
    const result = await enhance({
      recipe,
      enhancementType
    });
    
    return result.data.enhancedRecipe;
  } catch (error) {
    console.error("Error enhancing recipe:", error);
    throw error;
  }
};

/**
 * Generate meal plan for multiple days
 * @param {string} userId - User ID
 * @param {number} days - Number of days
 * @param {Object} preferences - Meal plan preferences
 * @returns {Promise<Object>} - Generated meal plan
 */
export const generateMealPlan = async (userId, days = 7, preferences = {}) => {
  try {
    // Call the Cloud Function to generate meal plan
    const mealPlanGeneration = httpsCallable(functions, 'generateMealPlan');
    const result = await mealPlanGeneration({
      userId,
      days,
      preferences
    });
    
    // Save the generated meal plan to Firestore
    const mealPlanDoc = {
      ...result.data.mealPlan,
      userId,
      days,
      preferences,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "mealPlans"), mealPlanDoc);
    
    return {
      ...result.data.mealPlan,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }
};