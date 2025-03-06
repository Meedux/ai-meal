"use client";

import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Welcome = () => {
  const today = new Date()?.toLocaleDateString();
  const calorieIntake = 1200; // Example value
  const calorieGoal = 2000; // Example value
  const proteinIntake = 50; // Example value
  const proteinGoal = 100; // Example value

  const caloriePercentage = (calorieIntake / calorieGoal) * 100;
  const proteinPercentage = (proteinIntake / proteinGoal) * 100;

  return (
    <div className="p-4 bg-neutral-900 text-neutral-400 rounded-lg shadow-md">
      <p className="mb-4">Today's Date: {today}</p>
      <div className="flex items-center justify-evenly space-x-4">
        <div className="w-1/4">
          <div
            className="radial-progress text-white"
            style={{ "--value": 70 } /* as React.CSSProperties */}
            aria-valuenow={70}
            role="progressbar"
          >
            70%
          </div>
          <p className="text-center mt-2 text-sm">Remaining Calorie Intake</p>
        </div>
        <div className="w-1/4">
          <div className="mb-2">
            <p className="text-sm">Remaining Protein Intake</p>
            <div className="w-full bg-neutral-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${proteinPercentage}%` }}
              ></div>
            </div>
            <p className="text-right mt-1 text-sm">
              {proteinIntake}g / {proteinGoal}g
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
