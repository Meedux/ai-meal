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
 * @param {Object} options - Options for recommendations
 * @returns {Promise<Array>} - Recommended meals
 */
export const getMealRecommendations = async (userId, options = {}) => {
  try {
    const {
      count = 4,
      excludeMealIds = [],
      category = null, // Default to null instead of undefined
      forceNew = true,
      timestamp = Date.now(),
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    } = options;

    // First try to get the user's stored preferences from their profile
    let userPreferences = {};
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        userPreferences = userDoc.data().preferences || {};
      }
    } catch (prefError) {
      console.warn("Could not fetch user preferences:", prefError);
    }

    // Sanitize userPreferences to ensure no undefined values
    const cleanUserPreferences = {};
    Object.keys(userPreferences).forEach(key => {
      if (userPreferences[key] !== undefined) {
        cleanUserPreferences[key] = userPreferences[key];
      }
    });

    // Merge any explicitly provided preferences with the user's stored preferences
    // Only include category if it's not null or undefined
    const combinedPreferences = {
      ...cleanUserPreferences,
      ...(category !== null && category !== undefined ? { category } : {}),
    };
    
    // If excludeMealIds has items, add it to preferences
    if (excludeMealIds && excludeMealIds.length > 0) {
      combinedPreferences.excludeMealIds = excludeMealIds;
    }
    
    // Call the Cloud Function to generate NEW recommendations
    const generateRecommendations = httpsCallable(functions, 'generateMealRecommendations');
    const result = await generateRecommendations({ 
      userId, // Include user ID explicitly
      preferences: combinedPreferences, 
      count: count,
      forceNew: forceNew, // Force new recommendations
      timestamp: timestamp, // Cache busting timestamp
      sessionId: sessionId // Track this session's recommendations
    });
    
    if (!result.data || !result.data.meals) {
      console.error("Invalid recommendation response", result);
      return { meals: [] };
    }

    // Make sure each meal has an ID and proper metadata
    const mealsWithIds = result.data.meals.map((meal, index) => {
      if (!meal.id) {
        meal.id = `ai-rec-${timestamp}-${index}`;
      }
      meal.userId = userId; // Track which user this was generated for
      meal.timestamp = timestamp; // When it was generated
      meal.sessionId = sessionId; // Track this session
      
      // Make sure category is not undefined
      if (!meal.category && category) {
        meal.category = category;
      } else if (!meal.category) {
        meal.category = "General"; // Default category if none was specified
      }
      
      return meal;
    });
    
    // Store recommendations in cache - with sanitized preferences
    try {
      await addDoc(collection(db, "recommendations"), {
        userId,
        sessionId,
        recommendations: mealsWithIds,
        preferences: combinedPreferences, // This is now sanitized
        timestamp: serverTimestamp(),
        generatedAt: timestamp
      });
    } catch (cacheError) {
      console.warn("Failed to cache recommendations:", cacheError);
      // Continue even if caching fails - the function still worked
    }
    
    return { meals: mealsWithIds };
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
 * Get trending recipes
 * @param {number} count - Number of trending recipes to return
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Trending recipes
 */
export const getTrendingRecipes = async (count = 4, options = {}) => {
  const { excludeIds = [], timestamp = Date.now() } = options;

  try {
    // Add a random seed to get different results each time
    const randomSeed = Math.random().toString();
    
    const trendingQuery = query(
      collection(db, "recipes"),
      orderBy("viewCount", "desc"),
      // Add a where clause to filter out excluded IDs if there are any
      ...(excludeIds.length > 0 ? [where("id", "not-in", excludeIds.slice(0, 10))] : []),
      limit(count + 5) // Fetch extra to account for filtering
    );
    
    const querySnapshot = await getDocs(trendingQuery);
    const recipes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp // Add timestamp to make each result unique
    }));

    // Further filter out any excluded IDs that didn't get filtered by the query
    let filteredRecipes = recipes;
    if (excludeIds.length > 0) {
      const excludeSet = new Set(excludeIds);
      filteredRecipes = recipes.filter(recipe => !excludeSet.has(recipe.id));
    }
    
    // Shuffle the results to get different ones each time
    const shuffled = [...filteredRecipes].sort(() => 0.5 - Math.random());
    
    // Return only the requested count
    return shuffled.slice(0, count);
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

/**
 * Clear previous recommendations for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const clearPreviousRecommendations = async (userId) => {
  try {
    // Query for old recommendations for this user (older than 1 hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const recsQuery = query(
      collection(db, "recommendations"),
      where("userId", "==", userId),
      where("timestamp", "<", oneHourAgo)
    );
    
    const oldRecs = await getDocs(recsQuery);
    
    // Delete old recommendations
    const deletePromises = oldRecs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`Cleared ${oldRecs.size} old recommendation documents`);
  } catch (error) {
    console.error("Error clearing previous recommendations:", error);
  }
};