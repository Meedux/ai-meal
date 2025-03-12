"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import UnderlineInput from "./util/UnderlineInput";
import PasswordInput from "./util/PasswordInput";
import ErrorToast from "./ErrorToast";
import { registerUser } from "@/lib/service/authService";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!email || !password || !name) {
        throw new Error("All fields are required.");
      }
      
      await registerUser(email, password, name);
      setError("");
      
      router.push("/trending");
    } catch (err) {
      // Handle specific Firebase auth errors
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please provide a valid email address.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-800">
      <motion.div
        className="container mx-auto max-w-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="min-h-60 flex flex-col border shadow-sm rounded-xl bg-neutral-900 border-neutral-700 shadow-neutral-700/70">
          <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
            <motion.h3
              className="text-lg font-bold text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Register
            </motion.h3>
            <motion.p
              className="mt-2 text-neutral-400"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Please enter your details to create an account.
            </motion.p>
            {error && <ErrorToast message={error} />}
            <form className="mt-4 w-full" onSubmit={handleSubmit}>
              <UnderlineInput
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
              <UnderlineInput
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:bg-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </motion.button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-neutral-400">
                Already have an account?{" "}
                <a href="/" className="text-blue-500 hover:underline">
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterForm;