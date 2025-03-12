import { 
  httpsCallable 
} from "firebase/functions";
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { db, functions } from "../firebaseServices";

/**
 * Search recipes using natural language query
 * @param {string} searchQuery - Natural language search query
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - Search results
 */
export const naturalLanguageSearch = async (searchQuery, filters = {}) => {
  try {
    const processSearch = httpsCallable(functions, 'processNaturalLanguageSearch');
    const result = await processSearch({ query: searchQuery, filters });
    
    return result.data.results;
  } catch (error) {
    console.error("Error processing natural language search:", error);
    throw error;
  }
};

/**
 * Get search suggestions based on partial query
 * @param {string} partialQuery - Partial search query
 * @returns {Promise<Array>} - Search suggestions
 */
export const getSearchSuggestions = async (partialQuery) => {
  try {
    if (partialQuery.length < 2) {
      return [];
    }
    
    const getSuggestions = httpsCallable(functions, 'getSearchSuggestions');
    const result = await getSuggestions({ partialQuery });
    
    return result.data.suggestions;
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    throw error;
  }
};

/**
 * Search recipes by tags
 * @param {Array} tags - Tags to search for
 * @returns {Promise<Array>} - Recipes with matching tags
 */
export const searchByTags = async (tags) => {
  try {
    if (!tags || tags.length === 0) {
      return [];
    }
    
    // For single tag searches, we can use Firestore directly
    if (tags.length === 1) {
      const tagQuery = query(
        collection(db, "recipes"),
        where("tags", "array-contains", tags[0])
      );
      
      const querySnapshot = await getDocs(tagQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    
    // For multi-tag searches, use the Cloud Function
    const searchTags = httpsCallable(functions, 'searchRecipesByTags');
    const result = await searchTags({ tags });
    
    return result.data.recipes;
  } catch (error) {
    console.error("Error searching recipes by tags:", error);
    throw error;
  }
};

/**
 * Advanced recipe search with multiple filters
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} - Search results with pagination info
 */
export const advancedSearch = async (searchParams) => {
  try {
    const {
      query = "",
      category = null,
      cuisine = null,
      diet = null,
      maxPrepTime = null,
      difficulty = null,
      excludeIngredients = [],
      includeIngredients = [],
      sortBy = "relevance",
      page = 1,
      pageSize = 10
    } = searchParams;
    
    // Use Cloud Function for advanced search
    const advancedSearchFn = httpsCallable(functions, 'advancedRecipeSearch');
    const result = await advancedSearchFn({
      query,
      filters: {
        category,
        cuisine,
        diet,
        maxPrepTime,
        difficulty,
        excludeIngredients,
        includeIngredients
      },
      sortBy,
      page,
      pageSize
    });
    
    return {
      recipes: result.data.recipes,
      totalResults: result.data.totalResults,
      currentPage: result.data.currentPage,
      totalPages: result.data.totalPages
    };
  } catch (error) {
    console.error("Error performing advanced search:", error);
    throw error;
  }
};