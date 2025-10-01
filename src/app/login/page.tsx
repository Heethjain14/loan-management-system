"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "admin" && password === "password123") {
      setError("");
      router.push("/dashboard");
    } else {
      setError("Invalid username or password!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-black shadow-2xl rounded-2xl p-8 w-96">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Loan Management
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-white font-semibold mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         text-white placeholder-gray-400 bg-neutral-800"
              placeholder="Enter username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white font-semibold mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         text-white placeholder-gray-400 bg-neutral-800"
              placeholder="Enter password"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
