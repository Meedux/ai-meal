"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Options = () => {
  const router = useRouter();

  // State management
  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state for account settings
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
  });

  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // State for dietary preferences
  const [selectedDiet, setSelectedDiet] = useState("Omnivore");
  const [cuisinePreferences, setCuisinePreferences] = useState([]);
  const [additionalPreferences, setAdditionalPreferences] = useState([]);

  // State for health goals
  const [primaryGoal, setPrimaryGoal] = useState("Maintain Weight");
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [macros, setMacros] = useState({
    protein: 30,
    carbs: 40,
    fat: 30,
  });

  // Calculate macros in grams based on percentages
  const calculateMacrosInGrams = () => {
    const proteinGrams = Math.round(
      (calorieTarget * (macros.protein / 100)) / 4
    ); // 4 calories per gram of protein
    const carbsGrams = Math.round((calorieTarget * (macros.carbs / 100)) / 4); // 4 calories per gram of carbs
    const fatGrams = Math.round((calorieTarget * (macros.fat / 100)) / 9); // 9 calories per gram of fat
    return { proteinGrams, carbsGrams, fatGrams };
  };

  const { proteinGrams, carbsGrams, fatGrams } = calculateMacrosInGrams();

  // Auth listener - check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser.uid);
      } else {
        setLoading(false);
        router.push("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", userId));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Populate account form
        setAccountForm({
          name: userData.name || "",
          email: user?.email || "",
        });

        // Populate dietary preferences
        if (userData.preferences) {
          setSelectedDiet(userData.preferences.diet || "Omnivore");
          setCuisinePreferences(userData.preferences.cuisines || []);
          setAdditionalPreferences(userData.preferences.additional || []);
        }

        // Populate health goals
        if (userData.target_macros) {
          setCalorieTarget(userData.target_macros.calories || 2000);

          // Calculate percentages from gram values if they exist
          const targetMacros = userData.target_macros;
          const totalCalories = targetMacros.calories || 2000;

          if (targetMacros.protein && targetMacros.carbs && targetMacros.fat) {
            const proteinPercentage = Math.round(
              ((targetMacros.protein * 4) / totalCalories) * 100
            );
            const carbsPercentage = Math.round(
              ((targetMacros.carbs * 4) / totalCalories) * 100
            );
            const fatPercentage = Math.round(
              ((targetMacros.fat * 9) / totalCalories) * 100
            );

            setMacros({
              protein: proteinPercentage,
              carbs: carbsPercentage,
              fat: fatPercentage,
            });
          }

          setPrimaryGoal(userData.goal || "Maintain Weight");
        }
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load your preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle account form changes
  const handleAccountChange = (e) => {
    setAccountForm({
      ...accountForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle cuisine preference changes
  const handleCuisineChange = (cuisine) => {
    if (cuisinePreferences.includes(cuisine)) {
      setCuisinePreferences(
        cuisinePreferences.filter((item) => item !== cuisine)
      );
    } else {
      setCuisinePreferences([...cuisinePreferences, cuisine]);
    }
  };

  // Handle additional preferences changes
  const handlePreferenceChange = (preference) => {
    if (additionalPreferences.includes(preference)) {
      setAdditionalPreferences(
        additionalPreferences.filter((item) => item !== preference)
      );
    } else {
      setAdditionalPreferences([...additionalPreferences, preference]);
    }
  };

  // Handle macro distribution changes
  const handleMacroChange = (macro, value) => {
    // Update the specified macro
    const updatedMacros = { ...macros, [macro]: parseInt(value) };

    // Ensure the sum of all macros is 100%
    const sum = Object.values(updatedMacros).reduce((a, b) => a + b, 0);

    if (sum !== 100) {
      // Adjust other macros proportionally
      const macroKeys = Object.keys(updatedMacros).filter(
        (key) => key !== macro
      );
      const remaining = 100 - updatedMacros[macro];
      const currentSum = macroKeys.reduce(
        (sum, key) => sum + updatedMacros[key],
        0
      );

      if (currentSum > 0) {
        // Prevent division by zero
        macroKeys.forEach((key) => {
          updatedMacros[key] = Math.round(
            updatedMacros[key] * (remaining / currentSum)
          );
        });
      } else {
        // Distribute remaining percentage evenly
        macroKeys.forEach((key) => {
          updatedMacros[key] = Math.round(remaining / macroKeys.length);
        });
      }
    }

    setMacros(updatedMacros);
  };

  // Save account settings
  const saveAccountSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, "users", user.uid), {
        name: accountForm.name,
        updatedAt: new Date(),
      });

      toast.success("Account settings updated successfully!");
    } catch (err) {
      console.error("Error updating account:", err);
      toast.error("Failed to update account settings.");
    } finally {
      setSaving(false);
    }
  };

  // Save dietary preferences
  const saveDietaryPreferences = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, "users", user.uid), {
        preferences: {
          diet: selectedDiet,
          cuisines: cuisinePreferences,
          additional: additionalPreferences,
        },
        updatedAt: new Date(),
      });

      toast.success("Dietary preferences updated successfully!");
      setPreferencesSaved(true);

      // Redirect to profile page after showing success for 1.5 seconds
      setTimeout(() => {
        router.push("/me");
      }, 1500);
    } catch (err) {
      console.error("Error updating preferences:", err);
      toast.error("Failed to update dietary preferences.");
      setPreferencesSaved(false);
    } finally {
      setSaving(false);
    }
  };

  // Save health goals
  const saveHealthGoals = async () => {
    if (!user) return;

    const { proteinGrams, carbsGrams, fatGrams } = calculateMacrosInGrams();

    try {
      setSaving(true);

      await updateDoc(doc(db, "users", user.uid), {
        goal: primaryGoal,
        target_macros: {
          calories: parseInt(calorieTarget),
          protein: proteinGrams,
          carbs: carbsGrams,
          fat: fatGrams,
        },
        updatedAt: new Date(),
      });

      // Also update taken_macros for current date to ensure chart displays correctly
      const today = new Date().toISOString().split("T")[0];
      const takenMacrosRef = doc(db, "users", user.uid, "taken_macros", today);

      const takenMacrosDoc = await getDoc(takenMacrosRef);
      if (!takenMacrosDoc.exists()) {
        // Create an initial empty document if it doesn't exist
        await updateDoc(takenMacrosRef, {
          date: today,
          total: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
          },
          meals: [],
        });
      }

      toast.success("Health goals updated successfully!");
    } catch (err) {
      console.error("Error updating health goals:", err);
      toast.error("Failed to update health goals.");
    } finally {
      setSaving(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  // Reset success state when changing tabs
  useEffect(() => {
    setPreferencesSaved(false);
  }, [activeTab]);

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
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white">
          Settings & Preferences
        </h1>
        <p className="text-neutral-400">
          Customize your experience and dietary requirements
        </p>
      </motion.div>

      {/* Display error message if there's an error */}
      {error && (
        <div className="bg-red-900/30 text-red-200 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

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
                  onClick={() => setActiveTab("account")}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "account"
                      ? "bg-primary text-white"
                      : "text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("dietary")}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "dietary"
                      ? "bg-primary text-white"
                      : "text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  Dietary Preferences
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("health")}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "health"
                      ? "bg-primary text-white"
                      : "text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Health Goals
                </button>
              </li>
            </ul>
          </nav>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 bg-neutral-800 rounded-xl p-6 shadow-lg">
          {/* Account Settings */}
          {activeTab === "account" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Account Settings
              </h2>

              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={
                        user?.photoURL ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                      }
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <button className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                  <button className="text-sm text-primary hover:underline">
                    Upload New
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={accountForm.name}
                  onChange={handleAccountChange}
                  className="w-full bg-neutral-700 border-0 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={accountForm.email}
                  disabled
                  className="w-full bg-neutral-700/50 border-0 rounded-lg p-2 text-white/70"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Email cannot be changed. This is your login email.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Change Password
                </label>
                <button className="text-primary text-sm hover:underline">
                  Update Password
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-10">
                <button
                  className={`btn ${
                    preferencesSaved
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "btn-primary"
                  } ${saving ? "loading" : ""}`}
                  onClick={saveDietaryPreferences}
                  disabled={saving || preferencesSaved}
                >
                  {saving
                    ? "Saving..."
                    : preferencesSaved
                    ? "Saved! Redirecting..."
                    : "Save Preferences"}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Dietary Preferences */}
          {activeTab === "dietary" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Dietary Preferences
              </h2>

              <motion.div variants={itemVariants} className="mb-6">
                <p className="text-neutral-400 mb-4">Select your diet type:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Omnivore",
                    "Vegetarian",
                    "Vegan",
                    "Pescatarian",
                    "Keto",
                    "Paleo",
                    "Mediterranean",
                    "None",
                  ].map((diet) => (
                    <label
                      key={diet}
                      className="flex items-center bg-neutral-700 p-3 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors"
                    >
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
                  {[
                    "Italian",
                    "Mexican",
                    "Asian",
                    "Mediterranean",
                    "Indian",
                    "American",
                    "Middle Eastern",
                    "French",
                    "Thai",
                  ].map((cuisine) => (
                    <label
                      key={cuisine}
                      className="flex items-center bg-neutral-700 p-3 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors"
                    >
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
                  {[
                    "Low-sodium meals",
                    "Avoid processed sugar",
                    "Gluten-free options",
                    "High-protein meals",
                  ].map((preference) => (
                    <label
                      key={preference}
                      className="flex items-center bg-neutral-700 p-3 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors"
                    >
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
                <button
                  className={`btn btn-primary ${saving ? "loading" : ""}`}
                  onClick={saveDietaryPreferences}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Health Goals Tab */}
          {activeTab === "health" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Health Goals
              </h2>

              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Primary Goal
                </label>
                <select
                  className="w-full bg-neutral-700 border-0 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                >
                  <option>Weight Loss</option>
                  <option>Muscle Gain</option>
                  <option>Maintain Weight</option>
                  <option>Improve Overall Health</option>
                  <option>Athletic Performance</option>
                </select>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Daily Calorie Target
                </label>
                <input
                  type="number"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(e.target.value)}
                  className="w-full bg-neutral-700 border-0 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Macronutrient Distribution
                </label>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein: {macros.protein}%</span>
                      <span>{proteinGrams}g</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={macros.protein}
                      onChange={(e) =>
                        handleMacroChange("protein", e.target.value)
                      }
                      className="range range-primary w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbs: {macros.carbs}%</span>
                      <span>{carbsGrams}g</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={macros.carbs}
                      onChange={(e) =>
                        handleMacroChange("carbs", e.target.value)
                      }
                      className="range range-primary w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat: {macros.fat}%</span>
                      <span>{fatGrams}g</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={macros.fat}
                      onChange={(e) => handleMacroChange("fat", e.target.value)}
                      className="range range-primary w-full"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-neutral-700/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-medium">
                      Macro Distribution
                    </span>
                    <span className="text-sm text-neutral-400">
                      Total: {macros.protein + macros.carbs + macros.fat}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-neutral-600 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${macros.protein}%` }}
                    ></div>
                    <div
                      className="bg-yellow-500 h-full"
                      style={{ width: `${macros.carbs}%` }}
                    ></div>
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${macros.fat}%` }}
                    ></div>
                  </div>
                  <div className="flex text-xs mt-2 text-neutral-400 justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      <span>Protein</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                      <span>Carbs</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      <span>Fat</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-10">
                <button
                  className={`btn btn-primary ${saving ? "loading" : ""}`}
                  onClick={saveHealthGoals}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Health Goals"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Options; // filepath: c:\Users\herre\OneDrive\Documents\web\ai-meal\component\Options.jsx
