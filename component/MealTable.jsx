"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { getMealRecommendations, getTrendingRecipes, clearPreviousRecommendations } from "@/lib/service/AI";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import Link from "next/link";

const MealTable = ({ id = "default" }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingNew, setGeneratingNew] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [shownMealIds, setShownMealIds] = useState([]);
  const [firebaseBlocked, setFirebaseBlocked] = useState(false);
  const sessionIdRef = useRef(`session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // Fetch categories for dropdown
  const [categories, setCategories] = useState([
    "Italian",
    "Chinese",
    "Mexican",
    "Indian",
    "Thai",
    "Mediterranean",
    "American",
    "Japanese",
    "French",
  ]);

  // Clear old recommendations when component mounts or unmounts
  useEffect(() => {
    if (user) {
      cleanupOldRecommendations(user.uid).catch(error => {
        // Check if the error is due to client blocking
        if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          setFirebaseBlocked(true);
          console.warn("Firebase requests appear to be blocked by the browser/extensions");
        }
      });
    }
    
    return () => {
      if (user) {
        cleanupOldRecommendations(user.uid).catch(err => {
          // Silently handle cleanup errors on unmount
          console.warn("Error during cleanup:", err);
        });
      }
    };
  }, [user]);

  // Initialize by checking for user and loading meals
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      try {
        if (currentUser) {
          try {
            // Get user preferences from Firestore
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserPreferences(userData.preferences || null);
              
              // Set default category from user preferences if available
              if (userData.preferences?.defaultCategory) {
                setCategoryFilter(userData.preferences.defaultCategory);
              }
            }
          } catch (prefError) {
            // Handle errors fetching preferences
            console.warn("Error fetching user preferences:", prefError);
            if (prefError.message && prefError.message.includes('ERR_BLOCKED_BY_CLIENT')) {
              setFirebaseBlocked(true);
            }
            // Continue without preferences
          }

          // Clear previous shown meals to ensure fresh start
          setShownMealIds([]);
          
          await fetchPersonalizedMeals(currentUser.uid, true);
        } else {
          await fetchTrendingMeals(true);
        }
      } catch (err) {
        console.error("Error initializing meals:", err);
        if (err.message && err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          setFirebaseBlocked(true);
          setError("Your browser appears to be blocking connections to our database. Please disable any ad blockers or privacy extensions for this site.");
        } else {
          setError("Failed to load meals. Please try again later.");
        }
        setLoading(false);
        setGeneratingNew(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Delete old recommendations from Firestore with improved error handling
  const cleanupOldRecommendations = async (userId) => {
    try {
      if (firebaseBlocked) {
        // Skip Firestore operations if we know they're being blocked
        console.log("Skipping Firestore cleanup due to blocked connections");
        return;
      }
      
      // Query for old recommendations for this user (except current session)
      const recsQuery = query(
        collection(db, "recommendations"),
        where("userId", "==", userId),
        where("sessionId", "!=", sessionIdRef.current)
      );
      
      const oldRecs = await getDocs(recsQuery);
      
      // Delete old recommendations
      const deletePromises = oldRecs.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`Cleaned up ${oldRecs.size} old recommendation documents`);
    } catch (error) {
      console.error("Error cleaning up old recommendations:", error);
      
      // Check if the error is because Firebase is blocked
      if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        setFirebaseBlocked(true);
      }
      
      // Re-throw for upstream handling
      throw error;
    }
  };

  // Fetch meals based on user preferences with improved error handling
  const fetchPersonalizedMeals = async (userId, isInitialLoad = false) => {
    setLoading(true);
    if (!isInitialLoad) {
      setGeneratingNew(true);
    }
    
    try {
      // Detect if Firebase is blocked and adjust strategy
      if (firebaseBlocked) {
        // Fall back to trending meals if Firebase is blocked
        console.log("Firebase appears to be blocked. Falling back to trending meals");
        return await fetchTrendingMeals(isInitialLoad);
      }
      
      // Force unique recommendations with cache-busting params
      const response = await getMealRecommendations(userId, {
        count: 4,
        excludeMealIds: shownMealIds,
        category: categoryFilter || null, // Use null instead of undefined
        forceNew: true,
        timestamp: Date.now(),
        sessionId: sessionIdRef.current,
        previousSessionsCleaned: isInitialLoad,
        offlineMode: firebaseBlocked // Flag for service layer to use offline mode if needed
      });

      // Extract meals from response and ensure we have an array
      const recommendations = response?.meals || [];
      
      // Track the IDs of shown meals
      const newMealIds = recommendations.map(meal => meal.id).filter(Boolean);
      
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        if (isInitialLoad) {
          setMeals(recommendations);
        } else {
          setMeals(prevMeals => {
            // Filter out any duplicates that might have slipped through
            const existingIds = new Set(prevMeals.map(m => m.id));
            const uniqueNewMeals = recommendations.filter(m => !existingIds.has(m.id));
            return [...prevMeals, ...uniqueNewMeals];
          });
        }
        
        // Add the new meal IDs to our tracking array
        setShownMealIds(prevIds => [...prevIds, ...newMealIds]);
        // We have more if we got the requested number of recommendations
        setHasMore(recommendations.length === 4);
      } else {
        console.warn("Received empty or non-array recommendations:", recommendations);
        if (isInitialLoad) {
          setMeals([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching personalized meals:", err);

      // Check for blocked by client error
      if (err.message && err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        console.log("Firebase connections blocked by client, switching to offline mode");
        setFirebaseBlocked(true);
        // Try trending meals as fallback
        return await fetchTrendingMeals(isInitialLoad);
      }
      
      if (err.message && err.message.includes("requires an index")) {
        console.log("Index being created, falling back to trending meals");
        setError(
          "Personalized recommendations will be available soon. Using trending meals for now."
        );
      } else {
        setError(
          "Could not load personalized recommendations. Please try again later."
        );
      }

      // Fallback to trending if recommendations fail
      await fetchTrendingMeals(isInitialLoad);
    } finally {
      setLoading(false);
      setGeneratingNew(false);
    }
  };

  // Fetch trending meals as a fallback
  const fetchTrendingMeals = async (isInitialLoad = false) => {
    setLoading(true);
    if (!isInitialLoad) {
      setGeneratingNew(true);
    }
    
    try {
      // Fetch 4 trending recommendations
      const trendingMeals = await getTrendingRecipes(4, {
        excludeIds: shownMealIds,
        timestamp: Date.now(), // Cache busting
        offlineMode: firebaseBlocked // Use offline mode if Firebase is blocked
      });
      
      if (Array.isArray(trendingMeals) && trendingMeals.length > 0) {
        if (isInitialLoad) {
          setMeals(trendingMeals);
        } else {
          setMeals(prevMeals => [...prevMeals, ...trendingMeals]);
        }
        
        // Track the IDs of shown meals
        const newMealIds = trendingMeals.map(meal => meal.id).filter(Boolean);
        setShownMealIds(prevIds => [...prevIds, ...newMealIds]);
        
        // We have more if we got the requested number of recommendations
        setHasMore(trendingMeals.length === 4);
      } else {
        console.warn("Received empty or non-array trending meals:", trendingMeals);
        if (isInitialLoad) {
          setMeals([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching trending meals:", err);
      
      // Check for blocked by client error
      if (err.message && err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        setFirebaseBlocked(true);
        setError("Your browser appears to be blocking our database connections. Please disable any ad blockers or privacy extensions for this site.");
      } else {
        setError("Failed to load trending meals. Please try again later.");
      }
      
      if (isInitialLoad) {
        setMeals([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setGeneratingNew(false);
    }
  };

  // Load more AI recommendations
  const loadMoreRecommendations = async () => {
    if (!hasMore) return;
    if (!user || firebaseBlocked) {
      return fetchTrendingMeals(false);
    }

    setLoading(true);
    setGeneratingNew(true);
    
    try {
      // Load 4 more recommendations, excluding ones we've already shown
      const response = await getMealRecommendations(user.uid, {
        count: 4,
        excludeMealIds: shownMealIds,
        category: categoryFilter || null, // Use null instead of undefined
        forceNew: true,
        timestamp: Date.now(),
        sessionId: sessionIdRef.current,
        offlineMode: firebaseBlocked
      });

      const newRecommendations = response?.meals || [];
      
      if (Array.isArray(newRecommendations) && newRecommendations.length > 0) {
        // Filter out any duplicates that might have slipped through
        const existingIds = new Set(meals.map(m => m.id));
        const uniqueNewRecommendations = newRecommendations.filter(m => !existingIds.has(m.id));
        
        // Add new recommendations to existing ones
        setMeals(prevMeals => [...prevMeals, ...uniqueNewRecommendations]);
        
        // Track the IDs of newly shown meals
        const newMealIds = uniqueNewRecommendations.map(meal => meal.id).filter(Boolean);
        setShownMealIds(prevIds => [...prevIds, ...newMealIds]);
        
        // If we got fewer recommendations than requested, we're out of recommendations
        setHasMore(uniqueNewRecommendations.length === 4);
      } else {
        console.warn("Received empty or non-array recommendations:", newRecommendations);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more recommendations:", err);
      
      // Check for blocked by client error
      if (err.message && err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        setFirebaseBlocked(true);
        return await fetchTrendingMeals(false);
      }
      
      setHasMore(false);
    } finally {
      setLoading(false);
      setGeneratingNew(false);
    }
  };

  // New function to refresh recommendations with optional new category
  const refreshRecommendations = async (newCategory = null) => {
    if (!user || firebaseBlocked) {
      return fetchTrendingMeals(true);
    }
    
    setLoading(true);
    setGeneratingNew(true);
    setError(null); // Clear any previous errors
    
    // If a new category is provided, update the state
    if (newCategory !== null) {
      setCategoryFilter(newCategory);
    }
    
    try {
      // Reset shown meal IDs to start fresh
      setShownMealIds([]);
      
      const response = await getMealRecommendations(user.uid, {
        count: 4,
        category: newCategory !== null ? newCategory : (categoryFilter || null),
        forceNew: true,
        timestamp: Date.now(),
        sessionId: sessionIdRef.current,
        offlineMode: firebaseBlocked
      });
      
      const recommendations = response?.meals || [];
      
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        setMeals(recommendations);
        
        // Track the IDs of shown meals
        const newMealIds = recommendations.map(meal => meal.id).filter(Boolean);
        setShownMealIds(newMealIds);
        
        setHasMore(recommendations.length === 4);
      } else {
        console.warn("Received empty or non-array recommendations:", recommendations);
        setMeals([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error refreshing recommendations:", err);
      
      // Check for blocked by client error
      if (err.message && err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        setFirebaseBlocked(true);
        setError("Your browser appears to be blocking our database connections. Please disable any ad blockers or privacy extensions for this site.");
        return await fetchTrendingMeals(true);
      }
      
      setError("Could not load recommendations. Please try again later.");
      setMeals([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setGeneratingNew(false);
    }
  };

  // Handle category filter change - use the refresh function
  const handleCategoryChange = async (e) => {
    const category = e.target.value;
    await refreshRecommendations(category);
  };

  // Show loading skeleton
  if (loading && (!meals || meals.length === 0)) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-pulse">
          <div className="h-10 bg-neutral-800 rounded-lg flex-grow"></div>
          <div className="h-10 w-32 bg-neutral-800 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={`loading-skeleton-${id}-${i}`}
              className="bg-neutral-800/40 rounded-lg h-24 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Show error message with create meal option
  if (error) {
    return (
      <div className="w-full text-center py-8">
        <div className="bg-neutral-800/60 rounded-lg p-6 max-w-lg mx-auto">
          <svg
            className="w-12 h-12 text-primary/70 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>

          <h3 className="text-xl font-medium text-white mb-2">
            {error.includes("Personalized recommendations")
              ? "No Personalized Recommendations Yet"
              : error.includes("blocking connections")
              ? "Connection Blocked"
              : "Unable to Load Recommendations"}
          </h3>

          <p className="text-neutral-400 mb-6">
            {error.includes("Personalized recommendations")
              ? "We're still setting up your personalized recommendations."
              : error.includes("blocking connections")
              ? error
              : "We couldn't load the meal recommendations right now."}
            {!error.includes("blocking") && <br className="hidden sm:block" />} 
            {!error.includes("blocking") && "Would you like to create your own meal instead?"}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() =>
                user && !firebaseBlocked
                  ? refreshRecommendations() 
                  : fetchTrendingMeals(true)
              }
              className="btn btn-outline btn-primary"
            >
              Try Again
            </button>

            <Link href="/meal/add" className="btn btn-primary">
              Create New Meal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Firebase blocked warning banner */}
      {firebaseBlocked && (
        <div className="mb-6 bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-white text-sm font-medium">Limited functionality available</p>
              <p className="text-yellow-200/70 text-xs mt-1">
                Your browser is blocking connections to our database. You're seeing limited features with local data only. 
                To enable all features, please disable ad blockers or privacy extensions for this site.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Global loading overlay for generating new recommendations */}
      {generatingNew && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-neutral-800 p-8 rounded-lg shadow-xl max-w-sm mx-auto text-center">
            <div className="animate-spin w-16 h-16 mb-6 mx-auto border-4 border-primary border-t-transparent rounded-full"></div>
            <h3 className="text-2xl font-medium text-white mb-3">Creating New Recipes</h3>
            <p className="text-neutral-300 mb-1">
              Our AI is crafting unique meal recommendations just for you...
            </p>
            <p className="text-xs text-neutral-500 mt-3">
              Each recipe is guaranteed to be different from previous suggestions
            </p>
          </div>
        </div>
      )}

      {/* Enhanced filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          className="py-2 px-4 rounded-lg bg-neutral-800 border-none text-white focus:ring-2 focus:ring-primary/40 w-full sm:w-auto"
          value={categoryFilter}
          onChange={handleCategoryChange}
          disabled={loading || generatingNew}
        >
          <option value="" key="category-all">All Categories</option>
          {categories.map((category, index) => (
            <option key={`category-${index}-${category}`} value={category}>
              {category}
            </option>
          ))}
        </select>
        
        <button
          className="py-2 px-4 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 focus:ring-2 focus:ring-primary/40"
          onClick={() => refreshRecommendations(categoryFilter)}
          disabled={loading || generatingNew}
        >
          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* User-specific recommendations banner */}
      {user && userPreferences && !firebaseBlocked && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6">
          <p className="text-sm text-white">
            <span className="font-medium">Recommended for you</span> - Based on
            your {userPreferences.diet && `${userPreferences.diet} diet`}{" "}
            {userPreferences.cuisines &&
              userPreferences.cuisines.length > 0 &&
              `and preference for ${userPreferences.cuisines
                .slice(0, 2)
                .join(", ")} cuisine`}
            {categoryFilter && ` • Filtered by ${categoryFilter}`}
          </p>
        </div>
      )}

      {/* No meals found message */}
      {(!meals || meals.length === 0) && !loading && !generatingNew && (
        <div className="text-center py-12">
          <p className="text-xl text-neutral-400 mb-2">No meal recommendations found</p>
          <p className="text-sm text-neutral-500">
            Try adjusting your preferences or category filter
          </p>
        </div>
      )}

      {/* Meal grid layout with opacity when generating */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${generatingNew ? 'opacity-40 pointer-events-none' : ''}`}>
        {Array.isArray(meals) && meals.map((meal, index) => (
          <Link 
            key={meal.id ? `meal-${meal.id}` : `meal-index-${index}`}
            href={`/meal/${meal.id}`}
            className="bg-neutral-800/40 rounded-lg overflow-hidden hover:bg-neutral-700/30 transition-colors cursor-pointer group"
          >
            <div className="p-4 flex gap-4">
              {/* Optional image or color accent */}
              <div className="w-16 h-16 rounded-md bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary">
                {meal.image ? (
                  <img
                    src={meal.image}
                    alt={meal.name || "Meal image"}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-grow">
                <h3 className="text-white font-medium group-hover:text-primary transition-colors">
                  {meal.name || "Unnamed Meal"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-neutral-700/50 px-2 py-0.5 rounded text-neutral-300">
                    {meal.category || meal.cuisine || "Meal"}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {meal.user
                      ? `By ${meal.user}`
                      : meal.userId
                      ? "User Recipe"
                      : "New AI Recommendation"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    {meal.rating && (
                      <>
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm ml-1 text-white">
                          {meal.rating}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-xs font-medium text-neutral-400">
                    {meal.macros?.calories || meal.nutrition?.calories || "?"}{" "}
                    cal
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load more button */}
      <div className="mt-6 flex justify-center">
        {hasMore && (
          <button
            className="btn btn-ghost text-neutral-400 hover:text-white"
            onClick={loadMoreRecommendations}
            disabled={loading || generatingNew}
          >
            {loading || generatingNew ? (
              <>
                <span className="animate-spin mr-2">⟳</span> Creating Unique Recommendations...
              </>
            ) : (
              "Generate New Recommendations"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MealTable;