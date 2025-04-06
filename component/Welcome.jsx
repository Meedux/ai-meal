"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import MealCalendarModal from "./MealCalendarModal";

const Welcome = ({ user }) => {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [macros, setMacros] = useState({
    calories: { current: 0, goal: 2000, color: "from-green-500 to-emerald-400" },
    protein: { current: 0, goal: 150, color: "from-blue-500 to-cyan-400" },
    carbs: { current: 0, goal: 200, color: "from-amber-500 to-yellow-400" },
    fat: { current: 0, goal: 70, color: "from-rose-500 to-pink-400" }
  });
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  
  useEffect(() => {
    let unsubscribe = null;
    
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Get user document for target macros
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Get target macros from user document
          const targetMacros = data.target_macros || {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 70
          };
          
          // Get today's date in YYYY-MM-DD format
          const todayFormatted = new Date().toISOString().split('T')[0];
          
          // Set up a real-time listener for taken_macros
          unsubscribe = onSnapshot(
            doc(db, "users", user.uid, "taken_macros", todayFormatted),
            (takenMacrosDoc) => {
              let currentMacros = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
              };
              
              if (takenMacrosDoc.exists()) {
                const takenMacrosData = takenMacrosDoc.data();
                currentMacros = takenMacrosData.total || currentMacros;
              }
              
              // Update the macros state with real-time values
              setMacros({
                calories: { current: currentMacros.calories, goal: targetMacros.calories, color: "from-green-500 to-emerald-400" },
                protein: { current: currentMacros.protein, goal: targetMacros.protein, color: "from-blue-500 to-cyan-400" },
                carbs: { current: currentMacros.carbs, goal: targetMacros.carbs, color: "from-amber-500 to-yellow-400" },
                fat: { current: currentMacros.fat, goal: targetMacros.fat, color: "from-rose-500 to-pink-400" }
              });
              
              setLoading(false);
            },
            (error) => {
              console.error("Error listening to taken_macros:", error);
              setLoading(false);
            }
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Clean up the listener when component unmounts
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Calculate percentages safely
  const calculatePercentage = (current, goal) => {
    if (!goal || goal <= 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
  };
  
  if (loading && user) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user ? `Welcome back, ${userData?.name || 'User'}` : 'Welcome to AI Meal Planner'}
          </h1>
          <p className="text-neutral-400 mt-1">{today}</p>
        </div>
        
        {user && (
          <div className="flex mt-4 md:mt-0 gap-2">
            <button
              onClick={() => setShowMealPlanner(true)}
              className="bg-primary hover:bg-primary/80 transition-colors text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Meal Planner</span>
            </button>
            
            <div className="bg-neutral-800/50 px-4 py-2 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-white">Daily Nutrition</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Meal Calendar Modal */}
      {user && (
        <MealCalendarModal 
          isOpen={showMealPlanner}
          onClose={() => setShowMealPlanner(false)}
          userId={user.uid}
        />
      )}
      
      {user ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Calories card - takes 2 columns */}
          <div className="lg:col-span-2 bg-neutral-800/40 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-white">Calories</h3>
              <p className="text-sm font-medium">
                <span className="text-primary">{macros.calories.current}</span>
                <span className="text-neutral-500"> / {macros.calories.goal || '0'}</span>
              </p>
            </div>
            
            {/* Rest of the existing component code remains the same */}
            <div className="flex justify-center py-4">
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#2A2A2A" strokeWidth="2"></circle>
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    stroke="url(#caloriesGradient)" 
                    strokeWidth="3" 
                    strokeDasharray={`${calculatePercentage(macros.calories.current, macros.calories.goal)} 100`}
                    strokeLinecap="round" 
                    transform="rotate(-90 18 18)"
                  ></circle>
                  <defs>
                    <linearGradient id="caloriesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{calculatePercentage(macros.calories.current, macros.calories.goal)}%</span>
                  <span className="text-xs text-neutral-400">of goal</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Macros grid - takes 3 columns */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(macros).filter(([key]) => key !== 'calories').map(([key, macro]) => (
              <div key={key} className="bg-neutral-800/40 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="capitalize font-medium text-white">{key}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-neutral-700/50 text-neutral-300">
                    {macro.current}g / {macro.goal}g
                  </span>
                </div>
                
                <div className="mt-4 w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${macro.color}`}
                    style={{ width: `${calculatePercentage(macro.current, macro.goal)}%` }}
                  />
                </div>
                
                <div className="mt-2 text-xs text-neutral-400 text-right">
                  {calculatePercentage(macro.current, macro.goal)}% completed
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-neutral-800/40 rounded-lg p-6 text-center">
          <div className="mb-4 flex justify-center">
            <svg className="w-16 h-16 text-primary opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Track Your Nutrition</h2>
          <p className="text-neutral-400 mb-4">Sign in to track your daily nutrition goals and get personalized meal recommendations.</p>
          <div className="flex justify-center gap-4">
            <a href="/" className="btn btn-outline btn-primary">Sign In</a>
            <a href="/register" className="btn btn-primary">Register</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;