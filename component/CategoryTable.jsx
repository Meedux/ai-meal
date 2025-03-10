import React from 'react';

const dummyCategories = [
  {
    id: 1,
    name: "Italian",
    description: "Delicious Italian cuisine",
    mealCount: 12
  },
  {
    id: 2,
    name: "Chinese",
    description: "Authentic Chinese food",
    mealCount: 8
  },
  {
    id: 3,
    name: "Mexican",
    description: "Spicy Mexican dishes",
    mealCount: 7
  },
  {
    id: 4,
    name: "Indian",
    description: "Flavorful Indian meals",
    mealCount: 6
  },
  {
    id: 5,
    name: "Japanese",
    description: "Traditional and fusion Japanese cuisine",
    mealCount: 9
  },
];

const CategoryTable = () => {
  // Icon for each category
  const getCategoryIcon = (categoryName) => {
    const icons = {
      Italian: (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      Chinese: (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      Mexican: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
      Indian: (
        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      Japanese: (
        <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    };

    return icons[categoryName] || (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-3xl mx-auto">
        <div className="p-4 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-3 sm:mb-0">Recipe Categories</h2>
            <button className="btn btn-sm btn-primary">Add Category</button>
          </div>

          <div className="relative mb-6">
            <label htmlFor="hs-category-search" className="sr-only">
              Search
            </label>
            <input
              type="text"
              name="hs-category-search"
              id="hs-category-search"
              className="py-3 px-4 pl-11 block w-full shadow-md rounded-lg text-sm focus:ring-2 focus:ring-primary/40 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400"
              placeholder="Search for categories"
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
              Cuisine Categories
            </li>
            {dummyCategories.map((category, index) => (
              <li key={category.id} className="w-full cursor-pointer group transition-colors">
                <a
                  href="#"
                  className="flex items-center w-full p-4 hover:bg-neutral-700/30 rounded-md transition-all duration-200"
                >
                  <div className="text-3xl font-extralight w-10 text-neutral-500 tabular-nums group-hover:text-primary transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getCategoryIcon(category.name)}
                      </div>
                      <div>
                        <div className="text-white font-medium group-hover:text-primary transition-colors">
                          {category.name}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-neutral-700/20 px-2 py-1 rounded-full">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-300">{category.mealCount} meals</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 flex justify-center">
            <button className="btn btn-ghost btn-sm text-neutral-400 hover:text-white">
              View All Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTable;