"use client";

import React, { useState } from "react";
import UnderlineInput from "./util/UnderlineInput";
import PasswordInput from "./util/PasswordInput";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add logic to create a new user using the provided email, password, and name
    // For example, you can use fetch or axios to send a POST request to your backend API
    console.log("Registering user:", { email, password, name });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-800">
      <div className="container mx-auto max-w-md">
        <div className="min-h-60 flex flex-col border shadow-sm rounded-xl bg-neutral-900 border-neutral-700 shadow-neutral-700/70">
          <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
            <h3 className="text-lg font-bold text-white">Register</h3>
            <p className="mt-2 text-neutral-400">
              Please enter your details to create an account.
            </p>
            <form className="mt-4 w-full" onSubmit={handleSubmit}>
              <UnderlineInput
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <UnderlineInput
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:bg-blue-700"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;