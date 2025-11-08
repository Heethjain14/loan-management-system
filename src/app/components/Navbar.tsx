"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/dashboard")}
              className={`px-3 py-2 rounded-lg font-semibold transition ${
                isActive("/dashboard")
                  ? "bg-blue-600 text-white"
                  : "text-blue-400 hover:text-blue-300 hover:bg-neutral-800"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/applications")}
              className={`px-3 py-2 rounded-lg font-semibold transition ${
                isActive("/applications")
                  ? "bg-blue-600 text-white"
                  : "text-blue-400 hover:text-blue-300 hover:bg-neutral-800"
              }`}
            >
              Applications
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-3 py-2 rounded-lg font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              Home
            </button>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-neutral-300 text-sm">
                  {user.email}
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    router.push("/login");
                  }}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

