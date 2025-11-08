"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
// SRP: Data utilities are imported, UI logic is kept separate
import { fetchPayments, savePayment, fetchBorrowerById } from "../../utils/firestore";
import Navbar from "../../components/Navbar";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientLocale(window.navigator.language);
    }
  }, []);

  // SRP: useEffect only loads data, not responsible for UI
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
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
      } catch (err) {
        setErrorMessage('Failed to load payments. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!newPayment || !borrower?.id) return;
    const amountNum = parseFloat(newPayment);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage('Enter a valid payment amount greater than 0.');
      return;
    }
    const dateToSave = paymentDate && /\d{4}-\d{2}-\d{2}/.test(paymentDate)
      ? paymentDate
      : new Date().toISOString().split("T")[0];
    const payment = {
      amount: amountNum,
      date: dateToSave,
    };
    try {
      setIsSaving(true);
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
      setPaymentDate("");
      setSuccessMessage('Payment added successfully.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setErrorMessage('Error saving payment. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // SRP: UI rendering is kept separate from logic
  const currencyFormatter = typeof window !== 'undefined'
    ? new Intl.NumberFormat(clientLocale, { style: 'currency', currency: 'USD' })
    : null;

  const formattedRemaining = currencyFormatter
    ? currencyFormatter.format(Math.max(0, remaining))
    : `$${Math.max(0, remaining)}`;

  // Sort payments
  const sortedPayments = [...payments].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  async function exportXlsx() {
    try {
      const XLSX = await import('xlsx');
      const rows = payments.map((p) => ({ Amount: p.amount, Date: p.date }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Payments');
      XLSX.writeFile(wb, `payments_${borrower?.name || borrowerId}.xlsx`);
    } catch (e) {
      setErrorMessage('Could not export Excel file.');
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar />
      <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Payments for {borrower ? borrower.name : "..."}
        </h1>
        <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => {
            try {
              const header = ['Amount','Date'];
              const rows = payments.map(p => [String(p.amount), p.date]);
              const csv = [header, ...rows].map(r => r.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `payments_${borrower?.name || borrowerId}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            } catch (e) {
              setErrorMessage('Could not export CSV.');
              setTimeout(() => setErrorMessage(null), 5000);
            }
          }}
          className="bg-neutral-800 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-neutral-700 transition text-sm sm:text-base"
        >
          Export CSV
        </button>
        <button
          onClick={exportXlsx}
          className="bg-neutral-800 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-neutral-700 transition text-sm sm:text-base"
        >
          Export Excel
        </button>
        </div>
      </div>

      {/* Improved Borrower Summary Card */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 sm:p-6 shadow-lg mb-6">
        {borrower ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-neutral-400 text-xs sm:text-sm mb-1">Borrower</div>
              <div className="text-white font-semibold text-base sm:text-lg">{borrower.name}</div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs sm:text-sm mb-1">Loan Amount</div>
              <div className="text-white font-semibold text-base sm:text-lg">
                {currencyFormatter ? currencyFormatter.format(borrower.loanAmount || 0) : `$${borrower.loanAmount}`}
              </div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs sm:text-sm mb-1">Total Paid</div>
              <div className="text-green-400 font-semibold text-base sm:text-lg">
                {currencyFormatter ? currencyFormatter.format(totalPaid) : `$${totalPaid}`}
              </div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs sm:text-sm mb-1">Remaining Due</div>
              <div className={`font-semibold text-base sm:text-lg ${remaining > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {formattedRemaining}
              </div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs sm:text-sm mb-1">Due Date</div>
              <div className="text-white font-semibold text-base sm:text-lg">{borrower.dueDate || 'N/A'}</div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs sm:text-sm mb-1">Status</div>
              <div className={`font-semibold text-base sm:text-lg ${
                borrower.status === "Approved" ? "text-green-400" : 
                borrower.status === "Rejected" ? "text-red-400" : "text-yellow-400"
              }`}>
                {borrower.status}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-neutral-400">Loading borrower information...</div>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded mb-6" role="alert">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded mb-6" role="status">
          {successMessage}
        </div>
      )}

      {/* Add Payment */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 sm:p-6 shadow-lg mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Add Payment</h2>
        <form onSubmit={handleAddPayment} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-neutral-400 text-sm mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter amount"
              value={newPayment}
              onChange={(e) => setNewPayment(e.target.value)}
              className="w-full p-2.5 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-neutral-400 text-sm mb-1">Date (optional)</label>
            <input
              type="date"
              aria-label="Payment date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full p-2.5 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg transition font-semibold ${isSaving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}
          >
            {isSaving ? 'Saving...' : 'Add Payment'}
          </button>
        </form>
      </div>

      {/* Payment History */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Payment History</h2>
          {payments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
                className="bg-neutral-900 text-white border border-neutral-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="bg-neutral-900 text-white border border-neutral-700 rounded-lg px-3 py-1.5 text-sm hover:bg-neutral-800 transition"
                aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          )}
        </div>
        {isLoading ? (
          <div className="text-neutral-400 py-8 text-center">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="text-neutral-400 py-8 text-center">
            <div className="text-lg mb-2">No payments recorded yet.</div>
            <div className="text-sm">Add your first payment using the form above.</div>
          </div>
        ) : (
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-neutral-900 text-left">
              <th className="p-3 text-white font-semibold text-sm">Amount</th>
              <th className="p-3 text-white font-semibold text-sm">Date</th>
              <th className="p-3 text-white font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPayments.map((p) => (
              <tr key={p.id} className="border-b border-neutral-700 hover:bg-neutral-900/50 transition">
                <td className="p-3 text-white font-medium">{currencyFormatter ? currencyFormatter.format(p.amount) : `$${p.amount}`}</td>
                <td className="p-3 text-white">{new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td className="p-3 text-right">
                  <button
                    aria-label="Delete payment"
                    className="text-red-500 hover:text-red-700 hover:bg-red-500/10 text-lg px-2 py-1 rounded transition"
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
                        setSuccessMessage('Payment deleted.');
                        setTimeout(() => setSuccessMessage(null), 5000);
                      } catch (err) {
                        setErrorMessage('Error deleting payment.');
                        setTimeout(() => setErrorMessage(null), 5000);
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
        )}
      </div>
      </div>
    </div>
  );
}
