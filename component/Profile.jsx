"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Simple chart for macro tracking - you would need to install: npm install react-chartjs-2 chart.js
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Dummy user data
  const userData = {
    name: "Alex Johnson",
    username: "alexj",
    email: "alex.johnson@example.com",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    stats: {
      recipesCreated: 24,
      followers: 156,
      following: 87
    }
  };

  // Dummy recipe data
  const userRecipes = [
    {
      id: 1,
      name: "Avocado Toast with Poached Eggs",
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Breakfast",
      macros: { calories: 420, protein: 18 }
    },
    {
      id: 2,
      name: "Quinoa & Vegetable Stir Fry",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Lunch",
      macros: { calories: 380, protein: 14 }
    },
    {
      id: 3,
      name: "Grilled Salmon with Asparagus",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Dinner",
      macros: { calories: 480, protein: 42 }
    }
  ];

  // Dummy macro tracking data
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const macroHistory = {
    calories: [1850, 2100, 1950, 2200, 1800, 1950, 2050],
    protein: [95, 110, 98, 115, 90, 105, 100],
  };

  const chartData = {
    labels: weekDays,
    datasets: [
      {
        label: 'Calories',
        data: macroHistory.calories,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      },
      {
        label: 'Protein (g)',
        data: macroHistory.protein,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  const todayMacros = {
    calories: 2050,
    protein: 98,
    carbs: 220,
    fat: 65
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <motion.div 
        className="bg-neutral-800 rounded-xl p-6 mb-8 shadow-lg"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="relative mr-6 mb-4 md:mb-0">
            <img 
              src={userData.image} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
            />
            <div className="absolute bottom-0 right-0 bg-primary rounded-full w-6 h-6 flex items-center justify-center border-2 border-neutral-800">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{userData.name}</h1>
              </div>
              
              <Link 
                href="/settings/profile" 
                className="btn btn-sm btn-outline"
              >
                Edit Profile
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{userData.stats.recipesCreated}</p>
                <p className="text-xs text-neutral-400">Recipes</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-700 mb-8">
        <button 
          className={`pb-2 px-4 font-medium mr-4 transition-colors ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-white'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`pb-2 px-4 font-medium mr-4 transition-colors ${activeTab === 'recipes' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-white'}`}
          onClick={() => setActiveTab('recipes')}
        >
          My Recipes
        </button>
        <button 
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'macros' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-white'}`}
          onClick={() => setActiveTab('macros')}
        >
          Macro Tracking
        </button>
      </div>
      
      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-medium text-white mb-4">Today's Summary</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Calories</span>
                    <span className="text-white">{todayMacros.calories} kcal</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Protein</span>
                    <span className="text-white">{todayMacros.protein}g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: '80%' }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Carbs</span>
                    <span className="text-white">{todayMacros.carbs}g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: '65%' }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Fat</span>
                    <span className="text-white">{todayMacros.fat}g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: '70%' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Recent Recipes */}
            <motion.div variants={itemVariants} className="bg-neutral-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">Recent Recipes</h2>
                <button className="text-xs text-primary hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {userRecipes.slice(0, 3).map(recipe => (
                  <div key={recipe.id} className="flex items-center">
                    <img 
                      src={recipe.image} 
                      alt={recipe.name}
                      className="w-12 h-12 rounded-md object-cover mr-3"
                    />
                    <div>
                      <h3 className="text-white text-sm font-medium">{recipe.name}</h3>
                      <p className="text-neutral-400 text-xs">{recipe.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Weekly Progress */}
            <motion.div variants={itemVariants} className="bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-medium text-white mb-4">Weekly Activity</h2>
              <div className="h-48">
                <Line data={chartData} options={chartOptions} />
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* My Recipes Tab */}
        {activeTab === 'recipes' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">My Recipes</h2>
              <button className="btn btn-sm btn-primary">Create Recipe</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecipes.map(recipe => (
                <motion.div 
                  key={recipe.id}
                  variants={itemVariants}
                  className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48">
                    <img 
                      src={recipe.image} 
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-neutral-900/70 text-white text-xs rounded-full">
                        {recipe.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-2">{recipe.name}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">{recipe.macros.calories} kcal</span>
                      <span className="text-neutral-400">{recipe.macros.protein}g protein</span>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-neutral-900/40 flex justify-between items-center">
                    <button className="text-xs text-neutral-400 hover:text-primary transition-colors">
                      Edit Recipe
                    </button>
                    <button className="text-xs text-neutral-400 hover:text-primary transition-colors">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {/* Add Recipe Card */}
              <motion.div 
                variants={itemVariants}
                className="bg-neutral-800/50 border border-dashed border-neutral-700 rounded-xl flex items-center justify-center p-6 cursor-pointer hover:bg-neutral-700/30 transition-colors h-[280px]"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">Create New Recipe</h3>
                  <p className="text-neutral-400 text-sm">Share your culinary creation</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Macro Tracking Tab */}
        {activeTab === 'macros' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Weekly Chart */}
            <motion.div 
              className="bg-neutral-800 rounded-xl p-6 shadow-lg md:col-span-2"
              variants={itemVariants}
            >
              <h2 className="text-lg font-medium text-white mb-4">Weekly Nutrition Trends</h2>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </motion.div>
            
            {/* Today's Macros */}
            <motion.div 
              className="bg-neutral-800 rounded-xl p-6 shadow-lg"
              variants={itemVariants}
            >
              <h2 className="text-lg font-medium text-white mb-4">Today's Macros</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Calories</span>
                    <span className="text-white">{todayMacros.calories} / 2200 kcal</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(todayMacros.calories / 2200) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Protein</span>
                    <span className="text-white">{todayMacros.protein} / 120g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(todayMacros.protein / 120) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Carbs</span>
                    <span className="text-white">{todayMacros.carbs} / 250g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${(todayMacros.carbs / 250) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Fat</span>
                    <span className="text-white">{todayMacros.fat} / 70g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(todayMacros.fat / 70) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 py-2 text-sm bg-primary hover:bg-primary-focus text-white rounded-md transition-colors">
                Log Food
              </button>
            </motion.div>
            
            {/* Meal Log */}
            <motion.div
              className="bg-neutral-800 rounded-xl p-6 shadow-lg"
              variants={itemVariants}
            >
              <h2 className="text-lg font-medium text-white mb-4">Today's Meals</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-neutral-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white">Breakfast</p>
                      <p className="text-xs text-neutral-400">Berry Protein Smoothie</p>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-300">420 kcal</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-neutral-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white">Lunch</p>
                      <p className="text-xs text-neutral-400">Quinoa Salad</p>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-300">580 kcal</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-neutral-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white">Dinner</p>
                      <p className="text-xs text-neutral-400">Grilled Salmon</p>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-300">650 kcal</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-neutral-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white">Snack</p>
                      <p className="text-xs text-neutral-400">Protein Bar</p>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-300">180 kcal</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-neutral-700 flex justify-between items-center">
                <p className="text-sm font-medium text-white">Total</p>
                <p className="text-white font-medium">{todayMacros.calories} kcal</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;