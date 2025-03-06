import React from "react";

const dummyData = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    user: "John Doe",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Chicken Alfredo",
    user: "Jane Smith",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Beef Stroganoff",
    user: "Mike Johnson",
    rating: 4.6,
  },
  {
    id: 4,
    name: "Vegetable Stir Fry",
    user: "Emily Davis",
    rating: 4.8,
  },
];

const MealTable = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-2xl">
        <div className="p-4 w-full">
          <div className="relative max-w-xs mb-4">
            <label htmlFor="hs-table-search" className="sr-only">
              Search
            </label>
            <input
              type="text"
              name="hs-table-search"
              id="hs-table-search"
              className="py-2 px-3 ps-9 block w-full shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-neutral-900 border-neutral-700 text-neutral-400 placeholder-neutral-500 focus:ring-neutral-600"
              placeholder="Search for meals"
            />
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
              <svg
                className="size-4 text-neutral-500"
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
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          </div>
          <ul className="list bg-neutral-900 rounded-box shadow-md w-full">
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide text-neutral-400">
              Meals
            </li>
            {dummyData.map((meal, index) => (
              <a
                href="#"
                className="flex items-center justify-between w-full p-4 hover:bg-neutral-800 rounded-md"
              >
                <li key={meal.id} className="list-row w-full cursor-pointer">
                  <div className="text-4xl font-thin opacity-30 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="list-col-grow ml-4">
                    <div className="text-white">{meal.name}</div>
                    <div className="text-xs uppercase font-semibold opacity-60 text-neutral-400">
                      {meal.user}
                    </div>
                  </div>
                  <div className="text-sm text-neutral-400">{meal.rating}</div>
                </li>
              </a>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MealTable;
