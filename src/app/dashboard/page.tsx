"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchBorrowers, fetchPayments } from "../utils/firestore";

export default function DashboardPage() {
  const [showAll, setShowAll] = useState(false);
  const [searchName, setSearchName] = useState("");
  const deleteBorrower = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this borrower?')) return;
    try {
      await import('../utils/firestore').then(mod => mod.deleteBorrower(id));
      const data = await fetchBorrowers();
      setBorrowers(data);
    } catch (err) {
      alert('Error deleting borrower');
    }
  };
  const router = useRouter();
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [paidAmounts, setPaidAmounts] = useState<{[id: string]: number}>({});

  useEffect(() => {
    async function loadBorrowers() {
      const data = await fetchBorrowers();
      setBorrowers(data);
      // Fetch paid amounts for each borrower
      const paid: {[id: string]: number} = {};
      await Promise.all(
        data.map(async (b: any) => {
          const payments = await fetchPayments(b.id);
          paid[b.id] = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        })
      );
      setPaidAmounts(paid);
    }
    loadBorrowers();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
  <nav className="bg-black shadow flex items-center justify-between px-8 py-4 mb-8">
        <div className="flex gap-6">
          <button
            className="text-blue-600 font-bold"
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </button>
          <button
            className="text-blue-600 font-bold"
            onClick={() => router.push('/applications')}
          >
            Applications
          </button>
        </div>
        <span className="font-semibold text-lg text-gray-700">Loan Management</span>
      </nav>

      <div className="p-8">
        <h1 className="text-3xl font-extrabold text-white mb-6">
          Borrowers Dashboard
        </h1>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="Search by name..."
            className="px-4 py-2 rounded-lg bg-neutral-900 text-white w-64"
          />
        </div>



        {/* Floating button at bottom right */}
        <button
          className="fixed bottom-8 right-8 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
          onClick={() => router.push('/applications')}
        >
          Go to Applications
        </button>

  <table className="w-full border-collapse bg-black rounded-xl shadow">
    <thead>
      <tr className="bg-neutral-800 text-left">
        <th className="p-3">SN No</th>
        <th className="p-3">Name</th>
        <th className="p-3">Loan Amount</th>
        <th className="p-3">Rate (%)</th>
        <th className="p-3">Start Date</th>
        <th className="p-3">End Date</th>
        <th className="p-3">Days</th>
        <th className="p-3">Total Amount</th>
        <th className="p-3">Due Amount</th>
        <th className="p-3">Status</th>
        <th className="p-3">Actions</th>
      </tr>
    </thead>
    <tbody>
      {(showAll ? borrowers : borrowers.slice(-5))
        .filter(b => b.name.toLowerCase().includes(searchName.toLowerCase()))
        .map((b) => {
          // Calculate due amount (totalAmount - paidAmount)
          const paidAmount = paidAmounts[b.id] || 0;
          const dueAmount = b.totalAmount ? Math.max(Number(b.totalAmount) - paidAmount, 0) : '';
          return (
            <tr key={b.id} className="border-b">
              <td className="p-3 text-white">{b.snNo}</td>
              <td className="p-3 text-white">{b.name}</td>
              <td className="p-3 text-white">${b.loanAmount ?? ''}</td>
              <td className="p-3 text-white">{b.rateOfInterest ?? ''}</td>
              <td className="p-3 text-white">{b.startDate ?? ''}</td>
              <td className="p-3 text-white">{b.endDate ?? ''}</td>
              <td className="p-3 text-white">{b.daysBetween ?? ''}</td>
              <td className="p-3 text-white">${b.totalAmount ?? ''}</td>
              <td className="p-3 text-white">${dueAmount}</td>
              <td className="p-3 font-semibold " style={{ color: b.status === "Approved" ? "#16a34a" : b.status === "Rejected" ? "#dc2626" : "#ca8a04" }}>{b.status}</td>
              <td className="p-3 flex gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/payments/${b.id}?name=${encodeURIComponent(
                        b.name
                      )}&loanAmount=${b.loanAmount}&dueDate=${b.dueDate}&status=${b.status}&endDate=${b.endDate}`
                    )
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                >
                  View Payments
                </button>
                <button
                  onClick={() => deleteBorrower(String(b.id))}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg hover:bg-gray-900 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
    </tbody>
  </table>
  {borrowers.length > 5 && (
    <div className="mt-4">
      <button
        className="bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-900 transition"
        onClick={() => setShowAll((v) => !v)}
      >
        {showAll ? "Show Less" : "See More"}
      </button>
    </div>
  )}
      </div>
    </div>
  );
}
