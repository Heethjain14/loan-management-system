// SRP: This file is only responsible for the Applications UI and logic
"use client";

// SRP: Data utilities are imported, UI logic is kept separate
import { useEffect, useState } from "react";
import { fetchApplications, saveApplication, updateApplicationStatus } from "../utils/firestore";
import { useRouter } from "next/navigation";

// SRP: Utility functions are focused and reusable
const getToday = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};
const get30DaysFromToday = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

// SRP: ApplicationsPage only handles application UI and logic
// OCP: Can extend with new features without modifying existing logic
export default function ApplicationsPage() {
  // SRP: State hooks are focused on one responsibility each
  const [editingId, setEditingId] = useState<string | null>(null); // SRP
  const [editForm, setEditForm] = useState<any>({}); // SRP

  // SRP: startEdit only sets up editing state
  const startEdit = (app: any) => {
    setEditingId(app.id);
    setEditForm({
      name: app.name ?? "",
      loanAmount: app.loanAmount ?? "",
      rateOfInterest: app.rateOfInterest?.toString() ?? "1",
      startDate: app.startDate ?? getToday(),
      endDate: app.endDate ?? get30DaysFromToday(),
      status: app.status ?? "Pending",
    });
  };

  // SRP: handleEditChange only updates form state
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // SRP: saveEdit only handles saving logic
  // OCP: Can extend calculation logic without modifying saveEdit
  const saveEdit = async (id: string) => {
    let daysBetween = 0;
    if (editForm.startDate && editForm.endDate) {
      const start = new Date(editForm.startDate);
      const end = new Date(editForm.endDate);
      daysBetween = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    const principal = Number(editForm.loanAmount);
    const rate = Number(editForm.rateOfInterest) / 100;
    const totalAmount = principal + principal * rate * (daysBetween / 30);
    const updatedApp = {
      ...editForm,
      loanAmount: principal,
      rateOfInterest: Number(editForm.rateOfInterest),
      daysBetween,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
    try {
      await import('../utils/firestore').then(mod => mod.updateApplication(id, updatedApp));
      setEditingId(null);
      setEditForm({});
      const data = await fetchApplications();
      setApplications(data);
    } catch (err) {
      alert('Error updating application');
    }
  };

  // SRP: cancelEdit only resets editing state
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };
  const [showAll, setShowAll] = useState(false);
  // SRP: deleteApplication only handles deletion logic
  const deleteApplication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await import('../utils/firestore').then(mod => mod.deleteApplication(id));
      const data = await fetchApplications();
      setApplications(data);
    } catch (err) {
      alert('Error deleting application');
    }
  };
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    loanAmount: "",
    startDate: getToday(),
    endDate: get30DaysFromToday(),
    rateOfInterest: "1",
    status: "Pending"
  });
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  // Placeholder for approve/reject logic
  const approveApplication = async (id: string) => {
    await updateApplicationStatus(id, "Approved");
    const data = await fetchApplications();
    setApplications(data);
  };
  const rejectApplication = async (id: string) => {
    await updateApplicationStatus(id, "Rejected");
    const data = await fetchApplications();
    setApplications(data);
  };

  useEffect(() => {
    async function loadApplications() {
      const data = await fetchApplications();
      setApplications(data);
    }
    loadApplications();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calculate days between startDate and endDate
      let daysBetween = 0;
      if (form.startDate && form.endDate) {
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        daysBetween = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }
      const principal = Number(form.loanAmount);
      const rate = Number(form.rateOfInterest) / 100;
      const totalAmount = principal + principal * rate * (daysBetween / 30);
      const newApp = {
        ...form,
        loanAmount: principal,
        rateOfInterest: Number(form.rateOfInterest),
        status: "Pending",
        daysBetween,
        totalAmount: Math.round(totalAmount * 100) / 100,
      };
      await saveApplication(newApp);
      setForm({ name: "", loanAmount: "", startDate: "", endDate: "", rateOfInterest: "", status: "Pending" });
      const data = await fetchApplications();
      setApplications(data);
    } catch (err) {
      alert("Error saving application");
    }
    setLoading(false);
  };

  // SRP: UI rendering is kept separate from logic
  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
  <nav className="bg-black shadow flex items-center justify-between px-8 py-4 mb-8">
        <div className="flex gap-6">
          <button
            className="text-blue-600 font-bold hover:underline"
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </button>
          <button
            className="text-blue-600 font-bold hover:underline"
            onClick={() => router.push('/applications')}
          >
            Applications
          </button>
        </div>
        <span className="font-semibold text-lg text-gray-700">Loan Management</span>
      </nav>

      <div className="p-8">
        <h1 className="text-3xl font-extrabold text-white mb-6">
          Loan Applications
        </h1>

        {/* Floating expandable arrow button for dashboard navigation */}
        {/* Floating expandable arrow button for dashboard navigation */}
        <button
          className="fixed bottom-8 right-8 bg-blue-500 text-white rounded-full shadow-lg flex items-center z-50 transition-all duration-300 overflow-hidden group"
          style={{ width: '48px', height: '48px' }}
          onMouseEnter={e => {
            e.currentTarget.style.width = '180px';
            e.currentTarget.style.borderRadius = '24px';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.width = '48px';
            e.currentTarget.style.borderRadius = '50%';
          }}
          onClick={() => router.push('/dashboard')}
        >
          <span className="flex items-center justify-center w-12 h-12">
            <svg className="w-6 h-6 group-hover:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <span className="ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-base font-semibold">Go to Dashboard</span>
        </button>


  <form className="mb-8 bg-black p-6 rounded-xl shadow flex gap-4 items-end" onSubmit={handleSubmit}>
    <div>
      <label className="block text-sm font-medium text-gray-700">Name</label>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        className="mt-1 block w-full"
        placeholder="Enter name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
      <input
        type="number"
        name="loanAmount"
        value={form.loanAmount}
        onChange={handleChange}
        required
        className="mt-1 block w-full"
        placeholder="Enter amount"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Rate of Interest (%)</label>
      <input
        type="number"
        name="rateOfInterest"
        value={form.rateOfInterest}
        onChange={handleChange}
        required
        className="mt-1 block w-full"
        placeholder="Enter rate"
        step="0.01"
        min="0"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Start Date</label>
      <input
        type="date"
        name="startDate"
        value={form.startDate}
        onChange={handleChange}
        required
        className="mt-1 block w-full"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">End Date</label>
      <input
        type="date"
        name="endDate"
        value={form.endDate}
        onChange={handleChange}
        required
        className="mt-1 block w-full"
      />
    </div>
    <button
      type="submit"
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? "Saving..." : "Add Application"}
    </button>
  </form>

  <div className="mb-6">
    <input
      type="text"
      value={searchName}
      onChange={e => setSearchName(e.target.value)}
      placeholder="Search by name..."
      className="px-4 py-2 rounded-lg bg-neutral-900 text-white w-64"
    />
  </div>

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
        <th className="p-3">Status</th>
        <th className="p-3">Actions</th>
      </tr>
    </thead>
    <tbody>
      {(showAll ? applications : applications.slice(-5))
        .filter(a => a.name.toLowerCase().includes(searchName.toLowerCase()))
        .map((a) => (
        <tr key={String(a.id)} className="border-b">
          <td className="p-3 text-white">{a.snNo}</td>
          {editingId === a.id && a.status === "Pending" ? (
            <>
              <td className="p-3 text-white">
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="bg-neutral-900 text-white px-2 py-1 rounded w-full" />
              </td>
              <td className="p-3 text-white">
                <input type="number" name="loanAmount" value={editForm.loanAmount} onChange={handleEditChange} className="bg-neutral-900 text-white px-2 py-1 rounded w-full" />
              </td>
              <td className="p-3 text-white">
                <input type="number" name="rateOfInterest" value={editForm.rateOfInterest} onChange={handleEditChange} className="bg-neutral-900 text-white px-2 py-1 rounded w-full" step="0.01" min="0" />
              </td>
              <td className="p-3 text-white">
                <input type="date" name="startDate" value={editForm.startDate} onChange={handleEditChange} className="bg-neutral-900 text-white px-2 py-1 rounded w-full" />
              </td>
              <td className="p-3 text-white">
                <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditChange} className="bg-neutral-900 text-white px-2 py-1 rounded w-full" />
              </td>
              <td className="p-3 text-white">{/* daysBetween will be recalculated on save */}</td>
              <td className="p-3 text-white">{/* totalAmount will be recalculated on save */}</td>
              <td className="p-3 text-white">{editForm.status}</td>
              <td className="p-3 flex gap-2">
                <button onClick={() => saveEdit(a.id)} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">Save</button>
                <button onClick={cancelEdit} className="bg-gray-700 text-white px-3 py-1 rounded-lg hover:bg-gray-900 transition">Cancel</button>
              </td>
            </>
          ) : (
            <>
              <td className="p-3 text-white">{a.name}</td>
              <td className="p-3 text-white">${a.loanAmount}</td>
              <td className="p-3 text-white">{a.rateOfInterest ?? ''}</td>
              <td className="p-3 text-white">{a.startDate}</td>
              <td className="p-3 text-white">{a.endDate}</td>
              <td className="p-3 text-white">{a.daysBetween ?? ''}</td>
              <td className="p-3 text-white">${a.totalAmount ?? ''}</td>
              <td className="p-3 font-semibold " style={{ color: a.status === "Approved" ? "#16a34a" : a.status === "Rejected" ? "#dc2626" : "#ca8a04" }}>{a.status}</td>
              <td className="p-3 flex gap-2">
                {a.status === "Pending" && (
                  <>
                    <button
                      onClick={() => approveApplication(String(a.id))}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectApplication(String(a.id))}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => startEdit(a)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition"
                    >
                      Edit
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteApplication(String(a.id))}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg hover:bg-gray-900 transition"
                >
                  Delete
                </button>
              </td>
            </>
          )}
        </tr>
      ))}
    </tbody>
  </table>
  {applications.length > 5 && (
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
