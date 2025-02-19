import React from "react";

const UnderlineInput = ({
  placeholder = "Enter name",
  type = "name",
  value,
  onChange,
}) => {
  return (
    <div className="relative mb-3">
      <input
        type={type}
        className="peer py-3 pe-0 ps-8 block w-full bg-neutral-900 border-t-transparent border-b-2 border-x-transparent text-sm focus:border-t-transparent focus:border-x-transparent focus:ring-0 disabled:opacity-50 disabled:pointer-events-none border-b-neutral-700 text-neutral-400 placeholder-neutral-500 focus:ring-neutral-600 focus:border-b-neutral-600"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-2 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
        <svg
          className="shrink-0 size-4 text-gray-500 dark:text-neutral-500"
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
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    </div>
  );
};

export default UnderlineInput;