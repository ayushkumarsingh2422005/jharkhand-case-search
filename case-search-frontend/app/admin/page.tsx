"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SuperAdminGuard } from "../../components/AuthGuard";

type CrimeHead = {
  _id: string;
  name: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
};

type ReasonForPendency = {
  _id: string;
  reason: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
};

type User = {
  _id: string;
  email: string;
  role: "SuperAdmin" | "Viewer";
  createdAt?: string;
  createdBy?: string;
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"case-management" | "crime-heads" | "reasons" | "users">("case-management");
  const [crimeHeads, setCrimeHeads] = useState<CrimeHead[]>([]);
  const [reasons, setReasons] = useState<ReasonForPendency[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Crime Head form state
  const [crimeHeadName, setCrimeHeadName] = useState("");
  const [editingCrimeHead, setEditingCrimeHead] = useState<CrimeHead | null>(null);
  
  // Reason form state
  const [reasonText, setReasonText] = useState("");
  const [editingReason, setEditingReason] = useState<ReasonForPendency | null>(null);
  
  // User form state
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState<"SuperAdmin" | "Viewer">("Viewer");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchData();
  }, [activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      if (data.success && data.authenticated) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (activeTab === "crime-heads") {
        const response = await fetch("/api/crime-heads?includeInactive=true");
        const data = await response.json();
        if (data.success) {
          setCrimeHeads(data.data);
        } else {
          setError(data.error || "Failed to fetch crime heads");
        }
      } else if (activeTab === "reasons") {
        const response = await fetch("/api/reason-for-pendency?includeInactive=true");
        const data = await response.json();
        if (data.success) {
          setReasons(data.data);
        } else {
          setError(data.error || "Failed to fetch reasons");
        }
      } else if (activeTab === "users") {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.error || "Failed to fetch users");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCrimeHead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crimeHeadName.trim()) {
      alert("Please enter a crime head name");
      return;
    }

    try {
      const response = await fetch("/api/crime-heads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: crimeHeadName.trim(), createdBy: "Admin" }),
      });

      const data = await response.json();
      if (data.success) {
        setCrimeHeadName("");
        fetchData();
      } else {
        alert(data.error || "Failed to add crime head");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleUpdateCrimeHead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrimeHead || !crimeHeadName.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/crime-heads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCrimeHead._id,
          name: crimeHeadName.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingCrimeHead(null);
        setCrimeHeadName("");
        fetchData();
      } else {
        alert(data.error || "Failed to update crime head");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleDeleteCrimeHead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crime head?")) {
      return;
    }

    try {
      const response = await fetch(`/api/crime-heads?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to delete crime head");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleToggleCrimeHeadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/crime-heads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleAddReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonText.trim()) {
      alert("Please enter a reason");
      return;
    }

    try {
      const response = await fetch("/api/reason-for-pendency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reasonText.trim(), createdBy: "Admin" }),
      });

      const data = await response.json();
      if (data.success) {
        setReasonText("");
        fetchData();
      } else {
        alert(data.error || "Failed to add reason");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleUpdateReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReason || !reasonText.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/reason-for-pendency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingReason._id,
          reason: reasonText.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingReason(null);
        setReasonText("");
        fetchData();
      } else {
        alert(data.error || "Failed to update reason");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleDeleteReason = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reason?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reason-for-pendency?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to delete reason");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleToggleReasonStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/reason-for-pendency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const startEditCrimeHead = (crimeHead: CrimeHead) => {
    setEditingCrimeHead(crimeHead);
    setCrimeHeadName(crimeHead.name);
  };

  const startEditReason = (reason: ReasonForPendency) => {
    setEditingReason(reason);
    setReasonText(reason.reason);
  };

  const cancelEdit = () => {
    setEditingCrimeHead(null);
    setEditingReason(null);
    setEditingUser(null);
    setCrimeHeadName("");
    setReasonText("");
    setUserEmail("");
    setUserPassword("");
    setUserRole("Viewer");
  };

  // User management functions
  const handleAddUser = async () => {
    if (!userEmail || !userPassword) {
      alert("Email and password are required");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail.trim(),
          password: userPassword,
          role: userRole,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUserEmail("");
        setUserPassword("");
        setUserRole("Viewer");
        fetchData();
      } else {
        alert(data.error || "Failed to create user");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !userEmail) {
      alert("Email is required");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser._id,
          email: userEmail.trim(),
          password: userPassword || undefined,
          role: userRole,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingUser(null);
        setUserEmail("");
        setUserPassword("");
        setUserRole("Viewer");
        fetchData();
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setUserEmail(user.email);
    setUserPassword("");
    setUserRole(user.role);
  };

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
              <p className="text-sm text-slate-600 mt-1">Manage Cases, Crime Heads, and Reasons for Pendency</p>
            </div>
            <Link
              href="/"
              className="text-sm text-blue-700 hover:text-blue-800 font-medium"
            >
              ← Back to Search
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab("case-management");
                  cancelEdit();
                }}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "case-management"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Case Management
              </button>
              <button
                onClick={() => {
                  setActiveTab("crime-heads");
                  cancelEdit();
                }}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "crime-heads"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Crime Heads
              </button>
              <button
                onClick={() => {
                  setActiveTab("reasons");
                  cancelEdit();
                }}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "reasons"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Reasons for Pendency
              </button>
              {currentUser?.role === "SuperAdmin" && (
                <button
                  onClick={() => {
                    setActiveTab("users");
                    cancelEdit();
                  }}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "users"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  User Management
                </button>
              )}
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Case Management Tab */}
        {activeTab === "case-management" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Navigation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-colors group"
                >
                  <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">Search Cases</h3>
                    <p className="text-sm text-slate-600">Search and filter cases</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-colors group"
                >
                  <div className="shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">Case Dashboard</h3>
                    <p className="text-sm text-slate-600">View all cases and manage them</p>
                  </div>
                </Link>

                <Link
                  href="/add"
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-colors group"
                >
                  <div className="shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">Add New Case</h3>
                    <p className="text-sm text-slate-600">Create a new case entry</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Case Management Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Search & Filter
                  </h3>
                  <p className="text-sm text-slate-600">
                    Advanced search with multiple filters including case number, year, status, accused information, and more.
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="9" x2="15" y2="9" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    View All Cases
                  </h3>
                  <p className="text-sm text-slate-600">
                    Browse all cases in a table format with pagination, sorting, and quick actions.
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Case Details
                  </h3>
                  <p className="text-sm text-slate-600">
                    View comprehensive case information including accused details, reports, and timeline.
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Cases
                  </h3>
                  <p className="text-sm text-slate-600">
                    Update case information, add notes, modify accused details, and manage reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crime Heads Tab */}
        {activeTab === "crime-heads" && (
          <div className="space-y-6">
            {/* Add/Edit Form */}
            <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {editingCrimeHead ? "Edit Crime Head" : "Add New Crime Head"}
              </h2>
              <form onSubmit={editingCrimeHead ? handleUpdateCrimeHead : handleAddCrimeHead} className="flex gap-3">
                <input
                  type="text"
                  value={crimeHeadName}
                  onChange={(e) => setCrimeHeadName(e.target.value)}
                  placeholder="Enter crime head name"
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingCrimeHead ? "Update" : "Add"}
                </button>
                {editingCrimeHead && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">All Crime Heads ({crimeHeads.length})</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading...</div>
              ) : crimeHeads.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No crime heads found. Add one to get started.</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {crimeHeads.map((ch) => (
                    <div key={ch._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          ch.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {ch.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="font-medium text-slate-900">{ch.name}</span>
                        {ch.createdBy && (
                          <span className="text-xs text-slate-500">by {ch.createdBy}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCrimeHeadStatus(ch._id, ch.isActive)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            ch.isActive
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {ch.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => startEditCrimeHead(ch)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCrimeHead(ch._id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reasons Tab */}
        {activeTab === "reasons" && (
          <div className="space-y-6">
            {/* Add/Edit Form */}
            <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {editingReason ? "Edit Reason" : "Add New Reason"}
              </h2>
              <form onSubmit={editingReason ? handleUpdateReason : handleAddReason} className="flex gap-3">
                <input
                  type="text"
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Enter reason for pendency"
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingReason ? "Update" : "Add"}
                </button>
                {editingReason && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">All Reasons ({reasons.length})</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading...</div>
              ) : reasons.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No reasons found. Add one to get started.</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {reasons.map((r) => (
                    <div key={r._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          r.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {r.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="font-medium text-slate-900">{r.reason}</span>
                        {r.createdBy && (
                          <span className="text-xs text-slate-500">by {r.createdBy}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleReasonStatus(r._id, r.isActive)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            r.isActive
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {r.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => startEditReason(r)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReason(r._id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === "users" && currentUser?.role === "SuperAdmin" && (
          <div className="space-y-6">
            {/* Add/Edit Form */}
            <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password {editingUser ? "(leave blank to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Role *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as "SuperAdmin" | "Viewer")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={editingUser ? handleUpdateUser : handleAddUser}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {editingUser ? "Update" : "Add"}
                  </button>
                  {editingUser && (
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">All Users</h2>
              </div>
              {loading ? (
                <div className="px-6 py-8 text-center text-slate-500">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === "SuperAdmin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => startEditUser(user)}
                              className="text-blue-700 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            {user._id !== currentUser?._id && (
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-700 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      </div>
    </SuperAdminGuard>
  );
}

