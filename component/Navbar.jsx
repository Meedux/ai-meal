"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // In a real app, this would come from an auth context or provider
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle auth for demo purposes
  const toggleAuth = () => {
    setIsAuthenticated(!isAuthenticated);
  };

  return (
    <>
      <header className="flex justify-between items-center w-full p-4 bg-neutral-800 text-white z-10">
        <div className="text-xl font-bold">AI MEAL PLANNER</div>
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
        className="fixed inset-0 z-50 flex bg-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Solid sidebar */}
        <div className="w-64 bg-neutral shadow-2xl shadow-black/50 text-white h-full flex flex-col relative z-20">
          <div className="p-4 flex justify-between items-center border-b border-neutral-700">
            <span className="font-bold">Menu</span>
            <button
              type="button"
              className="p-2 rounded-md bg-neutral-700 hover:bg-neutral-600 focus:outline-none"
              onClick={toggleSidebar}
            >
              <svg
                className="w-5 h-5"
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
          </div>

          {/* User section - show different content based on auth state */}
          <div className="p-4 border-b border-neutral-700">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-xs text-neutral-400">
                    john.doe@example.com
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">
                  Sign in to save and track your meals
                </p>
                <div className="flex space-x-2">
                  <Link
                    href="/"
                    className="flex-1 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-center text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary-focus rounded text-center text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-4 flex-1 overflow-y-auto">
            {/* Authenticated-only menu items */}
            {isAuthenticated && (
              <>
                <div className="text-xs uppercase text-neutral-500 font-semibold tracking-wider mb-2">
                  Main
                </div>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/trending"
                      className="flex items-center p-2 rounded-md hover:bg-neutral-700"
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Trending
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/meal"
                      className="flex items-center p-2 rounded-md hover:bg-neutral-700"
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Meals
                    </Link>
                  </li>
                </ul>
                <div className="text-xs uppercase text-neutral-500 font-semibold tracking-wider mt-6 mb-2">
                  Personal
                </div>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/me"
                      className="flex items-center p-2 rounded-md hover:bg-neutral-700"
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/options"
                      className="flex items-center p-2 rounded-md hover:bg-neutral-700"
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </Link>
                  </li>
                </ul>
              </>
            )}
          </nav>

          {/* Footer section with auth toggle (for demo only) and logout */}
          <div className="p-4 border-t border-neutral-700">
            {/* Toggle for demo purposes */}
            <button
              onClick={toggleAuth}
              className="w-full mb-2 text-sm py-1.5 px-3 bg-neutral-700 hover:bg-neutral-600 rounded text-white"
            >
              {isAuthenticated
                ? "Demo: Switch to Unauthenticated"
                : "Demo: Switch to Authenticated"}
            </button>

            {isAuthenticated && (
              <Link
                href="/logout"
                className="flex items-center p-2 rounded-md hover:bg-neutral-700 text-red-400"
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
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </Link>
            )}
          </div>
        </div>

        {/* Overlay - stays semi-transparent */}
        <div
          className="flex-1 bg-black bg-opacity-50 absolute inset-0 z-10"
          onClick={toggleSidebar}
        ></div>
      </motion.div>
    </>
  );
};

export default Navbar;
