"use client";

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const DatePickerModal = ({ isOpen, onClose, onSelectDate, title = "Select Date" }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!isOpen) return null;

  const handleDateSelect = () => {
    // Format the date as YYYY-MM-DD
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onSelectDate(formattedDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-xl max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="calendar-container">
            <Calendar 
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date()}
            />
          </div>
          
          <div className="mt-4">
            <p className="text-neutral-300 mb-2">
              Selected date: <span className="font-medium text-white">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-800 flex justify-end space-x-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          
          <button 
            onClick={handleDateSelect}
            className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
      
      <style jsx global>{`
        /* Calendar container */
        .react-calendar {
          width: 100%;
          background-color: #1f1f1f;
          color: #e5e5e5;
          border: 1px solid #333;
          border-radius: 8px;
          font-family: inherit;
          line-height: 1.125em;
        }

        /* Navigation section */
        .react-calendar__navigation {
          display: flex;
          height: 44px;
          margin-bottom: 8px;
        }

        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          color: #e5e5e5;
          font-size: 16px;
        }

        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #333;
          border-radius: 4px;
        }

        .react-calendar__navigation button[disabled] {
          color: #666;
        }

        /* Month view weekdays */
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.8em;
          padding: 4px 0;
        }

        .react-calendar__month-view__weekdays__weekday {
          padding: 8px;
          color: #888;
        }

        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }

        /* Day tiles */
        .react-calendar__tile {
          max-width: 100%;
          padding: 12px 6px;
          background: none;
          text-align: center;
          line-height: 16px;
          color: #e5e5e5;
          border-radius: 4px;
        }

        .react-calendar__month-view__days__day--weekend {
          color: #ff8080;
        }

        .react-calendar__month-view__days__day--neighboringMonth {
          color: #666;
        }

        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #333;
        }

        .react-calendar__tile--now {
          background: rgba(125, 39, 255, 0.15);
          color: #fff;
        }

        .react-calendar__tile--now:enabled:hover,
        .react-calendar__tile--now:enabled:focus {
          background: rgba(125, 39, 255, 0.25);
        }

        .react-calendar__tile--active {
          background: rgba(125, 39, 255, 0.75);
          color: white;
        }

        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background: rgba(125, 39, 255, 0.85);
        }

        .react-calendar--selectRange .react-calendar__tile--hover {
          background-color: #333;
        }

        /* Disabled days */
        .react-calendar__tile:disabled {
          background-color: transparent;
          color: #666;
        }

        /* Year/decade/century view */
        .react-calendar__year-view .react-calendar__tile,
        .react-calendar__decade-view .react-calendar__tile,
        .react-calendar__century-view .react-calendar__tile {
          padding: 1.5em 0.5em;
        }
      `}</style>
    </div>
  );
};

export default DatePickerModal;