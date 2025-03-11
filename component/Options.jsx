"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Options = () => {
  const [activeTab, setActiveTab] = useState('account');
  
  // Form state for account settings
  const [accountForm, setAccountForm] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com"
  });
  
  // State for dietary preferences
  const [selectedDiet, setSelectedDiet] = useState('Omnivore');
  const [cuisinePreferences, setCuisinePreferences] = useState([]);
  const [additionalPreferences, setAdditionalPreferences] = useState([]);
  
  // Handle account form changes
  const handleAccountChange = (e) => {
    setAccountForm({
      ...accountForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle cuisine preference changes
  const handleCuisineChange = (cuisine) => {
    if (cuisinePreferences.includes(cuisine)) {
      setCuisinePreferences(cuisinePreferences.filter(item => item !== cuisine));
    } else {
      setCuisinePreferences([...cuisinePreferences, cuisine]);
    }
  };
  
  // Handle additional preferences changes
  const handlePreferenceChange = (preference) => {
    if (additionalPreferences.includes(preference)) {
      setAdditionalPreferences(additionalPreferences.filter(item => item !== preference));
    } else {
      setAdditionalPreferences([...additionalPreferences, preference]);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white">Settings & Preferences</h1>
        <p className="text-neutral-400">Customize your experience and dietary requirements</p>
      </motion.div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:w-64 bg-neutral-800 rounded-xl p-4 shadow-lg"
        >
          <nav>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'account' ? 'bg-primary text-white' : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('dietary')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'dietary' ? 'bg-primary text-white' : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Dietary Preferences
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('health')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'health' ? 'bg-primary text-white' : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Health Goals
                </button>
              </li>
              {/* <li>
                <button 
                  onClick={() => setActiveTab('allergies')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'allergies' ? 'bg-primary text-white' : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Allergies & Restrictions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'notifications' ? 'bg-primary text-white' : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'privacy' ? 'bg-primary text-white' : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privacy & Security
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'appearance' ? 'bg-primary text-white' : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Appearance
                </button>
              </li> */}
            </ul>
          </nav>
        </motion.div>
        
        {/* Content Area */}
        <div className="flex-1 bg-neutral-800 rounded-xl p-6 shadow-lg">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
              
              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <button className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <button className="text-sm text-primary hover:underline">Upload New</button>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={accountForm.name}
                  onChange={handleAccountChange}
                  className="w-full bg-neutral-700 border-0 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                  className="w-full bg-neutral-700 border-0 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Change Password</label>
                <button className="text-primary text-sm hover:underline">Update Password</button>
              </motion.div>
            
              <motion.div variants={itemVariants} className="mt-10">
                <button className="btn btn-primary">Save Changes</button>
              </motion.div>
            </motion.div>
          )}
          
          {/* Dietary Preferences */}
          {activeTab === 'dietary' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-bold text-white mb-6">Dietary Preferences</h2>
              
              <motion.div variants={itemVariants} className="mb-6">
                <p className="text-neutral-400 mb-4">Select your diet type:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean'].map((diet) => (
                    <label key={diet} className="flex items-center bg-neutral-700 p-3 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors">
                      <input 
                        type="radio" 
                        name="diet" 
                        className="mr-3" 
                        checked={selectedDiet === diet}
                        onChange={() => setSelectedDiet(diet)}
                      />
                      <span className="text-white">{diet}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-6">
                <p className="text-neutral-400 mb-4">Cuisine preferences:</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Italian', 'Mexican', 'Asian', 'Mediterranean', 'Indian', 'American', 'Middle Eastern', 'French', 'Thai'].map((cuisine) => (
                    <label key={cuisine} className="flex items-center bg-neutral-700 p-3 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors">
                      <input 
                        type="checkbox" 
                        className="mr-3" 
                        checked={cuisinePreferences.includes(cuisine)}
                        onChange={() => handleCuisineChange(cuisine)}
                      />
                      <span className="text-white">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-6">
                <p className="text-neutral-400 mb-4">Additional preferences:</p>
                
                <div className="space-y-3">
                  {['Low-sodium meals', 'Avoid processed sugar', 'Gluten-free options', 'High-protein meals'].map(preference => (
                    <label key={preference} className="flex items-center bg-neutral-700 p-3 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors">
                      <input 
                        type="checkbox" 
                        className="mr-3" 
                        checked={additionalPreferences.includes(preference)}
                        onChange={() => handlePreferenceChange(preference)}
                      />
                      <span className="text-white">{preference}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mt-10">
                <button className="btn btn-primary">Save Preferences</button>
              </motion.div>
            </motion.div>
          )}

          {/* Health Goals Tab */}
          {activeTab === 'health' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-bold text-white mb-6">Health Goals</h2>
              
              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Primary Goal</label>
                <select className="w-full bg-neutral-700 border-0 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary">
                  <option>Weight Loss</option>
                  <option>Muscle Gain</option>
                  <option>Maintain Weight</option>
                  <option>Improve Overall Health</option>
                  <option>Athletic Performance</option>
                </select>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Daily Calorie Target</label>
                <input 
                  type="number" 
                  defaultValue="2200"
                  className="w-full bg-neutral-700 border-0 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Macronutrient Distribution</label>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein: 30%</span>
                      <span>165g</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="60" 
                      defaultValue="30"
                      className="range range-primary w-full" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbs: 40%</span>
                      <span>220g</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="70" 
                      defaultValue="40"
                      className="range range-primary w-full" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat: 30%</span>
                      <span>73g</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="60" 
                      defaultValue="30"
                      className="range range-primary w-full" 
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mt-10">
                <button className="btn btn-primary">Save Health Goals</button>
              </motion.div>
            </motion.div>
          )}
          
          {/* Additional tabs would go here... */}
        </div>
      </div>
    </div>
  );
};

export default Options;