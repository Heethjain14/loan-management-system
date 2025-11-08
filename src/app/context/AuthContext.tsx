"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { app, db } from "../../firebase";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type Role = "admin" | "staff" | null;

type AuthContextValue = {
  user: User | null;
  role: Role;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          const r = (snap.exists() ? (snap.data() as any).role : null) as Role;
          setRole(r || "staff");
        } catch {
          setRole("staff");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    role,
    loading,
    async signIn(email: string, password: string) {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
    },
    async signOut() {
      const auth = getAuth(app);
      await fbSignOut(auth);
    }
  }), [user, role, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


