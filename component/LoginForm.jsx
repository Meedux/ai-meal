"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import ErrorToast from "./ErrorToast";
import { loginUser } from "@/lib/service/authService";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      
      await loginUser(email, password);
      setError("");
      router.push("/trending");
    } catch (err) {
      // Handle specific Firebase auth errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
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
        <div className="card w-full card-border bg-neutral-900 shadow-xl">
          <div className="card-body">
            <center>
              <motion.h3
                className="card-title text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Login
              </motion.h3>
            </center>
            <motion.p
              className="text-neutral-400"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Please enter your credentials to login.
            </motion.p>
            {error && <ErrorToast message={error} />}
            <form className="form-control" onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-400">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="input input-bordered w-full bg-neutral-800 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text text-neutral-400">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="input input-bordered w-full bg-neutral-800 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <motion.button
                type="submit"
                className="btn btn-primary mt-4 w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </motion.button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-neutral-400">
                Don't have an account?{" "}
                <a href="/register" className="text-blue-500 hover:underline">
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;