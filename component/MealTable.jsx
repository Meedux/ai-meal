"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { getRecipes } from "@/lib/service/meal";
import { getMealRecommendations, getTrendingRecipes } from "@/lib/service/AI";
import { doc, getDoc } from "firebase/firestore";

const MealTable = () => {
  // State for meals, loading, error, filters
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);

  // Fetch categories for dropdown
  const [categories, setCategories] = useState([
    "Italian", "Chinese", "Mexican", "Indian", "Thai", 
    "Mediterranean", "American", "Japanese", "French"
  ]);

  // Initialize by checking for user and loading meals
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      try {
        if (currentUser) {
          // Get user preferences from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserPreferences(userData.preferences || null);
          }
          
          await fetchPersonalizedMeals(currentUser.uid);
        } else {
          await fetchTrendingMeals();
        }
      } catch (err) {
        console.error("Error initializing meals:", err);
        setError("Failed to load meals. Please try again later.");
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch meals based on user preferences
  const fetchPersonalizedMeals = async (userId) => {
    setLoading(true);
    try {
      const recommendations = await getMealRecommendations(userId);
      setMeals(recommendations || []);
    } catch (err) {
      console.error("Error fetching personalized meals:", err);
      // Fallback to trending if recommendations fail
      await fetchTrendingMeals();
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending meals
  const fetchTrendingMeals = async () => {
    setLoading(true);
    try {
      const trendingMeals = await getTrendingRecipes(8);
      setMeals(trendingMeals || []);
    } catch (err) {
      console.error("Error fetching trending meals:", err);
      setError("Failed to load trending meals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Load more meals
  const loadMoreMeals = async () => {
    if (!hasMore) return;
    
    setLoading(true);
    try {
      const result = await getRecipes({
        category: categoryFilter || undefined,
        sortBy: 'createdAt',
        sortDesc: true,
        pageSize: 6,
        lastDoc: lastDoc
      });
      
      setMeals(prevMeals => [...prevMeals, ...result.recipes]);
      setLastDoc(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Error loading more meals:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const result = await getRecipes({ 
        searchTerm: searchQuery,
        pageSize: 8
      });
      setMeals(result.recipes);
      setLastDoc(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Error searching meals:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle category filter change
  const handleCategoryChange = async (e) => {
    const category = e.target.value;
    setCategoryFilter(category);
    
    setLoading(true);
    try {
      const result = await getRecipes({ 
        category: category || undefined,
        pageSize: 8
      });
      setMeals(result.recipes);
      setLastDoc(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Error filtering by category:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading skeleton
  if (loading && meals.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-pulse">
          <div className="h-10 bg-neutral-800 rounded-lg flex-grow"></div>
          <div className="h-10 w-32 bg-neutral-800 rounded-lg"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-neutral-800/40 rounded-lg h-24 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => user ? fetchPersonalizedMeals(user.uid) : fetchTrendingMeals()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="relative flex-grow">
          <input
            type="text"
            placeholder="Search meals..."
            className="w-full py-2 pl-10 pr-4 rounded-lg bg-neutral-800 border-none text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
          <button type="submit" className="hidden">Search</button>
        </form>
        
        <select 
          className="py-2 px-4 rounded-lg bg-neutral-800 border-none text-white focus:ring-2 focus:ring-primary/40"
          value={categoryFilter}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      {/* User-specific recommendations banner */}
      {user && userPreferences && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6">
          <p className="text-sm text-white">
            <span className="font-medium">Recommended for you</span> - Based on your {userPreferences.diet && `${userPreferences.diet} diet`} {userPreferences.cuisines && userPreferences.cuisines.length > 0 && `and preference for ${userPreferences.cuisines.slice(0, 2).join(", ")} cuisine`}
          </p>
        </div>
      )}
      
      {/* No meals found message */}
      {meals.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-xl text-neutral-400 mb-2">No meals found</p>
          <p className="text-sm text-neutral-500">Try adjusting your search or filters</p>
        </div>
      )}
      
      {/* Meal grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="bg-neutral-800/40 rounded-lg overflow-hidden hover:bg-neutral-700/30 transition-colors cursor-pointer group"
          >
            <div className="p-4 flex gap-4">
              {/* Optional image or color accent */}
              <div className="w-16 h-16 rounded-md bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary">
                {meal.image ? (
                  <img src={meal.image} alt={meal.name} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" />
                  </svg>
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="text-white font-medium group-hover:text-primary transition-colors">
                  {meal.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-neutral-700/50 px-2 py-0.5 rounded text-neutral-300">
                    {meal.category || meal.cuisine || "Meal"}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {meal.user ? `By ${meal.user}` : meal.userId ? "User Recipe" : "Featured Recipe"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    {meal.rating && (
                      <>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm ml-1 text-white">{meal.rating}</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs font-medium text-neutral-400">
                    {meal.macros?.calories || meal.nutrition?.calories || "?"} cal
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Load more button */}
      <div className="mt-6 flex justify-center">
        {hasMore && (
          <button 
            className="btn btn-ghost text-neutral-400 hover:text-white"
            onClick={loadMoreMeals}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⟳</span> Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MealTable;