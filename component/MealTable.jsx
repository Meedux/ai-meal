import React, { useState } from "react";

const dummyData = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    user: "John Doe",
    category: "Italian",
    macros: {
      calories: 650,
      protein: 22,
    }
  },
  {
    id: 2,
    name: "Chicken Alfredo",
    user: "Jane Smith",
    category: "Italian",
    macros: {
      calories: 720,
      protein: 38,
    }
  },
  {
    id: 3,
    name: "Beef Stroganoff",
    user: "Mike Johnson",
    category: "Russian",
    macros: {
      calories: 580,
      protein: 32,
    }
  },
  {
    id: 4,
    name: "Vegetable Stir Fry",
    user: "Emily Davis",
    category: "Asian",
    macros: {
      calories: 420,
      protein: 15,
    }
  },
];

const MealTable = () => {
  const [meals, setMeals] = useState(dummyData);
  return (
    <div className="w-full">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search meals..."
            className="w-full py-2 pl-10 pr-4 rounded-lg bg-neutral-800 border-none text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary/40"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
        </div>
        
        <select className="py-2 px-4 rounded-lg bg-neutral-800 border-none text-white focus:ring-2 focus:ring-primary/40">
          <option value="">All Categories</option>
          <option value="Italian">Italian</option>
          <option value="Chinese">Chinese</option>
          <option value="Mexican">Mexican</option>
          <option value="Indian">Indian</option>
        </select>
      </div>
      
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
                    {meal.category}
                  </span>
                  <span className="text-xs text-neutral-400">
                    By {meal.user}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm ml-1 text-white">{meal.rating}</span>
                  </div>
                  <span className="text-xs font-medium text-neutral-400">{meal.calories} cal</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button className="btn btn-ghost text-neutral-400 hover:text-white">
          Load More
        </button>
      </div>
    </div>
  );
};

export default MealTable;