"use client";

import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <Navbar />
      {/* Radial spotlight background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-gradient-radial from-indigo-500/30 via-purple-500/20 to-transparent blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-200px] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-400/10 blur-3xl" />
        {/* Subtle grid overlay */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Centered hero */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          <div className="mx-auto rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-10 shadow-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Smarter Loan Management
            </h1>
            <p className="text-neutral-200 text-lg md:text-xl mb-8">
              Track applications, payments, and due amounts with clean dashboards and faster workflows.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 transition">
                Go to Dashboard
              </a>
              <a href="/applications" className="inline-flex items-center justify-center rounded-lg bg-neutral-800 px-6 py-3 font-semibold hover:bg-neutral-700 transition">
                Manage Applications
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
