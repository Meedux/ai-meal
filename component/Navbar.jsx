"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className="flex justify-between items-center w-full p-4 bg-neutral-800 text-white z-0">
        <div className="text-xl font-bold">Brand</div>
        <button
          type="button"
          className="p-2 rounded-md bg-neutral-700 hover:bg-neutral-600 focus:outline-none"
          onClick={toggleSidebar}
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </header>

      <motion.div
        className="fixed inset-0 z-50 flex"
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="w-64 bg-neutral-800 text-white h-full p-4">
          <button
            type="button"
            className="p-2 rounded-md bg-neutral-700 hover:bg-neutral-600 focus:outline-none mb-4"
            onClick={toggleSidebar}
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="#" className="block p-2 rounded-md hover:bg-neutral-700">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 rounded-md hover:bg-neutral-700">
                  Profile
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 rounded-md hover:bg-neutral-700">
                  Settings
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 rounded-md hover:bg-neutral-700">
                  Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div
          className="flex-1 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        ></div>
      </motion.div>
    </>
  );
};

export default Navbar;