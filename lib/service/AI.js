import { 
  httpsCallable 
} from "firebase/functions";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getDoc,
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { db, functions } from "../firebase";

/**
 * Get meal recommendations based on user preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - User preferences for recommendations
 * @returns {Promise<Array>} - Recommended meals
 */
export const getMealRecommendations = async (userId, preferences = null) => {
  try {
    // First check if there are recent recommendations in the cache
    if (!preferences) {
      const recentRecsQuery = query(
        collection(db, "recommendations"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      
      const recentRecs = await getDocs(recentRecsQuery);
      
      if (!recentRecs.empty) {
        const recData = recentRecs.docs[0].data();
        // Only use cached recommendations if they're less than 24 hours old
        const recTimestamp = recData.timestamp.toDate();
        const now = new Date();
        const hoursSinceRec = (now - recTimestamp) / (1000 * 60 * 60);
        
        if (hoursSinceRec < 24) {
          return recData.recommendations;
        }
      }
    }
    
    // Call the Cloud Function to generate recommendations
    const generateRecommendations = httpsCallable(functions, 'generateMealRecommendations');
    const result = await generateRecommendations({ preferences, count: 3 });
    
    // Store recommendations in cache
    await addDoc(collection(db, "recommendations"), {
      userId,
      recommendations: result.data.recommendations,
      preferences: preferences || {},
      timestamp: serverTimestamp()
    });
    
    return result.data.recommendations;
  } catch (error) {
    console.error("Error getting meal recommendations:", error);
    throw error;
  }
};

/**
 * Analyze a recipe for nutritional information
 * @param {Object} recipe - Recipe to analyze
 * @returns {Promise<Object>} - Recipe analysis
 */
export const analyzeRecipe = async (recipe) => {
  try {
    const analyzeRecipeFunction = httpsCallable(functions, 'analyzeRecipe');
    const result = await analyzeRecipeFunction({ recipe });
    
    // Cache the analysis result in Firestore for future reference
    await addDoc(collection(db, "recipeAnalysis"), {
      recipeId: recipe.id,
      analysis: result.data.analysis,
      timestamp: serverTimestamp()
    });
    
    return result.data.analysis;
  } catch (error) {
    console.error("Error analyzing recipe:", error);
    throw error;
  }
};

/**
 * Get similar recipes to the provided recipe
 * @param {string} recipeId - Recipe ID to find similar recipes for
 * @param {number} count - Number of similar recipes to return
 * @returns {Promise<Array>} - Similar recipes
 */
export const getSimilarRecipes = async (recipeId, count = 3) => {
  try {
    // Get the original recipe
    const recipeRef = doc(db, "recipes", recipeId);
    const recipeDoc = await getDoc(recipeRef);
    
    if (!recipeDoc.exists()) {
      throw new Error("Recipe not found");
    }
    
    const recipeData = recipeDoc.data();
    
    // Call the recommendation function with the recipe data
    const findSimilarRecipes = httpsCallable(functions, 'findSimilarRecipes');
    const result = await findSimilarRecipes({ 
      recipeId, 
      category: recipeData.category,
      cuisine: recipeData.cuisine,
      ingredients: recipeData.ingredients,
      count 
    });
    
    return result.data.similarRecipes;
  } catch (error) {
    console.error("Error finding similar recipes:", error);
    throw error;
  }
};

/**
 * Get trending recipes based on popularity and recency
 * @param {number} count - Number of trending recipes to return
 * @returns {Promise<Array>} - Trending recipes
 */
export const getTrendingRecipes = async (count = 6) => {
  try {
    // This would typically involve a more complex algorithm considering 
    // views, ratings, saves, and recency
    const trendingQuery = query(
      collection(db, "recipes"),
      orderBy("viewCount", "desc"),
      limit(count)
    );
    
    const querySnapshot = await getDocs(trendingQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting trending recipes:", error);
    throw error;
  }
};

/**
 * Get personalized recipe recommendations based on user history
 * @param {string} userId - User ID
 * @param {number} count - Number of recommendations to return
 * @returns {Promise<Array>} - Personalized recommendations
 */
export const getPersonalizedRecommendations = async (userId, count = 4) => {
  try {
    const getPersonalizedRecs = httpsCallable(functions, 'getPersonalizedRecommendations');
    const result = await getPersonalizedRecs({ userId, count });
    
    return result.data.recommendations;
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    throw error;
  }
};