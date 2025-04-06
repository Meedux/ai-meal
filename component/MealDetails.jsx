"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { getRecipeById } from "@/lib/service/meal";
import { deleteRecipe } from "@/lib/service/meal";
import { useRouter } from "next/navigation";

// For the pie chart
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { addMealToToday, addMealToPlan } from "@/lib/service/meal";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { addMealToTracking } from "@/lib/service/meal-tracking";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DatePickerModal from "./DatePickerModal";
import { addMealToPlanWithDate } from "@/lib/service/meal";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const MealDetails = () => {
  // Get meal ID from URL params
  const params = useParams();
  const mealId = params.id;

  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [meal, setMeal] = useState(null);
  const [activeTab, setActiveTab] = useState("instructions");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleInstructions, setVisibleInstructions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Replace useAuth with direct Firebase auth
  const [user, setUser] = useState(null);
  const [addingToToday, setAddingToToday] = useState(false);
  const [addingToPlan, setAddingToPlan] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Track authentication state with Firebase directly
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Fetch meal data
  useEffect(() => {
    const fetchMealData = async () => {
      if (!mealId) return;

      try {
        setIsLoading(true);
        setError(null);

        const mealData = await getRecipeById(mealId);
        setMeal(mealData);
        setIsLoaded(true);
      } catch (err) {
        console.error("Error fetching meal:", err);
        setError(err.message || "Failed to load meal details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealData();
  }, [mealId]);

  useEffect(() => {
    if (meal && user) {
      console.log("Meal ownership check:", {
        mealId: mealId,
        userId: user.uid,
        mealUserId: meal.userId,
        createdBy: meal.createdBy,
        isOwner: meal.userId === user.uid || meal.createdBy === user.uid,
      });
    }
  }, [meal, user]);

  // Gradually reveal recipe instructions
  useEffect(() => {
    if (!meal || !meal.instructions) return;

    if (visibleInstructions.length < meal.instructions.length) {
      const timer = setTimeout(() => {
        const newVisible = [...visibleInstructions];
        if (newVisible.length < meal.instructions.length) {
          newVisible.push(newVisible.length);
          setVisibleInstructions(newVisible);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [meal, visibleInstructions]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleDateSelected = async (selectedDate) => {
    try {
      setAddingToPlan(true);
      setStatusMessage(null);

      const result = await addMealToPlanWithDate(mealId, meal, selectedDate);
      setStatusMessage({
        type: "success",
        text: `Meal added to your plan for ${new Date(
          selectedDate
        ).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}`,
      });
    } catch (error) {
      console.error("Failed to add meal to plan:", error);
      setStatusMessage({
        type: "error",
        text: error.message || "Failed to add meal",
      });
    } finally {
      setAddingToPlan(false);
    }
  };

  // Handler functions using direct Firebase auth
  const handleAddToToday = async () => {
    if (!user) {
      setStatusMessage({
        type: "error",
        text: "Please log in to add meals to your plan",
      });
      return;
    }

    try {
      setAddingToToday(true);
      setStatusMessage(null);

      // 1. Add to dailyMeals collection
      const result = await addMealToToday(mealId, meal);

      // 2. Also update the taken_macros document with proper macro values
      if (meal.macros) {
        await addMealToTracking(user.uid, {
          name: meal.name,
          id: mealId,
          macros: {
            calories: Number(meal.macros.calories) || 0,
            protein: Number(meal.macros.protein) || 0,
            carbs: Number(meal.macros.carbs) || 0,
            fat: Number(meal.macros.fat) || 0,
          },
          image: meal.image || null,
        });
      }

      setStatusMessage({ type: "success", text: result.message });
    } catch (error) {
      console.error("Failed to add meal to today's plan:", error);
      setStatusMessage({
        type: "error",
        text: error.message || "Failed to add meal",
      });
    } finally {
      setAddingToToday(false);
    }
  };

  const handleAddToPlan = async () => {
    if (!user) {
      setStatusMessage({
        type: "error",
        text: "Please log in to add meals to your plan",
      });
      return;
    }

    // Show date picker instead of immediately adding
    setShowDatePicker(true);
  };

  const handleDeleteRecipe = async () => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recipe? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await deleteRecipe(mealId);
      setStatusMessage({
        type: "success",
        text: "Recipe deleted successfully!",
      });

      // Navigate to meals page after short delay
      setTimeout(() => {
        router.push("/meal");
      }, 1500);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      setStatusMessage({
        type: "error",
        text: error.message || "Failed to delete recipe",
      });
      setIsDeleting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="animate-pulse">
          <div className="rounded-2xl bg-neutral-800 h-80 mb-6"></div>
          <div className="flex flex-wrap gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-800 h-14 w-32 rounded-lg"
              ></div>
            ))}
          </div>
          <div className="h-8 bg-neutral-800 w-32 mb-6 rounded-md"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl text-center">
        <div className="bg-neutral-800/60 rounded-lg p-8 max-w-lg mx-auto">
          <svg
            className="w-16 h-16 text-primary/70 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-xl font-medium text-white mb-2">
            Recipe Not Found
          </h3>
          <p className="text-neutral-400 mb-6">{error}</p>
          <a href="/meal" className="btn btn-primary">
            Browse Meals
          </a>
        </div>
      </div>
    );
  }

  // Return early if meal data hasn't loaded yet
  if (!meal) return null;

  // Prepare pie chart data for macronutrients
  const chartData = {
    labels: ["Protein", "Carbs", "Fat"],
    datasets: [
      {
        data: [
          (meal.macros?.protein || 0) * 4, // 4 calories per gram of protein
          (meal.macros?.carbs || 0) * 4, // 4 calories per gram of carbs
          (meal.macros?.fat || 0) * 9, // 9 calories per gram of fat
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)", // Protein - blue
          "rgba(255, 206, 86, 0.7)", // Carbs - yellow
          "rgba(255, 99, 132, 0.7)", // Fat - red
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#e5e5e5",
          font: { size: 12 },
        },
      },
    },
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
          {meal.image ? (
            <img
              src={meal.image}
              alt={meal.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                // Fallback to cartoon food placeholder if the real image fails
                e.target.style.display = "none";
                e.target.parentNode.classList.add(
                  "bg-gradient-to-br",
                  "from-neutral-800",
                  "to-neutral-900",
                  "flex",
                  "items-center",
                  "justify-center"
                );

                // Create and append SVG element for cartoon food
                const svgContainer = document.createElement("div");
                svgContainer.className = "p-8 flex items-center justify-center";
                svgContainer.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-32 h-32 text-primary">
            <path fill="currentColor" d="M0 192c0-35.3 28.7-64 64-64c.7 0 1.3 0 2 0c2.7-10.2 13.1-16 23.9-12.3C148.9 83.2 188.8 72 232 72c43.9 0 83.5 11 122.3 32.6c10.7 5.9 20.4-2.2 22-13.2c.2-.9 .4-1.7 .7-2.5C397.2 74.5 430.1 64 466 64c24.8 0 45 20.2 45 45c0 2.8-.3 5.6-.8 8.3C510.8 123.7 512 130.7 512 138c0 36.8-27.9 67-63.8 70.7c-10.9 32.1-29.7 60.7-55.2 84.2L452.7 352H442c-10.3 0-19.2 6.8-22 16.5l-4.2 14.6c-4.2 14.8-17.8 24.9-33.2 24.9H288c-11.1 0-22.1-2.6-32-7.5V472c0 17.1-10.9 32.4-27.2 38c-43.1 14.4-89.8 14.4-132.9 0C81.6 504.4 70.7 489.1 70.7 472V379c-28.3-21.7-48.7-53.8-55.4-90.7C6.2 282.5 0 273.4 0 262.8V192zm164.3 0H74c-.3 4.3-.4 8.7-.4 13.1c0 44.1 18.5 83.8 48.1 111.9l42.6 35.5V472c41.7 14.4 87.7 14.4 129.4 0V352.5l42.6-35.5c29.6-28.1 48.1-67.8 48.1-111.9c0-4.4-.2-8.8-.4-13.1H274.9c-4.2 40.1-38.1 71.5-79.3 71.5c-41.2 0-75-31.4-79.3-71.5z"/>
          </svg>`;
                e.target.parentNode.appendChild(svgContainer);
              }}
            />
          ) : (
            // No image provided, show cartoon food placeholder right away
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-32 h-32 text-primary"
              >
                <path
                  fill="currentColor"
                  d="M0 192c0-35.3 28.7-64 64-64c.7 0 1.3 0 2 0c2.7-10.2 13.1-16 23.9-12.3C148.9 83.2 188.8 72 232 72c43.9 0 83.5 11 122.3 32.6c10.7 5.9 20.4-2.2 22-13.2c.2-.9 .4-1.7 .7-2.5C397.2 74.5 430.1 64 466 64c24.8 0 45 20.2 45 45c0 2.8-.3 5.6-.8 8.3C510.8 123.7 512 130.7 512 138c0 36.8-27.9 67-63.8 70.7c-10.9 32.1-29.7 60.7-55.2 84.2L452.7 352H442c-10.3 0-19.2 6.8-22 16.5l-4.2 14.6c-4.2 14.8-17.8 24.9-33.2 24.9H288c-11.1 0-22.1-2.6-32-7.5V472c0 17.1-10.9 32.4-27.2 38c-43.1 14.4-89.8 14.4-132.9 0C81.6 504.4 70.7 489.1 70.7 472V379c-28.3-21.7-48.7-53.8-55.4-90.7C6.2 282.5 0 273.4 0 262.8V192zm164.3 0H74c-.3 4.3-.4 8.7-.4 13.1c0 44.1 18.5 83.8 48.1 111.9l42.6 35.5V472c41.7 14.4 87.7 14.4 129.4 0V352.5l42.6-35.5c29.6-28.1 48.1-67.8 48.1-111.9c0-4.4-.2-8.8-.4-13.1H274.9c-4.2 40.1-38.1 71.5-79.3 71.5c-41.2 0-75-31.4-79.3-71.5z"
                />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="p-6">
              <span className="inline-block px-2 py-1 bg-primary text-white text-xs rounded-full mb-2">
                {meal.category || "Meal"}
              </span>
              <h1 className="text-3xl font-bold text-white mb-1">
                {meal.name}
              </h1>
              <p className="text-neutral-300">{meal.description}</p>
              <div className="flex items-center mt-3">
                {meal.rating && (
                  <div className="flex items-center mr-4">
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white ml-1">{meal.rating}</span>
                    {meal.reviews && (
                      <span className="text-neutral-400 text-sm ml-1">
                        ({meal.reviews})
                      </span>
                    )}
                  </div>
                )}
                <div className="text-neutral-300 text-sm">
                  {meal.user
                    ? `By ${meal.user}`
                    : meal.userId
                    ? "User Recipe"
                    : "Featured Recipe"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          {meal.preparationTime && (
            <div className="flex items-center bg-neutral-800 rounded-lg px-4 py-2">
              <svg
                className="w-5 h-5 text-primary mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-xs text-neutral-400">Prep Time</p>
                <p className="text-sm text-white">
                  {typeof meal.preparationTime === "number"
                    ? `${meal.preparationTime} minutes`
                    : meal.preparationTime}
                </p>
              </div>
            </div>
          )}

          {meal.servings && (
            <div className="flex items-center bg-neutral-800 rounded-lg px-4 py-2">
              <svg
                className="w-5 h-5 text-primary mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <div>
                <p className="text-xs text-neutral-400">Servings</p>
                <p className="text-sm text-white">{meal.servings}</p>
              </div>
            </div>
          )}

          {meal.cookingTime && (
            <div className="flex items-center bg-neutral-800 rounded-lg px-4 py-2">
              <svg
                className="w-5 h-5 text-primary mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <div>
                <p className="text-xs text-neutral-400">Cook Time</p>
                <p className="text-sm text-white">
                  {typeof meal.cookingTime === "number"
                    ? `${meal.cookingTime} minutes`
                    : meal.cookingTime}
                </p>
              </div>
            </div>
          )}

          {meal.difficulty && (
            <div className="flex items-center bg-neutral-800 rounded-lg px-4 py-2">
              <svg
                className="w-5 h-5 text-primary mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div>
                <p className="text-xs text-neutral-400">Difficulty</p>
                <p className="text-sm text-white">{meal.difficulty}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-700 mb-6 overflow-x-auto">
        <button
          className={`pb-2 px-4 text-sm font-medium mr-4 transition-colors ${
            activeTab === "instructions"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("instructions")}
        >
          Instructions
        </button>
        <button
          className={`pb-2 px-4 text-sm font-medium mr-4 transition-colors ${
            activeTab === "ingredients"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("ingredients")}
        >
          Ingredients
        </button>
        <button
          className={`pb-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "nutrition"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("nutrition")}
        >
          Nutrition
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Instructions/Ingredients */}
        <div className="lg:col-span-2">
          {activeTab === "instructions" && meal.instructions && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Recipe Instructions
              </h2>
              {meal.instructions.length > 0 ? (
                <ol className="space-y-6">
                  {meal.instructions.map((step, index) => (
                    <motion.li
                      key={index}
                      className={`flex ${
                        visibleInstructions.includes(index)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: visibleInstructions.includes(index) ? 1 : 0,
                        y: visibleInstructions.includes(index) ? 0 : 20,
                      }}
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
              ) : (
                <div className="text-center py-8 bg-neutral-800 rounded-lg">
                  <p className="text-neutral-400">
                    No instructions available for this recipe.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "ingredients" && meal.ingredients && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Ingredients</h2>
              <div className="bg-neutral-800 p-6 rounded-xl">
                {meal.ingredients.length > 0 ? (
                  <ul className="divide-y divide-neutral-700">
                    {meal.ingredients.map((ingredient, index) => (
                      <motion.li
                        key={index}
                        className="py-3 flex justify-between items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <span className="text-white">{ingredient.name}</span>
                        <span className="text-neutral-400 font-medium">
                          {ingredient.quantity}{" "}
                          {ingredient.unit && ingredient.unit}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-400 text-center py-4">
                    No ingredients listed for this recipe.
                  </p>
                )}

                {/* {meal.ingredients.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-neutral-700">
                    <button className="bg-primary text-white w-full py-2 rounded-md hover:bg-primary-focus transition-colors">
                      Add All Ingredients to Shopping List
                    </button>
                  </div>
                )} */}
              </div>
            </motion.div>
          )}

          {activeTab === "nutrition" && meal.macros && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Nutrition Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-800 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Macronutrient Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-700/50 rounded-lg">
                      <p className="text-xs text-neutral-400 mb-1">Calories</p>
                      <p className="text-lg font-bold text-white">
                        {meal.macros.calories || 0} kcal
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-700/50 rounded-lg">
                      <p className="text-xs text-neutral-400 mb-1">Protein</p>
                      <p className="text-lg font-bold text-blue-400">
                        {meal.macros.protein || 0}g
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-700/50 rounded-lg">
                      <p className="text-xs text-neutral-400 mb-1">Carbs</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {meal.macros.carbs || 0}g
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-700/50 rounded-lg">
                      <p className="text-xs text-neutral-400 mb-1">Fat</p>
                      <p className="text-lg font-bold text-red-400">
                        {meal.macros.fat || 0}g
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Caloric Distribution
                  </h3>
                  <div className="h-48">
                    <Pie data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-neutral-800 p-6 rounded-xl">
                <h3 className="text-lg font-medium text-white mb-4">
                  Macro Impact
                </h3>
                <p className="text-neutral-400 mb-4">
                  How this meal affects your daily nutrition targets:
                </p>

                <div className="space-y-4">
                  {Object.entries(meal.macros).map(([key, value]) => {
                    if (key === "id") return null; // Skip if it's the id field

                    // Calculate percentage of daily values (using generic values)
                    const dailyValues = {
                      calories: 2000,
                      protein: 50,
                      carbs: 300,
                      fat: 70,
                    };

                    const percentage = Math.round(
                      ((value || 0) / (dailyValues[key] || 1)) * 100
                    );

                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-white">{key}</span>
                          <span className="text-neutral-400">
                            {percentage}% of daily value
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              key === "calories"
                                ? "bg-green-500"
                                : key === "protein"
                                ? "bg-blue-500"
                                : key === "carbs"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            initial={{ width: "0%" }}
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
            <h2 className="text-lg font-bold text-white mb-4">
              Add To Your Plan
            </h2>
            {/* Only show Edit button if user owns this meal */}
            {user && (
              <>
                {/* For debugging - remove in production */}
                {console.log("User ID:", user.uid, "Meal Owner:", meal.userId)}

                {(meal.userId === user.uid || meal.createdBy === user.uid) && (
                  <>
                    <button
                      className="btn btn-info w-full flex items-center justify-center mt-2"
                      onClick={() => router.push(`/meal/${mealId}/edit`)}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Recipe
                    </button>

                    <button
                      className="btn bg-blue-800 hover:bg-blue-900 text-white w-full flex items-center justify-center mt-2"
                      onClick={handleDeleteRecipe}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                      ) : (
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                      {isDeleting ? "Deleting..." : "Delete Recipe"}
                    </button>
                  </>
                )}
              </>
            )}
            <div className="mt-4 flex flex-col space-y-2">
              <button
                className="btn btn-primary w-full flex items-center justify-center"
                onClick={handleAddToToday}
                disabled={addingToToday}
              >
                {addingToToday ? (
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
                {addingToToday ? "Adding..." : "Add to Today's Meals"}
              </button>
              <button
                className="btn btn-outline btn-primary w-full flex items-center justify-center"
                onClick={handleAddToPlan}
                disabled={addingToPlan}
              >
                {addingToPlan ? (
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Schedule for Later</span>
                  </>
                )}
              </button>
            </div>

            {/* Status message */}
            {statusMessage && (
              <div
                className={`mt-4 px-3 py-2 rounded-md text-sm ${
                  statusMessage.type === "success"
                    ? "bg-green-900/30 text-green-200"
                    : "bg-red-900/30 text-red-200"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <svg
                    className="w-5 h-5 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {statusMessage.text}
              </div>
            )}
          </motion.div>

          {/* Recipe Tags */}
          {meal.tags && meal.tags.length > 0 && (
            <motion.div
              className="bg-neutral-800 rounded-xl p-6 mt-6"
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              variants={fadeIn}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-lg font-bold text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {meal.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-neutral-700 text-neutral-300 px-2 py-1 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <DatePickerModal
            isOpen={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onSelectDate={handleDateSelected}
            title="Add to Meal Plan"
          />
        </div>
      </div>
    </div>
  );
};

export default MealDetails;
