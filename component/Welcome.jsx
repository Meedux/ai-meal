"use client";

import React from "react";

const Welcome = () => {
  const today = new Date()?.toLocaleDateString();
  const calorieIntake = 1200; // Example value
  const calorieGoal = 2000; // Example value
  const proteinIntake = 50; // Example value
  const proteinGoal = 100; // Example value

  const caloriePercentage = (calorieIntake / calorieGoal) * 100;
  const proteinPercentage = (proteinIntake / proteinGoal) * 100;

  return (
    <div className="p-6 bg-neutral-900 text-neutral-400 rounded-lg shadow-md">
      <p className="mb-6 text-lg font-semibold text-center text-white">Today's Date: {today}</p>
      <div className="flex flex-col md:flex-row items-center justify-evenly space-y-6 md:space-y-0 md:space-x-6">
        <div className="w-1/2 md:w-1/4">
          <div className="radial-progress text-primary" style={{ "--value": caloriePercentage }}>
            {Math.round(caloriePercentage)}%
          </div>
          <p className="text-center mt-4 text-sm text-white">Remaining Calorie Intake</p>
        </div>
        <div className="w-1/2 md:w-1/4">
          <p className="text-center mb-2 text-sm text-white">Remaining Protein Intake</p>
          <div className="w-full bg-neutral-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${proteinPercentage}%` }}
            ></div>
          </div>
          <p className="text-center mt-2 text-sm text-white">
            {proteinIntake}g / {proteinGoal}g
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;