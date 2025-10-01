"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { fetchPayments, savePayment } from "../../utils/firestore";

type Payment = {
  id: number;
  amount: number;
  date: string;
};

export default function PaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const borrower = {
    id: params.id,
    name: searchParams.get("name") || "Unknown",
    loanAmount: Number(searchParams.get("loanAmount")) || 0,
    status: searchParams.get("status") || "Active",
    dueDate: searchParams.get("endDate") || searchParams.get("dueDate") || "N/A",
  };

  const [payments, setPayments] = useState<Payment[]>([]);
  const [newPayment, setNewPayment] = useState("");
  const [clientLocale, setClientLocale] = useState<string>("en-US");

  useEffect(() => {
    setClientLocale(typeof window !== "undefined" ? navigator.language : "en-US");
    // Fetch payment history from Firestore
    async function loadPayments() {
      if (borrower.id) {
        const data = await fetchPayments(String(borrower.id));
        // Ensure each payment has amount and date
        setPayments(
          data
            .filter((p: any) => typeof p.amount === 'number' && typeof p.date === 'string')
            .map((p: any, idx: number) => ({
              id: idx + 1,
              amount: p.amount,
              date: p.date,
            }))
        );
      }
    }
    loadPayments();
  }, [borrower.id]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment || !borrower.id) return;
    let paymentDate = "";
    if (typeof window !== "undefined") {
      paymentDate = new Date().toISOString().split("T")[0];
    }
    const payment = {
      amount: parseFloat(newPayment),
      date: paymentDate,
    };
    try {
      await savePayment(String(borrower.id), payment);
      // Refresh payment history
      const data = await fetchPayments(String(borrower.id));
      setPayments(
        data
          .filter((p: any) => typeof p.amount === 'number' && typeof p.date === 'string')
          .map((p: any, idx: number) => ({
            id: idx + 1,
            amount: p.amount,
            date: p.date,
          }))
      );
      setNewPayment("");
    } catch (err) {
      alert("Error saving payment");
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = borrower.loanAmount - totalPaid;

  return (
  <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          Payments for {borrower.name}
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Concise Borrower Summary */}
      <div className="bg-black p-3 rounded-xl shadow mb-6 text-white text-sm font-semibold flex flex-wrap gap-4">
        <span>{borrower.name} | Loan: ${borrower.loanAmount} | Paid: ${totalPaid} | Due: ${remaining} | Due Date: {borrower.dueDate} | Status: {borrower.status}</span>
      </div>

      {/* Payment History */}
      <div className="bg-black p-6 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Payment History</h2>
  <table className="w-full border-collapse bg-black">
          <thead>
            <tr className="bg-neutral-800 text-left">
              <th className="p-3 text-white font-semibold">Payment ID</th>
              <th className="p-3 text-white font-semibold">Amount</th>
              <th className="p-3 text-white font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b hover:bg-neutral-900">
                <td className="p-3 text-white">{p.id}</td>
                <td className="p-3 text-white">{typeof window !== "undefined" ? `$${p.amount.toLocaleString(clientLocale)}` : `$${p.amount}`}</td>
                <td className="p-3 text-white">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Payment */}
      <div className="bg-black p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-white mb-4">Add Payment</h2>
        <form onSubmit={handleAddPayment} className="flex gap-3">
          <input
            type="number"
            placeholder="Enter amount"
            value={newPayment}
            onChange={(e) => setNewPayment(e.target.value)}
            className="p-2 border border-gray-700 rounded-lg text-white placeholder-gray-400 bg-neutral-800 focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
