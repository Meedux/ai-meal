"use client";

import React, { useState, useEffect } from 'react';
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { addMealToToday, removeMealFromToday, getRecipeById } from "@/lib/service/meal";
import { addMealToTracking } from "@/lib/service/meal-tracking";
import Card from "@/component/util/Card";
import Link from "next/link";
import Image from "next/image";

// Import or create a custom date picker component
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Import or create a chart component (using recharts)
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

const MealPlan = () => {
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [macros, setMacros] = useState({
    current: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    goal: { calories: 2000, protein: 150, carbs: 200, fat: 70 }
  });
  const [activeTab, setActiveTab] = useState('today');
  const [todaysPlannedMeals, setTodaysPlannedMeals] = useState([]);

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
  
      try {
        // Fetch user profile for target macros
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Update macro goals from user data
          if (data.target_macros) {
            setMacros(prev => ({
              ...prev,
              goal: data.target_macros
            }));
          }
        }
  
        // Fetch today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's consumed meals
        await fetchTodaysMeals(today);
        
        // Fetch today's planned meals
        await fetchTodaysPlannedMeals(today);
        
        // Fetch planned meals for selected date
        await fetchPlannedMeals(formatDate(selectedDate));
  
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchTodaysPlannedMeals = async (date) => {
    try {
      // Create a reference to the user's meal plan collection
      const mealPlanRef = collection(db, 'users', user.uid, 'mealPlan');
      
      // Query for meals planned for today
      const mealPlanQuery = query(
        mealPlanRef,
        where('date', '==', date),
        orderBy('addedAt', 'desc')
      );
      
      const mealsSnapshot = await getDocs(mealPlanQuery);
      
      // Process meals
      const meals = [];
      
      for (const mealDoc of mealsSnapshot.docs) {
        const mealData = mealDoc.data();
        
        // Add meal ID from document
        const meal = {
          id: mealDoc.id,
          ...mealData,
          isPlanned: true // Flag to indicate this is a planned meal
        };
        
        meals.push(meal);
      }
      
      setTodaysPlannedMeals(meals);
      
    } catch (err) {
      console.error("Error fetching today's planned meals:", err);
      setError("Failed to load today's planned meals. Please try again.");
    }
  };

  // Fetch planned meals when selected date changes
  useEffect(() => {
    if (user) {
      fetchPlannedMeals(formatDate(selectedDate));
    }
  }, [selectedDate, user]);

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch today's meals
  const fetchTodaysMeals = async (date) => {
    try {
      // Create a reference to the user's daily meals collection
      const dailyMealsRef = collection(db, 'users', user.uid, 'dailyMeals');
      
      // Query for meals added today
      const dailyMealsQuery = query(
        dailyMealsRef,
        where('date', '==', date),
        orderBy('addedAt', 'desc')
      );
      
      const mealsSnapshot = await getDocs(dailyMealsQuery);
      
      // Process meals
      const meals = [];
      let totalMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      for (const mealDoc of mealsSnapshot.docs) {
        const mealData = mealDoc.data();
        
        // Add meal ID from document
        const meal = {
          id: mealDoc.id,
          ...mealData
        };
        
        // If we have macros, add them to the total
        if (mealData.macros) {
          totalMacros.calories += Number(mealData.macros.calories) || 0;
          totalMacros.protein += Number(mealData.macros.protein) || 0;
          totalMacros.carbs += Number(mealData.macros.carbs) || 0;
          totalMacros.fat += Number(mealData.macros.fat) || 0;
        }
        
        meals.push(meal);
      }
      
      setTodaysMeals(meals);
      setMacros(prev => ({
        ...prev,
        current: totalMacros
      }));
      
    } catch (err) {
      console.error("Error fetching today's meals:", err);
      setError("Failed to load today's meals. Please try again.");
    }
  };

  // Fetch planned meals
  const fetchPlannedMeals = async (date) => {
    try {
      // Create a reference to the user's meal plan collection
      const mealPlanRef = collection(db, 'users', user.uid, 'mealPlan');
      
      // Query for meals planned for selected date
      const mealPlanQuery = query(
        mealPlanRef,
        where('date', '==', date),
        orderBy('addedAt', 'desc')
      );
      
      const mealsSnapshot = await getDocs(mealPlanQuery);
      
      // Process meals
      const meals = [];
      
      for (const mealDoc of mealsSnapshot.docs) {
        const mealData = mealDoc.data();
        
        // Add meal ID from document
        const meal = {
          id: mealDoc.id,
          ...mealData
        };
        
        meals.push(meal);
      }
      
      setPlannedMeals(meals);
      
    } catch (err) {
      console.error("Error fetching planned meals:", err);
      setError("Failed to load planned meals. Please try again.");
    }
  };

  // Remove meal from today
  const handleRemoveMeal = async (mealDocId, mealId, collection = 'dailyMeals') => {
    try {
      // Remove the meal from the specified collection
      await removeMealFromToday(mealDocId, collection);
      
      // Update UI based on which collection was affected
      if (collection === 'dailyMeals') {
        // Update consumed meals list
        const removedMeal = todaysMeals.find(meal => meal.id === mealDocId);
        setTodaysMeals(prev => prev.filter(meal => meal.id !== mealDocId));
        
        // Update macros
        if (removedMeal && removedMeal.macros) {
          setMacros(prev => ({
            ...prev,
            current: {
              calories: prev.current.calories - (Number(removedMeal.macros.calories) || 0),
              protein: prev.current.protein - (Number(removedMeal.macros.protein) || 0),
              carbs: prev.current.carbs - (Number(removedMeal.macros.carbs) || 0),
              fat: prev.current.fat - (Number(removedMeal.macros.fat) || 0)
            }
          }));
        }
      } else if (collection === 'mealPlan') {
        // Update planned meals list
        setTodaysPlannedMeals(prev => prev.filter(meal => meal.id !== mealDocId));
      }
      
    } catch (err) {
      console.error("Error removing meal:", err);
      setError("Failed to remove meal. Please try again.");
    }
  };

  // Add planned meal to today
  const handleAddToToday = async (mealId, plannedMealDocId) => {
    try {
      // Get meal details
      const mealData = await getRecipeById(mealId);
      
      // Add to today's meals
      const result = await addMealToToday(mealId, mealData);
      
      // Add to tracking with macros
      if (mealData.macros) {
        await addMealToTracking(user.uid, {
          name: mealData.name,
          id: mealId,
          macros: {
            calories: Number(mealData.macros.calories) || 0,
            protein: Number(mealData.macros.protein) || 0,
            carbs: Number(mealData.macros.carbs) || 0,
            fat: Number(mealData.macros.fat) || 0,
          }
        });
      }
      
      // If this was a planned meal, optionally remove it from planned meals
      if (plannedMealDocId) {
        await removeMealFromToday(plannedMealDocId, 'mealPlan');
        // Update the UI
        setTodaysPlannedMeals(prev => prev.filter(meal => meal.id !== plannedMealDocId));
      }
      
      // Update UI by refreshing today's meals
      const today = new Date().toISOString().split('T')[0];
      await fetchTodaysMeals(today);
      
    } catch (err) {
      console.error("Error adding meal to today:", err);
      setError("Failed to add meal to today. Please try again.");
    }
  };

  // Prepare data for the macro progress bar chart
  const prepareBarChartData = () => {
    return [
      {
        name: 'Calories',
        consumed: macros.current.calories,
        goal: macros.goal.calories,
        unit: 'kcal'
      },
      {
        name: 'Protein',
        consumed: macros.current.protein,
        goal: macros.goal.protein,
        unit: 'g'
      },
      {
        name: 'Carbs',
        consumed: macros.current.carbs,
        goal: macros.goal.carbs,
        unit: 'g'
      },
      {
        name: 'Fat',
        consumed: macros.current.fat,
        goal: macros.goal.fat,
        unit: 'g'
      }
    ];
  };

  // Prepare data for the macro distribution pie chart
  const preparePieChartData = () => {
    const total = macros.current.protein + macros.current.carbs + macros.current.fat;
    if (total === 0) return [];
    
    return [
      { name: 'Protein', value: macros.current.protein, color: '#8884d8' },
      { name: 'Carbs', value: macros.current.carbs, color: '#82ca9d' },
      { name: 'Fat', value: macros.current.fat, color: '#ffc658' }
    ];
  };

  // Calculate macro percentages
  const calculatePercentage = (current, goal) => {
    if (!goal) return 0;
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">Please Log In</h2>
            <p className="text-neutral-400 mb-4">You need to be logged in to view your meal plan.</p>
            <Link href="/login" className="btn btn-primary">
              Log In
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Meal Planning</h1>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-neutral-700 mb-6">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'today' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400'}`}
          onClick={() => setActiveTab('today')}
        >
          Today's Meals
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'plan' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400'}`}
          onClick={() => setActiveTab('plan')}
        >
          Meal Plan
        </button>
      </div>
      
      {/* Macros Overview Card */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Nutrition Overview</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Macro Progress Bars */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Daily Progress</h3>
              
              <div className="space-y-4">
                {Object.entries(macros.current).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-neutral-300">{key}</span>
                      <span className="text-neutral-400">
                        {value} / {macros.goal[key] || 0} 
                        {key === 'calories' ? ' kcal' : 'g'}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          key === 'calories' ? 'bg-green-500' :
                          key === 'protein' ? 'bg-blue-500' :
                          key === 'carbs' ? 'bg-yellow-500' : 'bg-pink-500'
                        }`}
                        style={{ width: `${calculatePercentage(value, macros.goal[key])}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Macro Distribution Chart */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Macro Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={preparePieChartData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {preparePieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}g`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Today's Meals or Meal Plan based on active tab */}
      {activeTab === 'today' ? (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Today's Meals</h2>
            
            {todaysMeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-400 mb-4">You haven't added any meals for today.</p>
                <Link href="/meal" className="btn btn-primary">
                  Browse Meals
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysMeals.map((meal) => (
                  <div key={meal.id} className="bg-neutral-800 rounded-lg overflow-hidden flex">
                    {meal.image ? (
                      <img 
                        src={meal.image} 
                        alt={meal.recipeName} 
                        className="w-24 h-24 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 bg-neutral-700 flex items-center justify-center">
                        <span className="text-neutral-500">No Image</span>
                      </div>
                    )}
                    
                    <div className="p-4 flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/meal/${meal.mealId}`} className="text-white font-medium hover:text-primary">
                            {meal.recipeName}
                          </Link>
                          
                          {meal.macros && (
                            <div className="mt-1 flex flex-wrap gap-2">
                              <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
                                {meal.macros.calories} kcal
                              </span>
                              <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                                P: {meal.macros.protein}g
                              </span>
                              <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded">
                                C: {meal.macros.carbs}g
                              </span>
                              <span className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded">
                                F: {meal.macros.fat}g
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleRemoveMeal(meal.id, meal.mealId)}
                          className="text-neutral-400 hover:text-red-500"
                          aria-label="Remove meal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Meal Plan</h2>
              
              <div className="bg-neutral-800 rounded-md p-2">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="bg-transparent text-white text-center cursor-pointer"
                />
              </div>
            </div>
            
            {plannedMeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-400 mb-4">You haven't planned any meals for this day.</p>
                <Link href="/meal" className="btn btn-primary">
                  Browse Meals
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {plannedMeals.map((meal) => (
                  <div key={meal.id} className="bg-neutral-800 rounded-lg overflow-hidden flex">
                    {meal.image ? (
                      <img 
                        src={meal.image} 
                        alt={meal.recipeName} 
                        className="w-24 h-24 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 bg-neutral-700 flex items-center justify-center">
                        <span className="text-neutral-500">No Image</span>
                      </div>
                    )}
                    
                    <div className="p-4 flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/meal/${meal.mealId}`} className="text-white font-medium hover:text-primary">
                            {meal.recipeName}
                          </Link>
                          
                          {meal.macros && (
                            <div className="mt-1 flex flex-wrap gap-2">
                              <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
                                {meal.macros.calories} kcal
                              </span>
                              <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                                P: {meal.macros.protein}g
                              </span>
                              <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded">
                                C: {meal.macros.carbs}g
                              </span>
                              <span className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded">
                                F: {meal.macros.fat}g
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {formatDate(selectedDate) === formatDate(new Date()) && (
                            <button 
                              onClick={() => handleAddToToday(meal.mealId)}
                              className="text-neutral-400 hover:text-green-500"
                              aria-label="Add to today"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleRemoveMeal(meal.id, meal.mealId)}
                            className="text-neutral-400 hover:text-red-500"
                            aria-label="Remove meal"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MealPlan;