import React from "react";

const dummyData = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    user: "John Doe",
    category: "Italian",
    macros: {
      calories: 650,
      protein: 22,
    }
  },
  {
    id: 2,
    name: "Chicken Alfredo",
    user: "Jane Smith",
    category: "Italian",
    macros: {
      calories: 720,
      protein: 38,
    }
  },
  {
    id: 3,
    name: "Beef Stroganoff",
    user: "Mike Johnson",
    category: "Russian",
    macros: {
      calories: 580,
      protein: 32,
    }
  },
  {
    id: 4,
    name: "Vegetable Stir Fry",
    user: "Emily Davis",
    category: "Asian",
    macros: {
      calories: 420,
      protein: 15,
    }
  },
];

const MealTable = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-3xl mx-auto">
        <div className="p-4 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-3 sm:mb-0">Meal Collection</h2>
          </div>

          <div className="relative mb-6">
            <label htmlFor="hs-table-search" className="sr-only">
              Search
            </label>
            <input
              type="text"
              name="hs-table-search"
              id="hs-table-search"
              className="py-3 px-4 pl-11 block w-full shadow-md rounded-lg text-sm focus:ring-2 focus:ring-primary/40 focus:border-transparent border border-neutral-700/50 bg-neutral-800 text-white placeholder-neutral-400"
              placeholder="Search for meals"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                className="size-5 text-neutral-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          </div>

          <ul className="list bg-neutral-800 rounded-2xl shadow-xl w-full divide-y divide-neutral-700/30">
            <li className="p-5 pb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Available Meals
            </li>
            {dummyData.map((meal, index) => (
              <li key={meal.id} className="w-full cursor-pointer group transition-colors">
                <a
                  href="#"
                  className="flex items-center w-full p-4 hover:bg-neutral-700/30 rounded-md transition-all duration-200"
                >
                  <div className="text-3xl font-extralight w-10 text-neutral-500 tabular-nums group-hover:text-primary transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center">
                      <div>
                        <div className="text-white font-medium group-hover:text-primary transition-colors">
                          {meal.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-neutral-700/50 px-2 py-0.5 rounded text-neutral-300">
                            {meal.category}
                          </span>
                          <span className="text-xs text-neutral-400">
                            By {meal.user}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-300">{meal.macros.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-300">{meal.macros.protein}g protein</span>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 flex justify-center">
            <button className="btn btn-ghost btn-sm text-neutral-400 hover:text-white">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealTable;