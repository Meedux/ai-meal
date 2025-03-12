"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PreferenceModal = ({ user, onComplete }) => {
  const [preferences, setPreferences] = useState({
    diet: 'none', // default value
    allergies: [],
    cuisines: [],
  });
  
  // Diet options
  const dietOptions = [
    { value: 'none', label: 'No Specific Diet' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'gluten-free', label: 'Gluten Free' },
  ];
  
  // Allergy options
  const allergyOptions = [
    'Dairy', 'Eggs', 'Nuts', 'Wheat', 'Soy', 'Fish', 'Shellfish'
  ];
  
  // Cuisine options
  const cuisineOptions = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean',
    'American', 'French', 'Korean', 'Middle Eastern'
  ];

  const handleDietChange = (e) => {
    setPreferences({...preferences, diet: e.target.value});
  };
  
  const handleAllergyToggle = (allergy) => {
    const updatedAllergies = [...preferences.allergies];
    if (updatedAllergies.includes(allergy)) {
      setPreferences({
        ...preferences, 
        allergies: updatedAllergies.filter(item => item !== allergy)
      });
    } else {
      setPreferences({...preferences, allergies: [...updatedAllergies, allergy]});
    }
  };
  
  const handleCuisineToggle = (cuisine) => {
    const updatedCuisines = [...preferences.cuisines];
    if (updatedCuisines.includes(cuisine)) {
      setPreferences({
        ...preferences, 
        cuisines: updatedCuisines.filter(item => item !== cuisine)
      });
    } else {
      setPreferences({...preferences, cuisines: [...updatedCuisines, cuisine]});
    }
  };
  
  const handleSubmit = async () => {
    try {
      // Update user preferences in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        preferences: preferences,
        setupCompleted: true
      });
      
      // Notify parent component that setup is complete
      onComplete();
    } catch (error) {
      console.error("Error saving preferences:", error);
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
        className="bg-neutral rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Welcome! Let's Set Up Your Preferences</h2>
        <p className="text-neutral-400 mb-6">
          This helps us recommend meals that match your dietary needs and taste preferences.
        </p>
        
        {/* Diet Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">Select Your Diet</h3>
          <select 
            value={preferences.diet} 
            onChange={handleDietChange}
            className="w-full bg-neutral-700 border-none rounded-lg p-3 text-white"
          >
            {dietOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        {/* Allergies Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">Select Your Allergies</h3>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map(allergy => (
              <button
                key={allergy}
                onClick={() => handleAllergyToggle(allergy)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  preferences.allergies.includes(allergy)
                    ? "bg-primary text-white"
                    : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                }`}
              >
                {allergy}
              </button>
            ))}
          </div>
        </div>
        
        {/* Cuisines Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">Select Your Favorite Cuisines</h3>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => handleCuisineToggle(cuisine)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  preferences.cuisines.includes(cuisine)
                    ? "bg-primary text-white"
                    : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-focus transition-colors"
          >
            Save & Continue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PreferenceModal;