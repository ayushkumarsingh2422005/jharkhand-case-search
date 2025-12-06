"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard } from "../../components/AuthGuard";
import { useAuth } from "../../contexts/AuthContext";

type CaseStatus = "Disposed" | "Under investigation";
type InvestigationStatus = "Detected" | "Undetected";
type Priority = "Under monitoring" | "Normal";

type AccusedStatus = "Arrested" | "Not arrested" | "Decision pending" | "Pending Verification";

type Accused = {
    name: string;
    status: AccusedStatus;
    arrestedDate?: string;
    arrestedOn?: string;
};

type CaseRow = {
    _id: string;
    caseNo: string;
    year: number;
    policeStation: string;
    crimeSection: string;
    accused: Accused[];
    caseStatus: CaseStatus;
    finalChargesheetSubmitted?: boolean;
    chargesheetDeadlineType?: string;
};

export default function ChargesheetStatusPage() {
    const { user } = useAuth();
    const [data, setData] = useState<CaseRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/cases?limit=1000");
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch cases:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to calculate chargesheet alert for a specific accused
    const calculateAccusedAlert = (row: CaseRow, accused: Accused) => {
        if (row.finalChargesheetSubmitted) return null;

        // Only calculate for arrested accused
        if (accused.status !== "Arrested") return null;

        const arrestDateStr = accused.arrestedDate || accused.arrestedOn;
        if (!arrestDateStr) return null;

        const deadlineType = row.chargesheetDeadlineType || "60";
        const deadlineDays = parseInt(deadlineType);

        const arrestDate = new Date(arrestDateStr);
        if (isNaN(arrestDate.getTime())) return null;

        const deadlineDate = new Date(arrestDate);
        deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);

        const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
            daysRemaining,
            deadlineDate: deadlineDate.toISOString().split('T')[0],
            deadlineType,
            isOverdue: daysRemaining < 0,
            arrestDate: arrestDate.toISOString().split('T')[0]
        };
    };

    const pendingAccusedList = useMemo(() => {
        const list: Array<{
            id: string; // unique id for key
            caseRow: CaseRow;
            accused: Accused;
            alert: NonNullable<ReturnType<typeof calculateAccusedAlert>>;
        }> = [];

        data.forEach(row => {
            if (row.finalChargesheetSubmitted) return;

            row.accused.forEach((acc, idx) => {
                const alert = calculateAccusedAlert(row, acc);
                if (alert) {
                    list.push({
                        id: `${row._id}-${idx}`,
                        caseRow: row,
                        accused: acc,
                        alert
                    });
                }
            });
        });

        return list.sort((a, b) => a.alert.daysRemaining - b.alert.daysRemaining);
    }, [data]);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50 pb-12">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-4">
                                <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <h1 className="text-xl font-bold text-slate-900">Pending Chargesheets (By Accused)</h1>
                            </div>
                            <div className="text-sm text-slate-500">
                                {pendingAccusedList.length} Accused Pending
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow ring-1 ring-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Accused Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Case Details</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Arrest Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {pendingAccusedList.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-slate-900">{item.accused.name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-900">Case {item.caseRow.caseNo}</span>
                                                        <span className="text-xs text-slate-500">{item.caseRow.policeStation}</span>
                                                        <span className="text-xs text-slate-500">{item.caseRow.crimeSection}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-700">{new Date(item.alert.arrestDate).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${item.alert.isOverdue
                                                        ? "bg-red-100 text-red-800 ring-red-600/20"
                                                        : item.alert.daysRemaining <= 7
                                                            ? "bg-orange-100 text-orange-800 ring-orange-600/20"
                                                            : "bg-blue-100 text-blue-800 ring-blue-600/20"
                                                        }`}>
                                                        {item.alert.isOverdue
                                                            ? `Overdue: ${Math.abs(item.alert.daysRemaining)}d (${item.alert.deadlineType})`
                                                            : `${item.alert.daysRemaining} days left (${item.alert.deadlineType})`}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        Deadline: {new Date(item.alert.deadlineDate).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={`/cases/${item.caseRow.caseNo.replace("/", "-")}`} className="text-blue-600 hover:text-blue-900">
                                                        View Case
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingAccusedList.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                    No pending chargesheets found for any accused.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
