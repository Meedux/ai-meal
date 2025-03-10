"use client";

import React, { useState, useEffect } from 'react';

// Sample data - in a real app, this would come from an API
const dummyMeals = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    user: "John Doe",
    category: "Italian",
    description: "A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 650, protein: 22, carbs: 78, fat: 28 }
  },
  {
    id: 2,
    name: "Chicken Alfredo",
    user: "Jane Smith",
    category: "Italian",
    description: "Fettuccine pasta with creamy parmesan sauce and grilled chicken.",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 720, protein: 38, carbs: 56, fat: 36 }
  },
  {
    id: 3,
    name: "Beef Stroganoff",
    user: "Mike Johnson",
    category: "Russian",
    description: "Sautéed beef in a sour cream sauce served over egg noodles.",
    image: "https://images.unsplash.com/photo-1624963308273-1063ff381b73?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 580, protein: 32, carbs: 42, fat: 28 }
  },
  {
    id: 4,
    name: "Vegetable Stir Fry",
    user: "Emily Davis",
    category: "Asian",
    description: "Fresh vegetables stir-fried in a savory sauce served with rice.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 420, protein: 15, carbs: 65, fat: 12 }
  },
  {
    id: 5,
    name: "Grilled Salmon",
    user: "Alex Wilson",
    category: "Seafood",
    description: "Salmon fillet grilled with lemon and herbs served with asparagus.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 490, protein: 45, carbs: 8, fat: 28 }
  },
  {
    id: 6,
    name: "Quinoa Bowl",
    user: "Sarah Brown",
    category: "Vegetarian",
    description: "Protein-rich quinoa with roasted vegetables and tahini dressing.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 380, protein: 14, carbs: 58, fat: 12 }
  },
  {
    id: 7,
    name: "Shrimp Tacos",
    user: "David Green",
    category: "Mexican",
    description: "Seasoned shrimp in corn tortillas with avocado and cilantro lime slaw.",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 410, protein: 26, carbs: 48, fat: 16 }
  },
  {
    id: 8,
    name: "Butter Chicken",
    user: "Priya Patel",
    category: "Indian",
    description: "Tender chicken in a rich, creamy tomato sauce with Indian spices.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 560, protein: 32, carbs: 18, fat: 38 }
  },
  {
    id: 9,
    name: "Greek Salad",
    user: "Maria Gonzalez",
    category: "Mediterranean",
    description: "Crisp vegetables, feta cheese, and olives with a zesty dressing.",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 320, protein: 8, carbs: 16, fat: 26 }
  },
  {
    id: 10,
    name: "Pad Thai",
    user: "Lily Chen",
    category: "Thai",
    description: "Rice noodles stir-fried with eggs, tofu, bean sprouts, and peanuts.",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    macros: { calories: 550, protein: 18, carbs: 76, fat: 18 }
  },
];

const MealList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedItems, setAnimatedItems] = useState([]);
  
  const itemsPerPage = 4;
  const totalPages = Math.ceil(dummyMeals.length / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dummyMeals.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Simulating loading and progressive animation
  useEffect(() => {
    setIsLoading(true);
    setAnimatedItems([]);
    
    // Simulate API loading delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Animate items appearing one by one
      currentItems.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedItems(prev => [...prev, index]);
        }, 100 * (index + 1));
      });
    }, 500);
  }, [currentPage]);

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

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-3 sm:mb-0">All Meals</h2>
        
        <div className="flex items-center space-x-2">
          <button className="btn btn-sm btn-primary">Add Meal</button>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-sm btn-ghost">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-neutral-800 rounded-box w-52">
              <li><a>By Category</a></li>
              <li><a>By Calories (Low to High)</a></li>
              <li><a>By Protein (High to Low)</a></li>
            </ul>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(itemsPerPage)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 rounded-xl shadow-lg animate-pulse h-80"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentItems.map((meal, index) => (
            <div 
              key={meal.id} 
              className={`bg-neutral-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 ${animatedItems.includes(index) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={meal.image} 
                  alt={meal.name}
                  className="w-full h-full object-cover transition-all duration-300 hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-neutral-900/70 text-white text-xs rounded-full">
                    {meal.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-white text-lg font-medium mb-1">{meal.name}</h3>
                <p className="text-neutral-400 text-xs mb-3">By {meal.user}</p>
                
                <p className="text-neutral-300 text-sm mb-4 line-clamp-2">{meal.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getMacroColor('calories', meal.macros.calories)}`}>
                    {meal.macros.calories} kcal
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getMacroColor('protein', meal.macros.protein)}`}>
                    {meal.macros.protein}g protein
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getMacroColor('carbs', meal.macros.carbs)}`}>
                    {meal.macros.carbs}g carbs
                  </span>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-neutral-900/40 flex justify-between items-center">
                <button className="text-xs text-neutral-400 hover:text-primary transition-colors">
                  View Details
                </button>
                <button className="text-xs text-neutral-400 hover:text-primary transition-colors">
                  Add to Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealList;