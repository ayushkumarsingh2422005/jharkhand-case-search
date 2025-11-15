"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Case = {
  _id: string;
  caseNo: string;
  year: number;
  policeStation: string;
  crimeHead: string;
  crimeSection: string;
  punishmentCategory: string;
  caseStatus: string;
  investigationStatus?: string;
  priority?: string;
  accused?: Array<{ name: string; status: string }>;
  createdAt: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCases();
  }, [page]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cases?page=${page}&limit=25`);
      const data = await response.json();

      if (data.success) {
        setCases(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        setError(data.error || "Failed to fetch cases");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (caseId: string, caseNo: string) => {
    if (!confirm(`Are you sure you want to delete case ${caseNo}?`)) {
      return;
    }

    try {
      setDeleteLoading(caseId);
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchCases();
      } else {
        alert(data.error || "Failed to delete case");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      "Disposed": "bg-green-100 text-green-800 ring-green-600/20",
      "Under investigation": "bg-orange-100 text-orange-800 ring-orange-600/20",
      "Decision Pending": "bg-red-100 text-red-800 ring-red-600/20",
    };
    return statusColors[status] || "bg-slate-100 text-slate-800 ring-slate-600/20";
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-slate-600">
        <Link href="/" className="text-blue-700 hover:underline">Search</Link>
        <span className="mx-2">/</span>
        <span className="font-medium">Dashboard</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden mb-6">
        <div className="px-4 py-4 md:px-6 md:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-wide">Case Dashboard</h1>
            <p className="text-sm text-slate-600">Manage all cases</p>
          </div>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Case
          </Link>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-slate-600">Loading cases...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCases}
              className="mt-4 text-blue-700 hover:text-blue-800 font-medium"
            >
              Retry
            </button>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p className="text-slate-600 mb-4">No cases found</p>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-900"
            >
              Add Your First Case
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Case No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Police Station</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Crime Head</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Accused</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {cases.map((caseItem) => (
                    <tr key={caseItem._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/cases/${caseItem.caseNo.replace(/\//g, "-")}`}
                          className="text-blue-700 hover:text-blue-800 font-medium"
                        >
                          {caseItem.caseNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">{caseItem.year}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">{caseItem.policeStation}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">{caseItem.crimeHead}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">{caseItem.crimeSection}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadge(caseItem.caseStatus)}`}>
                          {caseItem.caseStatus}
                          {caseItem.caseStatus === "Under investigation" && caseItem.investigationStatus && ` (${caseItem.investigationStatus})`}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                        {caseItem.accused?.length || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/cases/${caseItem.caseNo.replace(/\//g, "-")}`}
                            className="text-blue-700 hover:text-blue-800"
                            title="View"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Link>
                          <Link
                            href={`/edit/${caseItem._id}`}
                            className="text-green-700 hover:text-green-800"
                            title="Edit"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(caseItem._id, caseItem.caseNo)}
                            disabled={deleteLoading === caseItem._id}
                            className="text-red-700 hover:text-red-800 disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteLoading === caseItem._id ? (
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

