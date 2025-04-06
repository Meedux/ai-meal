"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/navigation';

const MealCalendarModal = ({ isOpen, onClose, userId }) => {
  const [date, setDate] = useState(new Date());
  const [datesWithMeals, setDatesWithMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateMeals, setSelectedDateMeals] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen || !userId) return;
    
    // Fetch all dates that have planned meals
    const fetchDatesWithMeals = async () => {
      setLoading(true);
      try {
        const mealPlanRef = collection(db, 'users', userId, 'mealPlan');
        const mealsSnapshot = await getDocs(mealPlanRef);
        
        // Extract unique dates
        const dates = new Set();
        mealsSnapshot.docs.forEach(doc => {
          const mealData = doc.data();
          if (mealData.date) {
            dates.add(mealData.date);
          }
        });
        
        setDatesWithMeals(Array.from(dates).map(dateStr => new Date(dateStr)));
      } catch (error) {
        console.error("Error fetching meal plan dates:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDatesWithMeals();
  }, [isOpen, userId]);

  // Fetch meals for selected date
  useEffect(() => {
    if (!date || !userId) return;
    
    const fetchMealsForDate = async () => {
      try {
        const dateStr = date.toISOString().split('T')[0];
        const mealPlanRef = collection(db, 'users', userId, 'mealPlan');
        const dateQuery = query(mealPlanRef, where('date', '==', dateStr));
        const mealsSnapshot = await getDocs(dateQuery);
        
        const meals = mealsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setSelectedDateMeals(meals);
      } catch (error) {
        console.error("Error fetching meals for date:", error);
        setSelectedDateMeals([]);
      }
    };
    
    fetchMealsForDate();
  }, [date, userId]);

  // Check if a date has meals planned
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const hasPlannedMeals = datesWithMeals.some(d => 
        d.toISOString().split('T')[0] === dateStr
      );
      
      return hasPlannedMeals ? 'has-meals' : null;
    }
  };

  const handleDateChange = (value) => {
    setDate(value);
  };

  const handleViewMeal = (mealId) => {
    onClose();
    router.push(`/meal/${mealId}`);
  };

  const handleViewAllPlans = () => {
    onClose();
    router.push('/meal/plan');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Meal Planner</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row h-full">
          {/* Calendar Column */}
          <div className="p-4 md:w-1/2">
            <div className="calendar-container">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
              ) : (
                <Calendar 
                  onChange={handleDateChange}
                  value={date}
                  tileClassName={tileClassName}
                  className="bg-neutral-800 text-white border-neutral-700 rounded-lg"
                />
              )}
            </div>
          </div>
          
          {/* Selected Date Details Column */}
          <div className="p-4 md:w-1/2 border-t md:border-t-0 md:border-l border-neutral-800 max-h-[50vh] md:max-h-[70vh] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white">
                {date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric'
                })}
              </h3>
            </div>
            
            {selectedDateMeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-400 mb-4">No meals planned for this day.</p>
                <a href="/meal" className="btn btn-sm btn-primary">Browse Meals</a>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateMeals.map((meal) => (
                  <div key={meal.id} className="bg-neutral-800/60 rounded-lg overflow-hidden">
                    <div className="flex">
                      {meal.image ? (
                        <img 
                          src={meal.image} 
                          alt={meal.recipeName} 
                          className="w-20 h-20 object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/80?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-neutral-700 flex items-center justify-center">
                          <span className="text-neutral-500 text-xs">No Image</span>
                        </div>
                      )}
                      
                      <div className="p-3 flex-grow">
                        <h4 className="text-white font-medium">{meal.recipeName}</h4>
                        {meal.macros && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs bg-green-900/30 text-green-300 px-1.5 py-0.5 rounded">
                              {meal.macros.calories} kcal
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleViewMeal(meal.mealId)}
                        className="p-3 text-primary hover:bg-neutral-700/30 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-800 flex justify-between">
          <button 
            onClick={handleViewAllPlans}
            className="btn btn-outline btn-primary"
          >
            View All Meal Plans
          </button>
          
          <button 
            onClick={onClose}
            className="btn btn-ghost"
          >
            Close
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .has-meals {
          background-color: rgba(124, 58, 237, 0.25) !important;
          color: white !important;
          font-weight: bold;
        }
        
        :global(.react-calendar) {
          background-color: #1f2937;
          border-color: #374151;
          color: white;
          border-radius: 0.5rem;
          width: 100%;
        }
        
        :global(.react-calendar__tile) {
          color: #e5e7eb;
          padding: 0.75rem 0.5rem;
        }
        
        :global(.react-calendar__tile:enabled:hover) {
          background-color: #374151;
        }
        
        :global(.react-calendar__tile--now) {
          background-color: rgba(124, 58, 237, 0.1);
        }
        
        :global(.react-calendar__tile--active) {
          background-color: rgba(124, 58, 237, 0.8) !important;
        }
        
        :global(.react-calendar__navigation button:enabled:hover) {
          background-color: #374151;
        }
        
        :global(.react-calendar__navigation button) {
          color: white;
        }
        
        :global(.react-calendar__month-view__weekdays__weekday) {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default MealCalendarModal;