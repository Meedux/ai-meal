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

const Table = () => {
  return (
    <div className="flex flex-col">
      <div className="-m-1.5 overflow-x-auto">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="border rounded-lg divide-y border-neutral-700 divide-neutral-700">
            <div className="py-3 px-4">
              <div className="relative max-w-xs">
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
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-700">
                <thead className="bg-neutral-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium uppercase text-neutral-500"
                    >
                      Meal Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium uppercase text-neutral-500"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium uppercase text-neutral-500"
                    >
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {dummyData.map((meal) => (
                    <tr key={meal.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-200">
                        <a href="#" className="hover:underline">
                          {meal.name}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-200">
                        {meal.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-200">
                        {meal.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;