"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// For the pie chart - you'll need to install: npm install react-chartjs-2 chart.js
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Dummy data for demonstration
const dummyMealData = {
  id: 1,
  name: "Spaghetti Carbonara",
  author: "John Doe",
  category: "Italian",
  description: "A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
  image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
  preparationTime: "25 minutes",
  cookTime: "15 minutes",
  servings: 4,
  difficulty: "Medium",
  rating: 4.8,
  reviews: 124,
  macros: { 
    calories: 650, 
    protein: 22, 
    carbs: 78, 
    fat: 28 
  },
  ingredients: [
    { name: "Spaghetti", quantity: "200g" },
    { name: "Pancetta", quantity: "100g" },
    { name: "Egg Yolks", quantity: "3" },
    { name: "Parmesan Cheese", quantity: "50g" },
    { name: "Black Pepper", quantity: "1 tsp" },
    { name: "Salt", quantity: "to taste" }
  ],
  instructions: [
    "Bring a large pot of salted water to boil, and cook spaghetti according to package directions.",
    "While pasta cooks, heat a large skillet over medium heat. Add pancetta and cook until crisp.",
    "In a bowl, whisk together egg yolks, grated cheese, and black pepper.",
    "Drain pasta, reserving 1/2 cup of pasta water.",
    "Working quickly, add hot pasta to the skillet with pancetta, tossing to coat. Remove from heat.",
    "Add egg mixture to pasta, tossing constantly with tongs. Add reserved pasta water as needed for a creamy sauce.",
    "Serve immediately with extra grated cheese and black pepper."
  ],
  similarMeals: [
    {
      id: 2,
      name: "Chicken Alfredo",
      image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      macros: { calories: 720, protein: 38 }
    },
    {
      id: 3,
      name: "Fettuccine with Mushrooms",
      image: "https://images.unsplash.com/photo-1673385283367-0562ffe5dbd5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      macros: { calories: 520, protein: 18 }
    },
    {
      id: 4,
      name: "Classic Lasagna",
      image: "https://images.unsplash.com/photo-1619895092538-128341789043?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      macros: { calories: 680, protein: 32 }
    }
  ]
};

const MealDetails = () => {
  const [activeTab, setActiveTab] = useState('instructions');
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleInstructions, setVisibleInstructions] = useState([]);

  // Animation variants for framer-motion
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Gradually reveal recipe instructions
  useEffect(() => {
    setIsLoaded(true);
    
    if (dummyMealData.instructions.length > 0) {
      const timer = setTimeout(() => {
        const newVisible = [...visibleInstructions];
        if (newVisible.length < dummyMealData.instructions.length) {
          newVisible.push(newVisible.length);
          setVisibleInstructions(newVisible);
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [visibleInstructions]);

  // Pie chart data for macronutrients
  const chartData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [dummyMealData.macros.protein * 4, dummyMealData.macros.carbs * 4, dummyMealData.macros.fat * 9],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e5e5e5',
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Meal Header Section */}
      <motion.div 
        className="mb-8"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={fadeIn}
        transition={{ duration: 0.6 }}
      >
        <div className="relative rounded-2xl overflow-hidden h-80 mb-6">
          <img 
            src={dummyMealData.image} 
            alt={dummyMealData.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="p-6">
              <span className="inline-block px-2 py-1 bg-primary text-white text-xs rounded-full mb-2">
                {dummyMealData.category}
              </span>
              <h1 className="text-3xl font-bold text-white mb-1">{dummyMealData.name}</h1>
              <p className="text-neutral-300">{dummyMealData.description}</p>
              <div className="flex items-center mt-3">
                <div className="flex items-center mr-4">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white ml-1">{dummyMealData.rating}</span>
                  <span className="text-neutral-400 text-sm ml-1">({dummyMealData.reviews})</span>
                </div>
                <div className="text-neutral-300 text-sm">By {dummyMealData.author}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center bg-neutral-800 rounded-lg px-4 py-2">
            <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-neutral-400">Prep Time</p>
              <p className="text-sm text-white">{dummyMealData.preparationTime}</p>
            </div>
          </div>
          
          <div className="flex items-center bg-neutral-800 rounded-lg px-4 py-2">
            <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div>
              <p className="text-xs text-neutral-400">Servings</p>
              <p className="text-sm text-white">{dummyMealData.servings}</p>
            </div>
          </div>
          
          <div className="flex items-center bg-neutral-800 rounded-lg px-4 py-2">
            <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div>
              <p className="text-xs text-neutral-400">Cook Time</p>
              <p className="text-sm text-white">{dummyMealData.cookTime}</p>
            </div>
          </div>
          
          <div className="flex items-center bg-neutral-800 rounded-lg px-4 py-2">
            <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <p className="text-xs text-neutral-400">Difficulty</p>
              <p className="text-sm text-white">{dummyMealData.difficulty}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-700 mb-6">
        <button 
          className={`pb-2 px-4 text-sm font-medium mr-4 transition-colors ${activeTab === 'instructions' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-white'}`}
          onClick={() => setActiveTab('instructions')}
        >
          Instructions
        </button>
        <button 
          className={`pb-2 px-4 text-sm font-medium mr-4 transition-colors ${activeTab === 'ingredients' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-white'}`}
          onClick={() => setActiveTab('ingredients')}
        >
          Ingredients
        </button>
        <button 
          className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'nutrition' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-white'}`}
          onClick={() => setActiveTab('nutrition')}
        >
          Nutrition
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Instructions/Ingredients */}
        <div className="lg:col-span-2">
          {activeTab === 'instructions' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Recipe Instructions</h2>
              <ol className="space-y-6">
                {dummyMealData.instructions.map((step, index) => (
                  <motion.li 
                    key={index} 
                    className={`flex ${visibleInstructions.includes(index) ? 'opacity-100' : 'opacity-0'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: visibleInstructions.includes(index) ? 1 : 0, y: visibleInstructions.includes(index) ? 0 : 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg flex-grow">
                      <p className="text-neutral-300">{step}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}

          {activeTab === 'ingredients' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Ingredients</h2>
              <div className="bg-neutral-800 p-6 rounded-xl">
                <ul className="divide-y divide-neutral-700">
                  {dummyMealData.ingredients.map((ingredient, index) => (
                    <motion.li 
                      key={index}
                      className="py-3 flex justify-between items-center"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <span className="text-white">{ingredient.name}</span>
                      <span className="text-neutral-400 font-medium">{ingredient.quantity}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-neutral-700">
                  <button className="bg-primary text-white w-full py-2 rounded-md hover:bg-primary-focus transition-colors">
                    Add All Ingredients to Shopping List
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'nutrition' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Nutrition Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-800 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-4">Macronutrient Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-700/50 rounded-lg">
                      <p className="text-xs text-neutral-400 mb-1">Calories</p>
                      <p className="text-lg font-bold text-white">{dummyMealData.macros.calories} kcal</p>
                    </div>
                    <div className="p-3 bg-neutral-700/50 rounded-lg">
                      <p className="text-xs text-neutral-400 mb-1">Protein</p>
                      <p className="text-lg font-bold text-blue-400">{dummyMealData.macros.protein}g</p>
                    </div>
                    <div className="p-3 bg-neutral-700/50 rounded-lg">
                      <p className="text-xs text-neutral-400 mb-1">Carbs</p>
                      <p className="text-lg font-bold text-yellow-400">{dummyMealData.macros.carbs}g</p>
                    </div>
                    <div className="p-3 bg-neutral-700/50 rounded-lg">
                      <p className="text-xs text-neutral-400 mb-1">Fat</p>
                      <p className="text-lg font-bold text-red-400">{dummyMealData.macros.fat}g</p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-4">Caloric Distribution</h3>
                  <div className="h-48">
                    <Pie data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-neutral-800 p-6 rounded-xl">
                <h3 className="text-lg font-medium text-white mb-4">Macro Impact</h3>
                <p className="text-neutral-400 mb-4">How this meal affects your daily nutrition targets:</p>
                
                <div className="space-y-4">
                  {Object.entries(dummyMealData.macros).map(([key, value]) => {
                    // Calculate percentage of daily values (using generic values)
                    const dailyValues = {
                      calories: 2000,
                      protein: 50,
                      carbs: 300,
                      fat: 70
                    };
                    
                    const percentage = Math.round((value / dailyValues[key]) * 100);
                    
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-white">{key}</span>
                          <span className="text-neutral-400">{percentage}% of daily value</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full rounded-full ${
                              key === 'calories' ? 'bg-green-500' :
                              key === 'protein' ? 'bg-blue-500' :
                              key === 'carbs' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            initial={{ width: '0%' }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Similar Meals */}
        <div className="lg:col-span-1">
          <motion.div 
            className="bg-neutral-800 rounded-xl p-6"
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-white mb-4">Similar Meals</h2>
            <div className="space-y-4">
              {dummyMealData.similarMeals.map((meal, index) => (
                <motion.div 
                  key={meal.id}
                  className="flex items-center p-2 rounded-lg hover:bg-neutral-700/50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                >
                  <img 
                    src={meal.image} 
                    alt={meal.name} 
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="ml-3">
                    <p className="text-white font-medium">{meal.name}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center text-xs text-neutral-400">
                        <svg className="w-3 h-3 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {meal.macros.calories} kcal
                      </div>
                      <div className="flex items-center text-xs text-neutral-400">
                        <svg className="w-3 h-3 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {meal.macros.protein}g
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">
              View More Similar Recipes
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MealDetails;