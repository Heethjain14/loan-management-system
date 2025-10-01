"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Borrower = {
  id: number;
  name: string;
  loanAmount: number;
  dueDate: string;
  status: string;
};

type Application = {
  id: number;
  name: string;
  loanAmount: number;
  status: "Pending" | "Approved" | "Rejected";
};

type LoanContextType = {
  borrowers: Borrower[];
  applications: Application[];
  approveApplication: (id: number) => void;
  rejectApplication: (id: number) => void;
};

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: ReactNode }) {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [applications, setApplications] = useState<Application[]>([
    { id: 1, name: "Alice", loanAmount: 10000, status: "Pending" },
    { id: 2, name: "Bob", loanAmount: 5000, status: "Pending" },
  ]);

  const approveApplication = (id: number) => {
    setApplications((apps) =>
      apps.map((app) =>
        app.id === id ? { ...app, status: "Approved" } : app
      )
    );

    const approvedApp = applications.find((app) => app.id === id);
    if (approvedApp) {
      setBorrowers((prev) => [
        ...prev,
        {
          id: approvedApp.id,
          name: approvedApp.name,
          loanAmount: approvedApp.loanAmount,
          dueDate: "2025-09-30",
          status: "Active",
        },
      ]);
    }
  };

  const rejectApplication = (id: number) => {
    setApplications((apps) =>
      apps.map((app) =>
        app.id === id ? { ...app, status: "Rejected" } : app
      )
    );
  };

  return (
    <LoanContext.Provider
      value={{ borrowers, applications, approveApplication, rejectApplication }}
    >
      {children}
    </LoanContext.Provider>
  );
}

export function useLoanContext() {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error("useLoanContext must be used inside LoanProvider");
  }
  return context;
}
