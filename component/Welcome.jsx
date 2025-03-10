"use client";

import React from "react";

const Welcome = () => {
  const today = new Date()?.toLocaleDateString();
  
  // Example macro values
  const macros = {
    calories: { current: 1200, goal: 2000, color: "from-green-500 to-emerald-400" },
    protein: { current: 50, goal: 100, color: "from-blue-500 to-cyan-400" },
    carbs: { current: 150, goal: 250, color: "from-amber-500 to-yellow-400" },
    fat: { current: 35, goal: 65, color: "from-rose-500 to-pink-400" }
  };

  // Calculate percentages
  const calculatePercentage = (current, goal) => Math.min(100, Math.round((current / goal) * 100));
  
  return (
    <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-300 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2 md:mb-0">Nutrition Dashboard</h2>
        <p className="text-neutral-400 font-medium">{today}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-neutral-800/50 rounded-lg p-5 shadow-inner ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">Calories</h3>
            <p className="text-sm font-medium">
              <span className="text-primary-400">{macros.calories.current}</span>
              <span className="text-neutral-500"> / {macros.calories.goal}</span>
            </p>
          </div>
          
          <div className="flex justify-center py-4">
            <div className="relative">
              <div className="radial-progress text-primary bg-neutral-800 " 
                   style={{ "--value": calculatePercentage(macros.calories.current, macros.calories.goal), "--size": "8rem", "--thickness": "0.75rem" }}>
                <span className="text-2xl font-bold text-white">{calculatePercentage(macros.calories.current, macros.calories.goal)}%</span>
              </div>
              <div className="absolute -top-2 -right-2 bg-neutral-800 rounded-full p-1 border border-neutral-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-neutral-400">Daily Goal Progress</p>
        </div>
        
        <div className="bg-neutral-800/50 rounded-lg p-5 shadow-inner ">
          <h3 className="font-semibold text-white mb-4">Macronutrients</h3>
          
          {Object.entries(macros).filter(([key]) => key !== 'calories').map(([key, macro]) => (
            <div key={key} className="mb-3 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="capitalize text-sm font-medium text-white">{key}</span>
                <span className="text-xs font-medium text-neutral-400">{macro.current}g / {macro.goal}g</span>
              </div>
              <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${macro.color}`}
                  style={{ width: `${calculatePercentage(macro.current, macro.goal)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(macros).map(([key, macro]) => (
          <div key={key} className="bg-neutral-800/30 p-3 rounded-lg text-center">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{key}</p>
            <p className="font-semibold text-white">{macro.current} <span className="text-xs text-neutral-500">{key === 'calories' ? 'kcal' : 'g'}</span></p>
            <p className="text-xs text-neutral-500 mt-1">
              {calculatePercentage(macro.current, macro.goal)}% of goal
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Welcome;