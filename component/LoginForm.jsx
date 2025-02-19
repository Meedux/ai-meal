"use client";
import React, { useState } from "react";
import UnderlineInput from "./util/UnderlineInput";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-800">
      <div className="container mx-auto max-w-md">
        <div className="min-h-60 flex flex-col border shadow-sm rounded-xl bg-neutral-900 border-neutral-700 shadow-neutral-700/70">
          <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
            <h3 className="text-lg font-bold text-white">
              Login
            </h3>
            <p className="mt-2 text-neutral-400">
              Please enter your credentials to login.
            </p>
            <form className="mt-4 w-full bg-neutral-900">
              <UnderlineInput
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <UnderlineInput
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:bg-blue-700"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;