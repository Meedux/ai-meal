import React from 'react';

const dummyCategories = [
  {
    id: 1,
    name: "Italian",
    description: "Delicious Italian cuisine",
  },
  {
    id: 2,
    name: "Chinese",
    description: "Authentic Chinese food",
  },
  {
    id: 3,
    name: "Mexican",
    description: "Spicy Mexican dishes",
  },
  {
    id: 4,
    name: "Indian",
    description: "Flavorful Indian meals",
  },
];

const CategoryTable = () => {
  return (
    <div className="flex flex-col">
      <div className="-m-1.5 overflow-x-auto">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="border rounded-lg divide-y border-neutral-700 divide-neutral-700">
            <div className="py-3 px-4">
              <div className="relative max-w-xs">
                <label htmlFor="hs-category-search" className="sr-only">
                  Search
                </label>
                <input
                  type="text"
                  name="hs-category-search"
                  id="hs-category-search"
                  className="py-2 px-3 ps-9 block w-full shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-neutral-900 border-neutral-700 text-neutral-400 placeholder-neutral-500 focus:ring-neutral-600"
                  placeholder="Search for categories"
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
                      Category Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium uppercase text-neutral-500"
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {dummyCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-200">
                        <a href="#" className="hover:underline">
                          {category.name}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-200">
                        {category.description}
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

export default CategoryTable;