"use client";

import React, { useState, useEffect } from 'react';
import { auth } from "@/lib/firebase";
import { getRecipes } from "@/lib/service/meal";
import Link from "next/link";

const MealList = () => {
  // State management
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedItems, setAnimatedItems] = useState([]);
  const [user, setUser] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  // Filtering state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOption, setSortOption] = useState({ field: "createdAt", direction: "desc" });
  
  const itemsPerPage = 8;

  // Check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Load meals on initial render and when filters change
  useEffect(() => {
    fetchMeals(true);
  }, [categoryFilter, sortOption]);

  // Fetch meals from Firestore
  const fetchMeals = async (reset = false) => {
    setIsLoading(true);
    
    if (reset) {
      setMeals([]);
      setLastDoc(null);
    }
    
    try {
      const result = await getRecipes({
        category: categoryFilter || undefined,
        sortBy: sortOption.field,
        sortDesc: sortOption.direction === "desc",
        pageSize: itemsPerPage,
        lastDoc: reset ? null : lastDoc,
      });
      
      const newMeals = reset ? result.recipes : [...meals, ...result.recipes];
      
      setMeals(newMeals);
      setLastDoc(result.lastVisible);
      setHasMore(result.hasMore);
      
      // Calculate total pages (approximate)
      if (reset) {
        const estimatedTotal = result.hasMore ? 
          (itemsPerPage * 2) : result.recipes.length;
        setTotalPages(Math.max(1, Math.ceil(estimatedTotal / itemsPerPage)));
      }

      // Animate items appearing
      setTimeout(() => {
        const startIdx = reset ? 0 : meals.length;
        result.recipes.forEach((_, index) => {
          setTimeout(() => {
            setAnimatedItems(prev => [...prev, startIdx + index]);
          }, 100 * (index + 1));
        });
      }, 100);
      
    } catch (err) {
      console.error("Error fetching meals:", err);
      setError("Failed to load meals. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const paginate = (pageNumber) => {
    if (pageNumber === currentPage) return;
    
    // If moving forward and we have more items to load
    if (pageNumber > currentPage && hasMore && pageNumber > totalPages) {
      fetchMeals(false);
    }
    
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (field, direction) => {
    setSortOption({ field, direction });
    setCurrentPage(1);
  };

  // Macro badge color based on value
  const getMacroColor = (type, value) => {
    switch(type) {
      case 'calories':
        return value > 600 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400';
      case 'protein':
        return value > 30 ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-400/20 text-blue-300';
      case 'carbs':
        return value > 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-400/20 text-amber-300';
      case 'fat':
        return value > 25 ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-400/20 text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Show error message
  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="bg-neutral-800/60 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-primary/70 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-medium text-white mb-2">Unable to Load Meals</h3>
          <p className="text-neutral-400 mb-6">{error}</p>
          <button onClick={() => fetchMeals(true)} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-3 sm:mb-0">All Meals</h2>
        
        <div className="flex items-center space-x-2">
          <Link href="/meal/add" className="btn btn-sm btn-primary">
            Add Meal
          </Link>
          
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-sm btn-ghost">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-neutral-800 rounded-box w-52">
              <li><a onClick={() => handleCategoryChange("")}>All Categories</a></li>
              <li><a onClick={() => handleCategoryChange("Italian")}>Italian</a></li>
              <li><a onClick={() => handleCategoryChange("Chinese")}>Chinese</a></li>
              <li><a onClick={() => handleCategoryChange("Mexican")}>Mexican</a></li>
              <li><a onClick={() => handleCategoryChange("Indian")}>Indian</a></li>
              <li><a onClick={() => handleCategoryChange("Thai")}>Thai</a></li>
              <li><a onClick={() => handleCategoryChange("Mediterranean")}>Mediterranean</a></li>
              <li><a onClick={() => handleSortChange("createdAt", "desc")}>Newest First</a></li>
              <li><a onClick={() => handleSortChange("macros.calories", "asc")}>Calories (Low to High)</a></li>
              <li><a onClick={() => handleSortChange("macros.protein", "desc")}>Protein (High to Low)</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {(categoryFilter || sortOption.field !== "createdAt") && (
        <div className="mb-4 flex flex-wrap gap-2">
          {categoryFilter && (
            <span className="bg-primary/20 text-primary px-3 py-1 text-sm rounded-full flex items-center">
              Category: {categoryFilter}
              <button onClick={() => handleCategoryChange("")} className="ml-2">×</button>
            </span>
          )}
          
          {sortOption.field !== "createdAt" && (
            <span className="bg-primary/20 text-primary px-3 py-1 text-sm rounded-full flex items-center">
              Sort: {sortOption.field.includes('macros') ? sortOption.field.split('.')[1] : sortOption.field} 
              ({sortOption.direction === "desc" ? "High to Low" : "Low to High"})
              <button onClick={() => handleSortChange("createdAt", "desc")} className="ml-2">×</button>
            </span>
          )}
        </div>
      )}

      {isLoading && meals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(itemsPerPage)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 rounded-xl shadow-lg animate-pulse h-80"></div>
          ))}
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-neutral-400 mb-2">No meals found</p>
          <p className="text-sm text-neutral-500">
            Try adjusting your filters or create a new meal
          </p>
          <Link href="/meal/add" className="btn btn-primary mt-4">
            Create New Meal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {meals.map((meal, index) => (
            <div 
              key={meal.id} 
              className={`bg-neutral-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 ${animatedItems.includes(index) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <Link href={`/meal/${meal.id}`}>
                <div className="relative h-48 overflow-hidden">
                  {meal.image ? (
                    <img 
                      src={meal.image} 
                      alt={meal.name}
                      className="w-full h-full object-cover transition-all duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center">
                      <svg className="w-12 h-12 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 5a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-neutral-900/70 text-white text-xs rounded-full">
                      {meal.category || meal.cuisine || "Meal"}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-white text-lg font-medium mb-1">{meal.name}</h3>
                  <p className="text-neutral-400 text-xs mb-3">
                    By {meal.user || (meal.userId ? "User Recipe" : "Featured Recipe")}
                  </p>
                  
                  <p className="text-neutral-300 text-sm mb-4 line-clamp-2">
                    {meal.description || "A delicious meal recipe"}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getMacroColor('calories', meal.macros?.calories || 0)}`}>
                      {meal.macros?.calories || meal.nutrition?.calories || "?"} kcal
                    </span>
                    {meal.macros?.protein && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getMacroColor('protein', meal.macros.protein)}`}>
                        {meal.macros.protein}g protein
                      </span>
                    )}
                    {meal.macros?.carbs && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getMacroColor('carbs', meal.macros.carbs)}`}>
                        {meal.macros.carbs}g carbs
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              
              <div className="px-4 py-3 bg-neutral-900/40 flex justify-between items-center">
                <Link href={`/meal/${meal.id}`} className="text-xs text-neutral-400 hover:text-primary transition-colors">
                  View Details
                </Link>
                <button className="text-xs text-neutral-400 hover:text-primary transition-colors">
                  Add to Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator when fetching more */}
      {isLoading && meals.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="join">
            <button 
              className="join-item btn btn-sm" 
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              «
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button 
                key={index} 
                onClick={() => paginate(index + 1)}
                className={`join-item btn btn-sm ${currentPage === index + 1 ? 'btn-active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            
            <button 
              className="join-item btn btn-sm" 
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages && !hasMore}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* "Load More" button instead of just pagination */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            className="btn btn-ghost text-neutral-400 hover:text-white"
            onClick={() => fetchMeals(false)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span> Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MealList;