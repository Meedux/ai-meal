import React from "react";

const Card = ({ children }) => {
  return (
    <div className="card card-border p-5">
      {children}
    </div>
  );
};

export default Card;
