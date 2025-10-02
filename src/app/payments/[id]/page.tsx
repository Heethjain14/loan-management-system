"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
// SRP: Data utilities are imported, UI logic is kept separate
import { fetchPayments, savePayment, fetchBorrowerById } from "../../utils/firestore";

// === SOLID Principles Examples ===

// [SRP] This hook only fetches payments, not responsible for UI or other logic
function usePayments(borrowerId: string) {
  const [payments, setPayments] = useState<any[]>([]);
  useEffect(() => {
    fetchPayments(borrowerId).then(setPayments);
  }, [borrowerId]);
  return payments;
}

// [OCP] Payment type can be extended without modifying fetchPayments
type PaymentSOLID = {
  id: string;
  amount: number;
  date: string;
  // Add more fields here without changing fetchPayments
};

// [LSP] This function accepts any object that matches the Payment interface
function printPayment(payment: PaymentSOLID) {
  // Can accept any subtype of Payment
  console.log(payment.amount, payment.date);
}

// [ISP] Split props into focused interfaces
interface AmountProps {
  amount: number;
}
interface DateProps {
  date: string;
}
// Only use what you need in each component
function AmountCell({ amount }: AmountProps) {
  return <td>{amount}</td>;
}
function DateCell({ date }: DateProps) {
  return <td>{date}</td>;
}

// [DIP] Depend on abstractions, not concrete implementations
// Pass data fetcher as a prop
function PaymentsListDIP({ fetcher }: { fetcher: (id: string) => Promise<PaymentSOLID[]> }) {
  const [payments, setPayments] = useState<PaymentSOLID[]>([]);
  useEffect(() => {
    fetcher("borrowerId").then(setPayments);
  }, [fetcher]);
  // ...existing code...
  return null;
}
// === End SOLID Principles Examples & Annotations ===

// SRP: PaymentsPage only handles payment UI and logic
// OCP: Can extend with new features without modifying existing logic
export default function PaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const borrowerId = params.id;
  // SRP: State hooks are focused on one responsibility each
  const [payments, setPayments] = useState<any[]>([]); // SRP
  const [newPayment, setNewPayment] = useState(""); // SRP
  const [borrower, setBorrower] = useState<any | null>(null); // SRP
  // Hydration fix: store clientLocale in state and set in useEffect
  const [clientLocale, setClientLocale] = useState("en-US");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientLocale(window.navigator.language);
    }
  }, []);

  // SRP: useEffect only loads data, not responsible for UI
  useEffect(() => {
    async function loadData() {
      const borrowerData = await fetchBorrowerById(String(borrowerId));
      setBorrower(borrowerData);
      const paymentsData = await fetchPayments(String(borrowerId));
      setPayments(
        paymentsData
          .filter((p: any) => typeof p.amount === 'number' && typeof p.date === 'string')
          .map((p: any) => ({
            id: p.id,
            amount: p.amount,
            date: p.date,
          }))
      );
    }
    loadData();
  }, [borrowerId]);

  // SRP: Calculation logic is kept separate
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0); // SRP
  const remaining = borrower && borrower.loanAmount ? borrower.loanAmount - totalPaid : 0; // SRP

  // SRP: handleAddPayment only handles payment addition
  // OCP: Can extend payment logic without modifying this function
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment || !borrower?.id) return;
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
      // Refresh borrower and payments
      const borrowerData = await fetchBorrowerById(String(borrowerId));
      setBorrower(borrowerData);
      const paymentsData = await fetchPayments(String(borrowerId));
      setPayments(
        paymentsData
          .filter((p: any) => typeof p.amount === 'number' && typeof p.date === 'string')
          .map((p: any) => ({
            id: p.id,
            amount: p.amount,
            date: p.date,
          }))
      );
      setNewPayment("");
    } catch (err) {
      alert("Error saving payment");
    }
  };

  // SRP: UI rendering is kept separate from logic
  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          Payments for {borrower ? borrower.name : "..."}
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
        <span>
          {borrower ? (
            <>
              {borrower.name} | Loan: ${borrower.loanAmount} | Paid: ${totalPaid} | Due: ${remaining} | Due Date: {borrower.dueDate} | Status: {borrower.status}
            </>
          ) : "Loading..."}
        </span>
      </div>

      {/* Add Payment */}
      <div className="bg-black p-6 rounded-xl shadow mb-6">
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

      {/* Payment History */}
      <div className="bg-black p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-white mb-4">Payment History</h2>
        <table className="w-full border-collapse bg-black">
          <thead>
            <tr className="bg-neutral-800 text-left">
              <th className="p-3 text-white font-semibold">Amount</th>
              <th className="p-3 text-white font-semibold">Date</th>
              <th className="p-3 text-white font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b hover:bg-neutral-900">
                <td className="p-3 text-white">{typeof window !== "undefined" ? `$${p.amount.toLocaleString(clientLocale)}` : `$${p.amount}`}</td>
                <td className="p-3 text-white">{p.date}</td>
                <td className="p-3 text-right">
                  <button
                    aria-label="Delete payment"
                    className="text-red-500 hover:text-red-700 text-lg px-2 py-1 rounded-full focus:outline-none"
                    onClick={async () => {
                      if (!window.confirm('Delete this payment?')) return;
                      try {
                        const { deletePayment } = await import('../../utils/firestore');
                        await deletePayment(String(borrower.id), String(p.id));
                        // Refresh payment history
                        const data = await fetchPayments(String(borrower.id));
                        setPayments(
                          data
                            .filter((p: any) => typeof p.amount === 'number' && typeof p.date === 'string')
                            .map((p: any) => ({
                              id: p.id,
                              amount: p.amount,
                              date: p.date,
                            }))
                        );
                      } catch (err) {
                        alert('Error deleting payment');
                      }
                    }}
                  >
                    &#10005;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
