import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Log a meal for a user
 * @param {string} userId - User ID
 * @param {Object} mealData - Meal data to log
 * @returns {Promise<Object>} - Created meal log
 */
export const logMeal = async (userId, mealData) => {
  try {
    const mealLogRef = await addDoc(collection(db, "mealLogs"), {
      userId,
      ...mealData,
      timestamp: serverTimestamp(),
      date: mealData.date || new Date().toISOString().split('T')[0]
    });
    
    // Return the created meal log
    const newMealLog = await mealLogRef.get();
    return { id: newMealLog.id, ...newMealLog.data() };
  } catch (error) {
    console.error("Error logging meal:", error);
    throw error;
  }
};

/**
 * Get all meal logs for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - User's meal logs
 */
export const getUserMealLogs = async (userId) => {
  try {
    const mealLogsQuery = query(
      collection(db, "mealLogs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(mealLogsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting user meal logs:", error);
    throw error;
  }
};

/**
 * Get meal logs for a specific date range
 * @param {string} userId - User ID
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Array>} - Meal logs in date range
 */
export const getMealLogsByDateRange = async (userId, startDate, endDate) => {
  try {
    // Convert dates to Firestore timestamp
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day
    
    const mealLogsQuery = query(
      collection(db, "mealLogs"),
      where("userId", "==", userId),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc"),
      orderBy("timestamp", "asc")
    );
    
    const querySnapshot = await getDocs(mealLogsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting meal logs by date range:", error);
    throw error;
  }
};

/**
 * Calculate nutrition totals by date
 * @param {string} userId - User ID
 * @param {string} date - Date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Object>} - Nutrition totals for the day
 */
export const getNutritionTotals = async (userId, date) => {
  try {
    const mealLogs = await getMealLogsByDateRange(userId, date, date);
    
    // Calculate totals
    const totals = mealLogs.reduce((acc, meal) => {
      const nutrition = meal.nutrition || {};
      
      acc.calories += nutrition.calories || 0;
      acc.protein += nutrition.protein || 0;
      acc.carbs += nutrition.carbs || 0;
      acc.fat += nutrition.fat || 0;
      
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return totals;
  } catch (error) {
    console.error("Error calculating nutrition totals:", error);
    throw error;
  }
};

/**
 * Delete a meal log
 * @param {string} logId - Meal log ID
 * @returns {Promise<void>}
 */
export const deleteMealLog = async (logId) => {
  try {
    await deleteDoc(doc(db, "mealLogs", logId));
  } catch (error) {
    console.error("Error deleting meal log:", error);
    throw error;
  }
};

/**
 * Update a meal log
 * @param {string} logId - Meal log ID
 * @param {Object} mealData - Updated meal data
 * @returns {Promise<void>}
 */
export const updateMealLog = async (logId, mealData) => {
  try {
    const mealLogRef = doc(db, "mealLogs", logId);
    await updateDoc(mealLogRef, {
      ...mealData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating meal log:", error);
    throw error;
  }
};

/**
 * Get weekly nutrition summary
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Weekly nutrition data
 */
export const getWeeklyNutritionSummary = async (userId) => {
  try {
    // Calculate date for 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // Get 7 days including today
    
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    const mealLogs = await getMealLogsByDateRange(userId, startDate, endDate);
    
    // Group by date and calculate totals
    const dailyTotals = {};
    
    // Initialize all days in range with zeros
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyTotals[dateStr] = { 
        date: dateStr,
        calories: 0, 
        protein: 0, 
        carbs: 0, 
        fat: 0 
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fill with actual data
    mealLogs.forEach(meal => {
      const mealDate = meal.date;
      const nutrition = meal.nutrition || {};
      
      if (dailyTotals[mealDate]) {
        dailyTotals[mealDate].calories += nutrition.calories || 0;
        dailyTotals[mealDate].protein += nutrition.protein || 0;
        dailyTotals[mealDate].carbs += nutrition.carbs || 0;
        dailyTotals[mealDate].fat += nutrition.fat || 0;
      }
    });
    
    // Convert to array and sort by date
    const sortedDailyTotals = Object.values(dailyTotals)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      days: sortedDailyTotals.map(day => day.date),
      calories: sortedDailyTotals.map(day => day.calories),
      protein: sortedDailyTotals.map(day => day.protein),
      carbs: sortedDailyTotals.map(day => day.carbs),
      fat: sortedDailyTotals.map(day => day.fat)
    };
  } catch (error) {
    console.error("Error getting weekly nutrition summary:", error);
    throw error;
  }
};