"use client";

import React, { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const [isloggedin, setIsloggedin] = useState(false);

  const toggleSidebar = () => {
    const sidebar = document.getElementById("hs-sidebar-offcanvas");
    sidebar.classList.toggle("hidden");
    sidebar.classList.toggle("translate-x-0");
  };

  return (
    <>
      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full text-sm py- bg-neutral-800">
        <nav className="max-w-[85rem] w-full mx-auto flex flex-wrap basis-full items-center justify-between">
          <div className="sm:order-1 flex items-center gap-x-2">
            <button
              type="button"
              className="py-2 px-3 m-5 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border shadow-sm disabled:opacity-50 disabled:pointer-events-none bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 focus:bg-neutral-700"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="hs-sidebar-offcanvas"
              aria-label="Toggle navigation"
              onClick={toggleSidebar}
            >
              <svg
                className={`shrink-0 size-4 block`}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <div
        id="hs-sidebar-offcanvas"
        className="hs-overlay [--auto-close:lg] w-64 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full hidden fixed top-0 start-0 bottom-0 z-[60] border-e bg-neutral-800 border-neutral-700"
        role="dialog"
        tabIndex="-1"
        aria-label="Sidebar"
      >
        <div className="relative flex flex-col h-full max-h-full">
          <header className="p-4 flex justify-between items-center gap-x-2">
            <a
              className="flex-none font-semibold text-xl focus:outline-none focus:opacity-80 text-white"
              href="#"
              aria-label="Brand"
            >
              Brand
            </a>

            <div className="-me-2">
              <button
                type="button"
                className="flex justify-center items-center gap-x-3 size-6 bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                onClick={toggleSidebar}
              >
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span className="sr-only">Close</span>
              </button>
            </div>
          </header>

          <nav className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div
              className="hs-accordion-group pb-0 px-2 w-full flex flex-col flex-wrap"
              data-hs-accordion-always-open
            >
              <ul className="space-y-1">
                {isloggedin ? (
                  <>
                    <li>
                      <a
                        className="flex items-center gap-x-3 py-2 px-2.5 text-sm rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-neutral-300"
                        href="#"
                      >
                        <svg
                          className="size-4"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Dashboard
                      </a>
                    </li>
                    <li>
                      <a
                        className="flex items-center gap-x-3 py-2 px-2.5 text-sm rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-neutral-300"
                        href="#"
                      >
                        <svg
                          className="size-4"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a
                        className="flex items-center gap-x-3 py-2 px-2.5 text-sm rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-neutral-300"
                        href="#"
                      >
                        <svg
                          className="size-4"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        Profile
                      </a>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <a
                        className="flex items-center gap-x-3 py-2 px-2.5 text-sm rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-neutral-300"
                        href="#"
                      >
                        <svg
                          className="size-4"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Login
                      </a>
                    </li>
                    <li>
                      <a
                        className="flex items-center gap-x-3 py-2 px-2.5 text-sm rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-neutral-300"
                        href="#"
                      >
                        <svg
                          className="size-4"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Register
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </nav>

          <footer className="mt-auto p-2 border-t border-neutral-700">
            <div className="hs-dropdown [--strategy:absolute] [--auto-close:inside] relative w-full inline-flex">
              <button
                id="hs-sidebar-footer-example-with-dropdown"
                type="button"
                className="w-full inline-flex shrink-0 items-center gap-x-2 p-2 text-start text-sm rounded-md focus:outline-none text-neutral-200 hover:bg-neutral-700 focus:bg-neutral-700"
                aria-haspopup="menu"
                aria-expanded="false"
                aria-label="Dropdown"
              >
                <img
                  className="shrink-0 size-5 rounded-full"
                  src="https://images.unsplash.com/photo-1734122415415-88cb1d7d5dc0?q=80&w=320&h=320&auto=format&fit=facearea&facepad=3&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Avatar"
                />
                Mia Hudson
                <svg
                  className="shrink-0 size-3.5 ms-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m7 15 5 5 5-5" />
                  <path d="m7 9 5-5 5 5" />
                </svg>
              </button>

              <div
                className="hs-dropdown-menu hs-dropdown-open:opacity-100 w-60 transition-[opacity,margin] duration opacity-0 hidden z-20 border rounded-lg shadow-lg bg-neutral-900 border-neutral-700"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="hs-sidebar-footer-example-with-dropdown"
              >
                <div className="p-1">
                  <a
                    className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none focus:outline-none text-neutral-300 hover:bg-neutral-800 focus:bg-neutral-800"
                    href="#"
                  >
                    My account
                  </a>
                  <a
                    className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none focus:outline-none text-neutral-300 hover:bg-neutral-800 focus:bg-neutral-800"
                    href="#"
                  >
                    Settings
                  </a>
                  <a
                    className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none focus:outline-none text-neutral-300 hover:bg-neutral-800 focus:bg-neutral-800"
                    href="#"
                  >
                    Billing
                  </a>
                  <a
                    className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none focus:outline-none text-neutral-300 hover:bg-neutral-800 focus:bg-neutral-800"
                    href="#"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Navbar;