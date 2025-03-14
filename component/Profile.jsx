"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useRouter } from 'next/navigation';

// For charts
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [weeklyMacros, setWeeklyMacros] = useState({
    dates: [],
    calories: [],
    protein: [],
    carbs: [],
    fat: []
  });
  const [todayMacros, setTodayMacros] = useState({
    calories: { current: 0, goal: 2000 },
    protein: { current: 0, goal: 150 },
    carbs: { current: 0, goal: 200 },
    fat: { current: 0, goal: 70 }
  });

  // Auth listener - check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        await fetchTodayMacros(currentUser.uid);
        await fetchWeeklyMacros(currentUser.uid);
      } else {
        setLoading(false);
        router.push('/login'); // Redirect to login if not authenticated
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Fetch user profile data
  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          name: data.name || "User",
          email: auth.currentUser?.email || "",
          image: data.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
          target_macros: data.target_macros || {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 70
          }
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch today's macros
  const fetchTodayMacros = async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const takenMacrosDoc = await getDoc(doc(db, "users", userId, "taken_macros", today));
      
      if (takenMacrosDoc.exists()) {
        const data = takenMacrosDoc.data();
        const currentMacros = data.total || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        // Get user's target macros
        const userDoc = await getDoc(doc(db, "users", userId));
        const targetMacros = userDoc.exists() ? 
          (userDoc.data().target_macros || { calories: 2000, protein: 150, carbs: 200, fat: 70 }) : 
          { calories: 2000, protein: 150, carbs: 200, fat: 70 };
        
        setTodayMacros({
          calories: { current: currentMacros.calories, goal: targetMacros.calories },
          protein: { current: currentMacros.protein, goal: targetMacros.protein },
          carbs: { current: currentMacros.carbs, goal: targetMacros.carbs },
          fat: { current: currentMacros.fat, goal: targetMacros.fat }
        });
      }
    } catch (error) {
      console.error("Error fetching today's macros:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly macros
  const fetchWeeklyMacros = async (userId) => {
    try {
      // Calculate dates for the last 7 days
      const dates = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Format dates for display on the chart (e.g., "Mon", "Tue", etc.)
      const displayDates = dates.map(date => {
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        return day;
      });

      // Initialize arrays for macro values
      const caloriesData = Array(7).fill(0);
      const proteinData = Array(7).fill(0);
      const carbsData = Array(7).fill(0);
      const fatData = Array(7).fill(0);

      // Fetch data for each date
      for (let i = 0; i < dates.length; i++) {
        const macrosDoc = await getDoc(doc(db, "users", userId, "taken_macros", dates[i]));
        
        if (macrosDoc.exists()) {
          const data = macrosDoc.data();
          const total = data.total || { calories: 0, protein: 0, carbs: 0, fat: 0 };
          
          caloriesData[i] = total.calories;
          proteinData[i] = total.protein;
          carbsData[i] = total.carbs;
          fatData[i] = total.fat;
        }
      }

      setWeeklyMacros({
        dates: displayDates,
        calories: caloriesData,
        protein: proteinData,
        carbs: carbsData,
        fat: fatData
      });
    } catch (error) {
      console.error("Error fetching weekly macros:", error);
    }
  };

  // Calculate percentages for progress bars
  const calculatePercentage = (current, goal) => {
    if (!goal || goal <= 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
  };

  // Prepare chart data
  const chartData = {
    labels: weeklyMacros.dates,
    datasets: [
      {
        label: 'Calories',
        data: weeklyMacros.calories,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      },
      {
        label: 'Protein (g)',
        data: weeklyMacros.protein,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.3
      },
      {
        label: 'Carbs (g)',
        data: weeklyMacros.carbs,
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.3
      },
      {
        label: 'Fat (g)',
        data: weeklyMacros.fat,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
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

  // Display loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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
              src={userData?.image} 
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
                <h1 className="text-2xl font-bold text-white mb-1">{userData?.name}</h1>
                <p className="text-neutral-400 text-sm">{userData?.email}</p>
              </div>
              
              <Link 
                href="/options" 
                className="btn btn-sm btn-outline"
              >
                Edit Profile
              </Link>
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
            {/* Today's Summary */}
            <motion.div variants={itemVariants} className="bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-medium text-white mb-4">Today's Summary</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Calories</span>
                    <span className="text-white">{todayMacros.calories.current} / {todayMacros.calories.goal} kcal</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${calculatePercentage(todayMacros.calories.current, todayMacros.calories.goal)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Protein</span>
                    <span className="text-white">{todayMacros.protein.current}g / {todayMacros.protein.goal}g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${calculatePercentage(todayMacros.protein.current, todayMacros.protein.goal)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Carbs</span>
                    <span className="text-white">{todayMacros.carbs.current}g / {todayMacros.carbs.goal}g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${calculatePercentage(todayMacros.carbs.current, todayMacros.carbs.goal)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Fat</span>
                    <span className="text-white">{todayMacros.fat.current}g / {todayMacros.fat.goal}g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${calculatePercentage(todayMacros.fat.current, todayMacros.fat.goal)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/meal" className="btn btn-primary w-full">
                  Add Food
                </Link>
              </div>
            </motion.div>
            
            {/* Weekly Progress */}
            <motion.div variants={itemVariants} className="bg-neutral-800 rounded-xl p-6 shadow-lg md:col-span-2">
              <h2 className="text-lg font-medium text-white mb-4">Weekly Nutrition Trends</h2>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </motion.div>
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
                    <span className="text-white">{todayMacros.calories.current} / {todayMacros.calories.goal} kcal</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${calculatePercentage(todayMacros.calories.current, todayMacros.calories.goal)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Protein</span>
                    <span className="text-white">{todayMacros.protein.current}g / {todayMacros.protein.goal}g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${calculatePercentage(todayMacros.protein.current, todayMacros.protein.goal)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Carbs</span>
                    <span className="text-white">{todayMacros.carbs.current}g / {todayMacros.carbs.goal}g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${calculatePercentage(todayMacros.carbs.current, todayMacros.carbs.goal)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Fat</span>
                    <span className="text-white">{todayMacros.fat.current}g / {todayMacros.fat.goal}g</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${calculatePercentage(todayMacros.fat.current, todayMacros.fat.goal)}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <Link href="/meal" className="w-full mt-6 py-2 text-sm bg-primary hover:bg-primary-focus text-white rounded-md transition-colors block text-center">
                Add Food
              </Link>
            </motion.div>
            
            {/* Today's Meal Summary */}
            <motion.div
              className="bg-neutral-800 rounded-xl p-6 shadow-lg"
              variants={itemVariants}
            >
              <h2 className="text-lg font-medium text-white mb-4">Nutrition Breakdown</h2>
              
              {/* Macronutrient Distribution */}
              <div className="mt-4 p-4 bg-neutral-700/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">Macro Distribution</span>
                </div>
                <div className="w-full h-5 bg-neutral-600 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-blue-500 h-full flex items-center justify-center text-xs text-white"
                    style={{ width: `${calculatePercentage(todayMacros.protein.current * 4, todayMacros.calories.current)}%` }}
                  >
                    {calculatePercentage(todayMacros.protein.current * 4, todayMacros.calories.current)}%
                  </div>
                  <div 
                    className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white"
                    style={{ width: `${calculatePercentage(todayMacros.carbs.current * 4, todayMacros.calories.current)}%` }}
                  >
                    {calculatePercentage(todayMacros.carbs.current * 4, todayMacros.calories.current)}%
                  </div>
                  <div 
                    className="bg-red-500 h-full flex items-center justify-center text-xs text-white"
                    style={{ width: `${calculatePercentage(todayMacros.fat.current * 9, todayMacros.calories.current)}%` }}
                  >
                    {calculatePercentage(todayMacros.fat.current * 9, todayMacros.calories.current)}%
                  </div>
                </div>
                <div className="flex text-xs mt-2 text-neutral-400 justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                    <span>Protein ({todayMacros.protein.current}g)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                    <span>Carbs ({todayMacros.carbs.current}g)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                    <span>Fat ({todayMacros.fat.current}g)</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href="/options" className="btn btn-outline btn-primary w-full">
                  Adjust Targets
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;