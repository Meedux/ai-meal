"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

// For charts
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateDoc } from "firebase/firestore";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [weeklyMacros, setWeeklyMacros] = useState({
    dates: [],
    calories: [],
    protein: [],
    carbs: [],
    fat: [],
  });
  const [todayMacros, setTodayMacros] = useState({
    calories: { current: 0, goal: 2000 },
    protein: { current: 0, goal: 150 },
    carbs: { current: 0, goal: 200 },
    fat: { current: 0, goal: 70 },
  });
  const [calendarView, setCalendarView] = useState(new Date());
  const [scheduledMeals, setScheduledMeals] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedDateMeals, setSelectedDateMeals] = useState([]);

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
        router.push("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    try {
      // Show loading state
      setLoading(true);

      // Create a reference to the storage location
      const storage = getStorage();
      const fileRef = ref(storage, `profile-pictures/${user.uid}`);

      // Upload the image
      await uploadBytes(fileRef, file);
      console.log("Upload successful");

      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef);

      // Update the user document in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        image: downloadURL,
        updatedAt: new Date(), // Add timestamp for the update
      });

      // Update local state
      setUserData({
        ...userData,
        image: downloadURL,
      });

      // Show success message
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile data
  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));

      if (userDoc.exists()) {
        const data = userDoc.data();

        // Use a default placeholder image if none exists
        const defaultProfileImage =
          "https://api.dicebear.com/7.x/initials/svg?seed=" +
          encodeURIComponent(data.name || "User") +
          "&backgroundColor=0369a1";

        setUserData({
          name: data.name || "User",
          email: auth.currentUser?.email || "",
          image: data.image || defaultProfileImage,
          target_macros: data.target_macros || {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 70,
          },
          preferences: data.preferences || {
            diet: "none",
            allergies: [],
            cuisines: [],
            additional: [],
          },
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (user && activeTab === "schedule") {
      fetchScheduledMeals();
    }
  }, [user, activeTab]);

  // Add this function to fetch scheduled meals
  const fetchScheduledMeals = async () => {
    if (!user) return;

    try {
      setLoadingSchedule(true);
      const mealPlanRef = collection(db, "users", user.uid, "mealPlan");
      const mealSnapshot = await getDocs(mealPlanRef);

      const meals = {};
      mealSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date) {
          if (!meals[data.date]) {
            meals[data.date] = [];
          }
          meals[data.date].push({
            id: doc.id,
            mealId: data.mealId,
            name: data.recipeName,
            image: data.image || null,
            macros: data.macros || null,
            addedAt: data.addedAt,
          });
        }
      });

      setScheduledMeals(meals);

      // Update selected date meals
      if (selectedDate && meals[selectedDate]) {
        setSelectedDateMeals(meals[selectedDate]);
      } else {
        setSelectedDateMeals([]);
      }
    } catch (error) {
      console.error("Error fetching scheduled meals:", error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleDateChange = (date) => {
    setCalendarView(date);
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedDate(formattedDate);

    if (scheduledMeals[formattedDate]) {
      setSelectedDateMeals(scheduledMeals[formattedDate]);
    } else {
      setSelectedDateMeals([]);
    }
  };

  // Add this function to check if a date has meals
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      return scheduledMeals[dateStr] && scheduledMeals[dateStr].length > 0
        ? "has-meals"
        : null;
    }
  };

  // Add this function to navigate to meal details
  const handleViewMeal = (mealId) => {
    router.push(`/meal/${mealId}`);
  };

  // Fetch today's macros
  const fetchTodayMacros = async (userId) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const takenMacrosDoc = await getDoc(
        doc(db, "users", userId, "taken_macros", today)
      );

      if (takenMacrosDoc.exists()) {
        const data = takenMacrosDoc.data();
        const currentMacros = data.total || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };

        // Get user's target macros
        const userDoc = await getDoc(doc(db, "users", userId));
        const targetMacros = userDoc.exists()
          ? userDoc.data().target_macros || {
              calories: 2000,
              protein: 150,
              carbs: 200,
              fat: 70,
            }
          : { calories: 2000, protein: 150, carbs: 200, fat: 70 };

        setTodayMacros({
          calories: {
            current: currentMacros.calories,
            goal: targetMacros.calories,
          },
          protein: {
            current: currentMacros.protein,
            goal: targetMacros.protein,
          },
          carbs: { current: currentMacros.carbs, goal: targetMacros.carbs },
          fat: { current: currentMacros.fat, goal: targetMacros.fat },
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
        dates.push(date.toISOString().split("T")[0]);
      }

      // Format dates for display on the chart (e.g., "Mon", "Tue", etc.)
      const displayDates = dates.map((date) => {
        const day = new Date(date).toLocaleDateString("en-US", {
          weekday: "short",
        });
        return day;
      });

      // Initialize arrays for macro values
      const caloriesData = Array(7).fill(0);
      const proteinData = Array(7).fill(0);
      const carbsData = Array(7).fill(0);
      const fatData = Array(7).fill(0);

      // Fetch data for each date
      for (let i = 0; i < dates.length; i++) {
        const macrosDoc = await getDoc(
          doc(db, "users", userId, "taken_macros", dates[i])
        );

        if (macrosDoc.exists()) {
          const data = macrosDoc.data();
          const total = data.total || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
          };

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
        fat: fatData,
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
        label: "Calories",
        data: weeklyMacros.calories,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
      },
      {
        label: "Protein (g)",
        data: weeklyMacros.protein,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.3,
      },
      {
        label: "Carbs (g)",
        data: weeklyMacros.carbs,
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        tension: 0.3,
      },
      {
        label: "Fat (g)",
        data: weeklyMacros.fat,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
              onError={(e) => {
                // If image fails to load, use initials-based placeholder
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  userData?.name || "User"
                )}&backgroundColor=0369a1`;
              }}
            />
            <label
              htmlFor="profile-upload"
              className="absolute bottom-0 right-0 bg-primary rounded-full w-6 h-6 flex items-center justify-center border-2 border-neutral-800 cursor-pointer"
            >
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {userData?.name}
                </h1>
                <p className="text-neutral-400 text-sm">{userData?.email}</p>
              </div>

              <Link href="/options" className="btn btn-sm btn-outline">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-700 mb-8">
        <button
          className={`pb-2 px-4 font-medium mr-4 transition-colors ${
            activeTab === "overview"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "macros"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("macros")}
        >
          Macro Tracking
        </button>
        <button
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "schedule"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("schedule")}
        >
          Meal Calendar
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Today's Summary */}
            <motion.div
              variants={itemVariants}
              className="bg-neutral-800 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-lg font-medium text-white mb-4">
                Today's Summary
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Calories</span>
                    <span className="text-white">
                      {todayMacros.calories.current} /{" "}
                      {todayMacros.calories.goal} kcal
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          todayMacros.calories.current,
                          todayMacros.calories.goal
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Protein</span>
                    <span className="text-white">
                      {todayMacros.protein.current}g /{" "}
                      {todayMacros.protein.goal}g
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          todayMacros.protein.current,
                          todayMacros.protein.goal
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Carbs</span>
                    <span className="text-white">
                      {todayMacros.carbs.current}g / {todayMacros.carbs.goal}g
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          todayMacros.carbs.current,
                          todayMacros.carbs.goal
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Fat</span>
                    <span className="text-white">
                      {todayMacros.fat.current}g / {todayMacros.fat.goal}g
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          todayMacros.fat.current,
                          todayMacros.fat.goal
                        )}%`,
                      }}
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

            <motion.div
              variants={itemVariants}
              className="bg-neutral-800 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-lg font-medium text-white mb-4">
                Dietary Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  <span className="text-white capitalize">
                    Diet: {userData?.preferences?.diet || "None"}
                  </span>
                </div>

                {userData?.preferences?.allergies &&
                userData.preferences.allergies.length > 0 ? (
                  <div>
                    <p className="text-neutral-400 mb-2">Allergies:</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.preferences.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-neutral-700 rounded-md text-white text-xs"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-400">No allergies specified</p>
                )}

                {userData?.preferences?.cuisines &&
                userData.preferences.cuisines.length > 0 ? (
                  <div>
                    <p className="text-neutral-400 mb-2">Favorite Cuisines:</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.preferences.cuisines.map((cuisine, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-neutral-700 rounded-md text-white text-xs"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-400">No preferred cuisines</p>
                )}

                {userData?.preferences?.additional &&
                userData.preferences.additional.length > 0 ? (
                  <div>
                    <p className="text-neutral-400 mb-2">
                      Additional Preferences:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {userData.preferences.additional.map((pref, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-neutral-700 rounded-md text-white text-xs"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-400">No additional preferences</p>
                )}
              </div>

              <div className="mt-6">
                <Link
                  href="/options#preferences"
                  className="btn btn-outline btn-primary w-full"
                >
                  Edit Preferences
                </Link>
              </div>
            </motion.div>

            {/* Weekly Progress */}
            <motion.div
              variants={itemVariants}
              className="bg-neutral-800 rounded-xl p-6 shadow-lg md:col-span-2"
            >
              <h2 className="text-lg font-medium text-white mb-4">
                Weekly Nutrition Trends
              </h2>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Macro Tracking Tab */}
        {activeTab === "macros" && (
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
              <h2 className="text-lg font-medium text-white mb-4">
                Weekly Nutrition Trends
              </h2>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </motion.div>

            {/* Today's Macros */}
            <motion.div
              className="bg-neutral-800 rounded-xl p-6 shadow-lg"
              variants={itemVariants}
            >
              <h2 className="text-lg font-medium text-white mb-4">
                Today's Macros
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Calories</span>
                    <span className="text-white">
                      {todayMacros.calories.current} /{" "}
                      {todayMacros.calories.goal} kcal
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          todayMacros.calories.current,
                          todayMacros.calories.goal
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Protein</span>
                    <span className="text-white">
                      {todayMacros.protein.current}g /{" "}
                      {todayMacros.protein.goal}g
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          todayMacros.protein.current,
                          todayMacros.protein.goal
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Carbs</span>
                    <span className="text-white">
                      {todayMacros.carbs.current}g / {todayMacros.carbs.goal}g
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          todayMacros.carbs.current,
                          todayMacros.carbs.goal
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Fat</span>
                    <span className="text-white">
                      {todayMacros.fat.current}g / {todayMacros.fat.goal}g
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          todayMacros.fat.current,
                          todayMacros.fat.goal
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <Link
                href="/meal"
                className="w-full mt-6 py-2 text-sm bg-primary hover:bg-primary-focus text-white rounded-md transition-colors block text-center"
              >
                Add Food
              </Link>
            </motion.div>

            {/* Today's Meal Summary */}
            <motion.div
              className="bg-neutral-800 rounded-xl p-6 shadow-lg"
              variants={itemVariants}
            >
              <h2 className="text-lg font-medium text-white mb-4">
                Nutrition Breakdown
              </h2>

              {/* Macronutrient Distribution */}
              <div className="mt-4 p-4 bg-neutral-700/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">
                    Macro Distribution
                  </span>
                </div>
                <div className="w-full h-5 bg-neutral-600 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-500 h-full flex items-center justify-center text-xs text-white"
                    style={{
                      width: `${calculatePercentage(
                        todayMacros.protein.current * 4,
                        todayMacros.calories.current
                      )}%`,
                    }}
                  >
                    {calculatePercentage(
                      todayMacros.protein.current * 4,
                      todayMacros.calories.current
                    )}
                    %
                  </div>
                  <div
                    className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white"
                    style={{
                      width: `${calculatePercentage(
                        todayMacros.carbs.current * 4,
                        todayMacros.calories.current
                      )}%`,
                    }}
                  >
                    {calculatePercentage(
                      todayMacros.carbs.current * 4,
                      todayMacros.calories.current
                    )}
                    %
                  </div>
                  <div
                    className="bg-red-500 h-full flex items-center justify-center text-xs text-white"
                    style={{
                      width: `${calculatePercentage(
                        todayMacros.fat.current * 9,
                        todayMacros.calories.current
                      )}%`,
                    }}
                  >
                    {calculatePercentage(
                      todayMacros.fat.current * 9,
                      todayMacros.calories.current
                    )}
                    %
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
                <Link
                  href="/options"
                  className="btn btn-outline btn-primary w-full"
                >
                  Adjust Targets
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "schedule" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Calendar */}
            <motion.div
              variants={itemVariants}
              className="bg-neutral-800 rounded-xl p-6 shadow-lg lg:col-span-2"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white">Meal Schedule</h2>
                <div className="bg-neutral-700 rounded-full px-4 py-1">
                  <span className="text-sm text-white">
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="calendar-container mb-6">
                {loadingSchedule && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
                <Calendar
                  onChange={handleDateChange}
                  value={calendarView}
                  tileClassName={tileClassName}
                  className="meal-calendar"
                />
              </div>

              <style jsx global>{`
                .meal-calendar {
                  width: 100%;
                  border: none !important;
                  background-color: transparent !important;
                  color: white !important;
                }

                .react-calendar__tile {
                  color: #e5e5e5;
                  padding: 12px !important;
                }

                .react-calendar__month-view__days__day--weekend {
                  color: #ff8080;
                }

                .react-calendar__tile--active {
                  background: rgba(124, 58, 237, 0.8) !important;
                  color: white !important;
                }

                .react-calendar__tile--now {
                  background: rgba(124, 58, 237, 0.2) !important;
                }

                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                  background-color: rgba(124, 58, 237, 0.4) !important;
                }

                .react-calendar__tile.has-meals {
                  position: relative;
                }

                .react-calendar__tile.has-meals::after {
                  content: "";
                  position: absolute;
                  bottom: 4px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background-color: #10b981;
                }

                .react-calendar__navigation {
                  margin-bottom: 12px;
                }

                .react-calendar__navigation button {
                  color: white;
                  background: transparent !important;
                }

                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                  background-color: rgba(124, 58, 237, 0.2) !important;
                }

                .react-calendar__month-view__weekdays__weekday {
                  color: #9ca3af;
                }

                .react-calendar__month-view__weekdays__weekday abbr {
                  text-decoration: none;
                }
              `}</style>

              <div className="text-sm text-neutral-400 flex items-center mt-2">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary mr-2"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 relative">
                    <div className="absolute inset-0 bg-neutral-700 rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  </div>
                  <span>Planned Meals</span>
                </div>
              </div>
            </motion.div>

            {/* Selected Day Meals */}
            <motion.div
              variants={itemVariants}
              className="bg-neutral-800 rounded-xl p-6 shadow-lg"
            >
              <h2 className="font-bold text-white mb-4 flex items-center">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </h2>

              <div className="space-y-4 mt-6">
                <AnimatePresence mode="wait">
                  {selectedDateMeals.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {selectedDateMeals.map((meal, index) => (
                        <motion.div
                          key={meal.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex bg-neutral-700/40 rounded-lg overflow-hidden cursor-pointer hover:bg-neutral-700/60 transition-all"
                          onClick={() => handleViewMeal(meal.mealId)}
                        >
                          <div className="w-20 h-20 bg-neutral-700 flex-shrink-0">
                            {meal.image ? (
                              <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-8 h-8 text-neutral-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v1a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 11a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-3 flex-grow">
                            <h3 className="text-white font-medium line-clamp-1">
                              {meal.name}
                            </h3>
                            {meal.macros && (
                              <div className="flex items-center text-xs mt-1 space-x-2">
                                <span className="text-emerald-400">
                                  {meal.macros.calories || 0} kcal
                                </span>
                                <span className="text-neutral-500">•</span>
                                <span className="text-blue-400">
                                  {meal.macros.protein || 0}g protein
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center pr-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-neutral-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </motion.div>
                      ))}

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4"
                      >
                        <Link
                          href="/meal"
                          className="btn btn-outline btn-sm btn-primary w-full"
                        >
                          Add More Meals
                        </Link>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="h-48 flex flex-col items-center justify-center text-center"
                    >
                      <div className="bg-neutral-700/30 rounded-full p-3 mb-3">
                        <svg
                          className="w-6 h-6 text-neutral-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <p className="text-neutral-400 mb-2">
                        No meals planned for this day
                      </p>
                      <Link
                        href="/meal"
                        className="text-primary text-sm hover:underline"
                      >
                        Browse meals to add
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Calendar Stats */}
            <motion.div
              variants={itemVariants}
              className="bg-neutral-800 rounded-xl p-6 shadow-lg lg:col-span-3"
            >
              <h2 className="text-lg font-bold text-white mb-4">
                Monthly Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-700/40 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-400 text-sm">Planned Meals</p>
                      <p className="text-xl font-bold text-white">
                        {Object.values(scheduledMeals).reduce(
                          (total, meals) => total + meals.length,
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-700/40 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <svg
                        className="w-6 h-6 text-purple-500"
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
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-400 text-sm">Days Planned</p>
                      <p className="text-xl font-bold text-white">
                        {Object.keys(scheduledMeals).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-700/40 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                      <svg
                        className="w-6 h-6 text-emerald-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                        />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-400 text-sm">Avg. Meals/Day</p>
                      <p className="text-xl font-bold text-white">
                        {Object.keys(scheduledMeals).length > 0
                          ? (
                              Object.values(scheduledMeals).reduce(
                                (total, meals) => total + meals.length,
                                0
                              ) / Object.keys(scheduledMeals).length
                            ).toFixed(1)
                          : "0.0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
