"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MacroModal = ({ user, onComplete, date = new Date() }) => {
  const [macros, setMacros] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMacros({
      ...macros,
      [name]: parseInt(value) || 0
    });
  };
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };
  
  const handleSubmit = async () => {
    try {
      const formattedDate = formatDate(date);
      
      // Update target macros in the user document
      await updateDoc(doc(db, "users", user.uid), {
        target_macros: macros,
        lastMacroDate: formattedDate
      });
      
      // Create an initial empty entry for today's meals in taken_macros collection
      await setDoc(doc(db, "users", user.uid, "taken_macros", formattedDate), {
        date: formattedDate,
        total: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        meals: [] // Will contain meal entries with their own macros
      });
      
      onComplete();
    } catch (error) {
      console.error("Error saving macros:", error);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-neutral rounded-xl p-8 max-w-xl w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Set Your Macro Goals</h2>
        <p className="text-neutral mb-6">
          {formatDate(date) === formatDate(new Date()) 
            ? "Define your nutrition targets for today" 
            : "Update your nutrition targets"}
        </p>
        
        <div className="space-y-6">
          {/* Calories */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Daily Calories</label>
            <input
              type="number"
              name="calories"
              value={macros.calories}
              onChange={handleChange}
              className="w-full bg-neutral border-none rounded-lg p-3 text-white"
              min="500"
              max="10000"
            />
            <div className="mt-1 text-xs text-neutral-500">Recommended: 1800-2500 calories</div>
          </div>
          
          {/* Protein */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Protein (g)</label>
            <input
              type="number"
              name="protein"
              value={macros.protein}
              onChange={handleChange}
              className="w-full bg-neutral border-none rounded-lg p-3 text-white"
              min="10"
              max="500"
            />
          </div>
          
          {/* Carbs */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Carbohydrates (g)</label>
            <input
              type="number"
              name="carbs"
              value={macros.carbs}
              onChange={handleChange}
              className="w-full bg-neutral border-none rounded-lg p-3 text-white"
              min="10"
              max="800"
            />
          </div>
          
          {/* Fat */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Fat (g)</label>
            <input
              type="number"
              name="fat"
              value={macros.fat}
              onChange={handleChange}
              className="w-full bg-neutral border-none rounded-lg p-3 text-white"
              min="10"
              max="300"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-focus transition-colors"
          >
            Save Goals
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MacroModal;