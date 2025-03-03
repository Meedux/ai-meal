import React from "react";

const Card = ({ children }) => {
  return (
    <div className="flex flex-col border shadow-sm rounded-xl p-4 md:p-5 bg-neutral-900 border-neutral-700 text-neutral-400">
      {children}
    </div>
  );
};

export default Card;
