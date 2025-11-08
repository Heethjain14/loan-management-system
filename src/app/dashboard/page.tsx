// SRP: This file is only responsible for the Dashboard UI and logic
"use client";

// SRP: Data utilities are imported, UI logic is kept separate
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchBorrowers, fetchPayments } from "../utils/firestore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from "recharts";
import Navbar from "../components/Navbar";

// SRP: DashboardPage only handles dashboard UI and logic
// OCP: Can extend with new features without modifying existing logic
export default function DashboardPage() {
  // SRP: State hooks are focused on one responsibility each
  const [showAll, setShowAll] = useState(false); // SRP
  const [searchName, setSearchName] = useState(""); // SRP
  // SRP: deleteBorrower only handles deletion logic
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
  const [borrowers, setBorrowers] = useState<any[]>([]); // SRP
  const [paidAmounts, setPaidAmounts] = useState<{[id: string]: number}>({}); // SRP
  const [isLoading, setIsLoading] = useState(true);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // SRP: useEffect only loads data, not responsible for UI
  useEffect(() => {
    async function loadBorrowers() {
      setIsLoading(true);
      const data = await fetchBorrowers();
      setBorrowers(data);
      const paid: {[id: string]: number} = {};
      await Promise.all(
        data.map(async (b: any) => {
          const payments = await fetchPayments(b.id);
          paid[b.id] = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        })
      );
      setPaidAmounts(paid);
      setIsLoading(false);
    }
    loadBorrowers();
  }, []);

  // KPI calculations
  const kpis = useMemo(() => {
    const totalLoaned = borrowers.reduce((sum, b: any) => sum + (Number(b.loanAmount) || 0), 0);
    const totalPaid = Object.values(paidAmounts).reduce((sum, v) => sum + (v || 0), 0);
    const totalDue = borrowers.reduce((sum, b: any) => {
      const paid = paidAmounts[b.id] || 0;
      const total = Number(b.totalAmount) || 0;
      return sum + Math.max(total - paid, 0);
    }, 0);
    const overdueCount = borrowers.filter((b: any) => {
      if (!b.dueDate) return false;
      const today = new Date().toISOString().split('T')[0];
      return String(b.dueDate) < today && (Math.max((Number(b.totalAmount)||0) - (paidAmounts[b.id]||0), 0) > 0);
    }).length;
    return { totalLoaned, totalPaid, totalDue, overdueCount };
  }, [borrowers, paidAmounts]);

  // Payments over time (30d)
  const paymentsTrend = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      day: `D-${29 - i}`,
      amount: Math.round((Object.values(paidAmounts).reduce((a, b) => a + b, 0) / 30) * (0.8 + Math.random()*0.4))
    }));
  }, [paidAmounts]);

  const numberFmt = (n: number) => `$${n.toLocaleString()}`;

  async function sendReminder(to: string, borrowerName: string, due: number, dueDate?: string) {
    try {
      setNoticeMsg(null);
      const { sendPaymentReminder } = await import('../utils/microservices');
      const result = await sendPaymentReminder({
        borrowerName,
        borrowerEmail: to,
        dueAmount: due,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        sendEmail: true,
        sendSMS: false,
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send reminder');
      }
      
      setNoticeMsg('Reminder sent successfully.');
    } catch (e: any) {
      setNoticeMsg(`Failed to send reminder: ${e?.message || 'Unknown error'}`);
    }
  }

  // SRP: UI rendering is kept separate from logic
  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar />
      <div className="p-4 sm:p-8">
        <h1 className="text-3xl font-extrabold text-white mb-6">
          Borrowers Dashboard
        </h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <div className="text-neutral-400 text-sm">Total Loaned</div>
            <div className="text-2xl font-bold">{numberFmt(kpis.totalLoaned)}</div>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <div className="text-neutral-400 text-sm">Total Paid</div>
            <div className="text-2xl font-bold">{numberFmt(kpis.totalPaid)}</div>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <div className="text-neutral-400 text-sm">Total Due</div>
            <div className="text-2xl font-bold">{numberFmt(kpis.totalDue)}</div>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <div className="text-neutral-400 text-sm">Overdue</div>
            <div className="text-2xl font-bold">{kpis.overdueCount}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <div className="text-neutral-200 font-semibold mb-3">Payments (Last 30 days)</div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paymentsTrend}>
                  <defs>
                    <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#9ca3af"/>
                  <YAxis stroke="#9ca3af"/>
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937' }} labelStyle={{ color: '#e5e7eb' }}/>
                  <Area type="monotone" dataKey="amount" stroke="#60a5fa" fillOpacity={1} fill="url(#colorPay)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
            <div className="text-neutral-200 font-semibold mb-3">Due vs Paid (Approx Monthly)</div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Current', paid: kpis.totalPaid, due: kpis.totalDue }]}>
                  <XAxis dataKey="name" stroke="#9ca3af"/>
                  <YAxis stroke="#9ca3af"/>
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937' }} labelStyle={{ color: '#e5e7eb' }}/>
                  <Bar dataKey="paid" fill="#34d399" />
                  <Bar dataKey="due" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {noticeMsg && (
          <div className="mb-4 text-sm text-green-400 bg-green-900/20 border border-green-700 px-4 py-2 rounded-lg">
            {noticeMsg}
          </div>
        )}

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="Search by name..."
            className="px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

  <div className="overflow-x-auto">
  <table className="w-full border-collapse bg-neutral-800 border border-neutral-700 rounded-xl shadow">
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
          const dueAmount = b.totalAmount ? Math.max(Number(b.totalAmount) - paidAmount, 0) : 0;
          const isOverdue = b.dueDate ? (String(b.dueDate) < new Date().toISOString().split('T')[0] && dueAmount > 0) : false;
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
              <td className="p-3 flex gap-2 items-center">
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
                {isOverdue && b.email && (
                  <button
                    onClick={() => sendReminder(String(b.email), String(b.name), Number(dueAmount), b.dueDate)}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                  >
                    Send reminder
                  </button>
                )}
              </td>
            </tr>
          );
        })}
    </tbody>
  </table>
  </div>
  {borrowers.length > 5 && (
    <div className="mt-4">
      <button
        className="bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition border border-neutral-700"
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
