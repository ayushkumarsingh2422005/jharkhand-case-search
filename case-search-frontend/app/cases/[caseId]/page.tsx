"use client";
import { DecisionPendingStatus, deriveDecisionPendingStatus } from "@/lib/decisionPending";
import { generateCasePDF } from "@/lib/generateCasePDF";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "../../../components/AuthGuard";
import { useAuth } from "../../../contexts/AuthContext";

type AccusedStatus = "Arrested" | "Not arrested" | "Decision pending" | "Pending Verification";
type CaseStatus = "Disposed" | "Under investigation";
type InvestigationStatus = "Detected" | "Undetected";
type Priority = "Under monitoring" | "Normal";
type SrNsr = "SR" | "NSR";

type AccusedInfo = {
  name: string;
  status: AccusedStatus;
  address?: string;
  mobileNumber?: string;
  aadhaarNumber?: string;
  state?: string;
  district?: string;
  arrestedOn?: string;
  notice41A?: {
    issued: boolean;
    notice1Date?: string;
    notice2Date?: string;
    notice3Date?: string;
  };
  warrant?: {
    prayed: boolean;
    prayerDate?: string;
    receiptDate?: string;
    executionDate?: string;
    returnDate?: string;
  };
  proclamation?: {
    prayed: boolean;
    prayerDate?: string;
    receiptDate?: string;
    executionDate?: string;
    returnDate?: string;
  };
  attachment?: {
    prayed: boolean;
    prayerDate?: string;
    receiptDate?: string;
    executionDate?: string;
    returnDate?: string;
  };
  chargesheet?: {
    date?: string;
    file?: { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null;
  };
};

const REASON_FOR_PENDENCY_OPTIONS = [
  "Awaiting prosecution sanction",
  "Awaiting FSL report",
  "Awaiting charge sheet submission",
  "Awaiting court hearing",
  "Awaiting witness statement",
  "Awaiting medical report",
  "Awaiting investigation completion",
  "Other",
];

export default function CaseDetail() {
  const params = useParams<{ caseId: string | string[] | undefined }>();
  const { user } = useAuth();
  // Handle caseId which could be string, array, or undefined
  const caseId = Array.isArray(params?.caseId) ? params.caseId[0] : params?.caseId;
  const caseNo = caseId && typeof caseId === 'string' ? caseId.replaceAll("-", "/") : "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    if (caseId && typeof caseId === 'string') {
      fetchCase();
    } else {
      setError("Case ID is missing");
      setLoading(false);
    }
  }, [caseId]);

  const fetchCase = async () => {
    if (!caseId || typeof caseId !== 'string') {
      setError("Case ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/cases/${caseId}`);
      const data = await response.json();

      if (data.success) {
        setCaseData(data.data);
      } else {
        setError(data.error || "Failed to fetch case");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    if (!caseData) {
      const yearFromCaseNo = caseNo ? Number(caseNo.split("/")[1] || new Date().getFullYear()) : new Date().getFullYear();
      return {
        caseNo: caseNo || "",
        year: yearFromCaseNo,
        policeStation: "",
        crimeHead: "",
        section: "",
        punishmentCategory: ">7 yrs" as "≤7 yrs" | ">7 yrs",
        totalAccused: 0,
        caseStatus: "Under investigation" as CaseStatus,
        decisionPendingStatus: "Completed" as DecisionPendingStatus,
        caseDecisionStatus: undefined as string | undefined,
        investigationStatus: undefined as InvestigationStatus | undefined,
        srNsr: undefined as SrNsr | undefined,
        priority: "Normal" as Priority,
        isPropertyProfessionalCrime: false,
        petition: false,
        finalChargesheetSubmitted: false,
        finalChargesheetSubmissionDate: undefined as string | undefined,
      };
    }

    const yearFromCaseNo = caseNo ? Number(caseNo.split("/")[1] || new Date().getFullYear()) : new Date().getFullYear();
    return {
      caseNo: caseData.caseNo || caseNo || "",
      year: caseData.year || yearFromCaseNo,
      policeStation: caseData.policeStation || "",
      crimeHead: caseData.crimeHead || "",
      section: caseData.crimeSection || caseData.section || "",
      punishmentCategory: (caseData.punishmentCategory || ">7 yrs") as "≤7 yrs" | ">7 yrs",
      totalAccused: caseData.accused?.length || 0,
      caseStatus: ((caseData.caseStatus === "Decision Pending" ? "Under investigation" : caseData.caseStatus) || "Under investigation") as CaseStatus,
      decisionPendingStatus: deriveDecisionPendingStatus(caseData.accused || [], caseData.decisionPending),
      caseDecisionStatus: caseData.caseDecisionStatus as string | undefined,
      investigationStatus: caseData.investigationStatus as InvestigationStatus | undefined,
      srNsr: (caseData.srNsr as SrNsr | undefined),
      priority: (caseData.priority || "Normal") as Priority,
      isPropertyProfessionalCrime: caseData.isPropertyProfessionalCrime || false,
      petition: caseData.petition || false,
      finalChargesheetSubmitted: caseData.finalChargesheetSubmitted || false,
      finalChargesheetSubmissionDate: caseData.finalChargesheetSubmissionDate,
    };
  }, [caseData, caseNo]);

  const [activeTab, setActiveTab] = useState<
    "overview" | "accused" | "notices" | "prosecution" | "victim" | "reports" | "petition" | "notes"
  >("overview");

  const decisionStatusBadgeClass = (status: DecisionPendingStatus) => {
    switch (status) {
      case "Decision pending":
        return "bg-purple-100 text-purple-800 ring-purple-600/20";
      case "Partial":
        return "bg-amber-100 text-amber-800 ring-amber-600/20";
      case "Completed":
        return "bg-emerald-100 text-emerald-800 ring-emerald-600/20";
      default:
        return "bg-slate-100 text-slate-800 ring-slate-600/20";
    }
  };

  // Notes state (read-only)
  type Note = {
    id: string;
    content: string;
    author: string;
    createdAt: string;
  };

  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    if (caseData?._id) {
      const fetchNotes = async () => {
        try {
          setNotesLoading(true);
          const response = await fetch(`/api/notes?caseId=${caseData._id}`);
          const data = await response.json();

          if (data.success) {
            setNotes(data.data.map((note: any) => ({
              id: note._id,
              content: note.content,
              author: note.author,
              createdAt: note.createdAt,
            })));
          }
        } catch (error) {
          console.error("Failed to fetch notes:", error);
        } finally {
          setNotesLoading(false);
        }
      };
      fetchNotes();
    }
  }, [caseData?._id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrintPDF = () => {
    if (!caseData) {
      setError("Case data not available");
      return;
    }

    try {
      // Prepare case data for PDF generation - transform caseData to match PDF interface
      const pdfData = {
        caseNo: caseData.caseNo || caseNo || "",
        year: caseData.year || new Date().getFullYear(),
        policeStation: caseData.policeStation || "",
        crimeHead: caseData.crimeHead || "",
        crimeSection: caseData.crimeSection || caseData.section || "",
        punishmentCategory: caseData.punishmentCategory || ">7 yrs",
        caseDate: caseData.caseDate || "",
        caseStatus: caseData.caseStatus || "Under investigation",
        investigationStatus: caseData.investigationStatus || "",
        srNsr: caseData.srNsr || "",
        priority: caseData.priority || "Normal",
        isPropertyProfessionalCrime: caseData.isPropertyProfessionalCrime || false,
        petition: caseData.petition || false,
        reasonForPendency: caseData.reasonForPendency || [],
        diary: (caseData.diary || []).map((entry: any) => ({
          diaryNo: entry.diaryNo || "",
          diaryDate: entry.diaryDate ? new Date(entry.diaryDate).toISOString().split('T')[0] : "",
        })),
        reports: {
          spReports: (() => {
            const reportsData = caseData.reports || {};
            if (Array.isArray(reportsData.spReports) && reportsData.spReports.length > 0) {
              return reportsData.spReports.map((report: any) => ({
                label: report.label || "",
                date: report.date ? new Date(report.date).toISOString().split('T')[0] : "",
                file: report.file || null,
              })).filter((report: any) => report.label || report.date);
            }

            // Legacy support
            const legacySources = [
              { label: "R1", date: reportsData.r1 },
              { label: "R2", date: reportsData.r2 },
              { label: "R3", date: reportsData.r3 },
            ];

            return legacySources
              .filter(({ date }) => date)
              .map(({ label, date }) => ({
                label: label || "",
                date: date ? new Date(date).toISOString().split('T')[0] : "",
                file: null,
              }));
          })(),
          dspReports: (() => {
            const reportsData = caseData.reports || {};
            if (Array.isArray(reportsData.dspReports) && reportsData.dspReports.length > 0) {
              return reportsData.dspReports.map((report: any) => ({
                label: report.label || "",
                date: report.date ? new Date(report.date).toISOString().split('T')[0] : "",
                file: report.file || null,
              })).filter((report: any) => report.label || report.date);
            }

            // Legacy support
            const legacySources = [
              { label: "PR1", date: reportsData.pr1 },
              { label: "PR2", date: reportsData.pr2 },
              { label: "PR3", date: reportsData.pr3 },
            ];

            return legacySources
              .filter(({ date }) => date)
              .map(({ label, date }) => ({
                label: label || "",
                date: date ? new Date(date).toISOString().split('T')[0] : "",
                file: null,
              }));
          })(),
          supervision: caseData.reports?.supervision ? new Date(caseData.reports.supervision).toISOString().split('T')[0] : "",
          fpr: caseData.reports?.fpr ? new Date(caseData.reports.fpr).toISOString().split('T')[0] : "",
          finalOrder: caseData.reports?.finalOrder ? new Date(caseData.reports.finalOrder).toISOString().split('T')[0] : "",
          finalChargesheet: caseData.reports?.finalChargesheet ? new Date(caseData.reports.finalChargesheet).toISOString().split('T')[0] : "",
        },
        chargeSheet: {
          submitted: caseData.chargeSheet?.submitted || false,
          submissionDate: caseData.chargeSheet?.submissionDate ? new Date(caseData.chargeSheet.submissionDate).toISOString().split('T')[0] : "",
        },
        finalChargesheetSubmitted: caseData.finalChargesheetSubmitted || false,
        finalChargesheetSubmissionDate: caseData.finalChargesheetSubmissionDate ? new Date(caseData.finalChargesheetSubmissionDate).toISOString().split('T')[0] : "",
        prosecutionSanction: (caseData.prosecutionSanction || []).map((sanction: any) => ({
          type: sanction.type || "",
          submissionDate: sanction.submissionDate ? new Date(sanction.submissionDate).toISOString().split('T')[0] : "",
          receiptDate: sanction.receiptDate ? new Date(sanction.receiptDate).toISOString().split('T')[0] : "",
        })),
        fsl: (caseData.fsl || []).map((fslEntry: any) => ({
          reportRequired: fslEntry.reportRequired || false,
          sampleToBeCollected: fslEntry.sampleToBeCollected || "",
          sampleCollected: fslEntry.sampleCollected || false,
          sampleCollectionDate: fslEntry.sampleCollectionDate ? new Date(fslEntry.sampleCollectionDate).toISOString().split('T')[0] : "",
          sampleSendingDate: fslEntry.sampleSendingDate ? new Date(fslEntry.sampleSendingDate).toISOString().split('T')[0] : "",
          reportReceived: fslEntry.reportReceived || false,
          reportReceivedDate: fslEntry.reportReceivedDate ? new Date(fslEntry.reportReceivedDate).toISOString().split('T')[0] : "",
          reportDate: fslEntry.reportDate ? new Date(fslEntry.reportDate).toISOString().split('T')[0] : "",
        })),
        injuryReport: {
          report: caseData.injuryReport?.report || false,
          injuryType: caseData.injuryReport?.injuryType || "",
          injuryDate: caseData.injuryReport?.injuryDate ? new Date(caseData.injuryReport.injuryDate).toISOString().split('T')[0] : "",
          reportReceived: caseData.injuryReport?.reportReceived || false,
          reportDate: caseData.injuryReport?.reportDate ? new Date(caseData.injuryReport.reportDate).toISOString().split('T')[0] : "",
        },
        pmReport: {
          report: caseData.pmReport?.report || "",
          pmDate: caseData.pmReport?.pmDate ? new Date(caseData.pmReport.pmDate).toISOString().split('T')[0] : "",
          reportReceived: caseData.pmReport?.reportReceived || false,
          reportDate: caseData.pmReport?.reportDate ? new Date(caseData.pmReport.reportDate).toISOString().split('T')[0] : "",
        },
        compensationProposal: {
          required: caseData.compensationProposal?.required || false,
          submitted: caseData.compensationProposal?.submitted || false,
          submissionDate: caseData.compensationProposal?.submissionDate ? new Date(caseData.compensationProposal.submissionDate).toISOString().split('T')[0] : "",
        },
        accused: (caseData.accused || []).map((acc: any) => ({
          name: acc.name || "",
          status: acc.status || "Decision pending",
          address: acc.address || "",
          mobileNumber: acc.mobileNumber || "",
          aadhaarNumber: acc.aadhaarNumber || "",
          state: acc.state || "",
          district: acc.district || "",
          arrestedDate: acc.arrestedDate ? new Date(acc.arrestedDate).toISOString().split('T')[0] : "",
          arrestedOn: acc.arrestedOn ? new Date(acc.arrestedOn).toISOString().split('T')[0] : "",
          notice41A: acc.notice41A ? {
            issued: acc.notice41A.issued || false,
            notice1Date: acc.notice41A.notice1Date ? new Date(acc.notice41A.notice1Date).toISOString().split('T')[0] : "",
            notice2Date: acc.notice41A.notice2Date ? new Date(acc.notice41A.notice2Date).toISOString().split('T')[0] : "",
            notice3Date: acc.notice41A.notice3Date ? new Date(acc.notice41A.notice3Date).toISOString().split('T')[0] : "",
          } : undefined,
          warrant: acc.warrant ? {
            prayed: acc.warrant.prayed || false,
            prayerDate: acc.warrant.prayerDate ? new Date(acc.warrant.prayerDate).toISOString().split('T')[0] : "",
            receiptDate: acc.warrant.receiptDate ? new Date(acc.warrant.receiptDate).toISOString().split('T')[0] : "",
            executionDate: acc.warrant.executionDate ? new Date(acc.warrant.executionDate).toISOString().split('T')[0] : "",
            returnDate: acc.warrant.returnDate ? new Date(acc.warrant.returnDate).toISOString().split('T')[0] : "",
          } : undefined,
          proclamation: acc.proclamation ? {
            prayed: acc.proclamation.prayed || false,
            prayerDate: acc.proclamation.prayerDate ? new Date(acc.proclamation.prayerDate).toISOString().split('T')[0] : "",
            receiptDate: acc.proclamation.receiptDate ? new Date(acc.proclamation.receiptDate).toISOString().split('T')[0] : "",
            executionDate: acc.proclamation.executionDate ? new Date(acc.proclamation.executionDate).toISOString().split('T')[0] : "",
            returnDate: acc.proclamation.returnDate ? new Date(acc.proclamation.returnDate).toISOString().split('T')[0] : "",
          } : undefined,
          attachment: acc.attachment ? {
            prayed: acc.attachment.prayed || false,
            prayerDate: acc.attachment.prayerDate ? new Date(acc.attachment.prayerDate).toISOString().split('T')[0] : "",
            receiptDate: acc.attachment.receiptDate ? new Date(acc.attachment.receiptDate).toISOString().split('T')[0] : "",
            executionDate: acc.attachment.executionDate ? new Date(acc.attachment.executionDate).toISOString().split('T')[0] : "",
            returnDate: acc.attachment.returnDate ? new Date(acc.attachment.returnDate).toISOString().split('T')[0] : "",
          } : undefined,
        })),
        notes: notes.map((note) => ({
          content: note.content,
          author: note.author,
          createdAt: note.createdAt,
        })),
      };

      generateCasePDF(pdfData);
    } catch (err: any) {
      setError(err.message || "Failed to generate PDF");
    }
  };

  // Calculate chargesheet alert
  const chargesheetAlert = useMemo(() => {
    if (!caseData || caseData.finalChargesheetSubmitted) return null;

    const deadlineType = caseData.chargesheetDeadlineType || "60";
    const deadlineDays = parseInt(deadlineType);

    // Find earliest arrest date
    const arrestDates = (caseData.accused || [])
      .map((acc: any) => acc.arrestedDate || acc.arrestedOn)
      .filter((date: any) => date)
      .map((date: string) => new Date(date).getTime())
      .filter((timestamp: number) => !isNaN(timestamp));

    if (arrestDates.length === 0) return null;

    const earliestArrestDate = new Date(Math.min(...arrestDates));
    const deadlineDate = new Date(earliestArrestDate);
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
    };
  }, [caseData]);

  const accused: AccusedInfo[] = useMemo(() => {
    if (!caseData?.accused) return [];

    return caseData.accused.map((acc: any) => {
      // Normalize status to handle legacy values
      let normalizedStatus: AccusedStatus = "Decision pending";
      if (acc.status === "Arrested" || acc.status === "True") {
        normalizedStatus = "Arrested";
      } else if (acc.status === "Not arrested" || acc.status === "Not Arrested" || acc.status === "False") {
        normalizedStatus = "Not arrested";
      } else if (acc.status === "Decision pending" || acc.status === "Decision Pending") {
        normalizedStatus = "Decision pending";
      } else if (acc.status === "Pending Verification") {
        normalizedStatus = "Pending Verification";
      }

      return {
        name: acc.name || "",
        status: normalizedStatus,
        address: acc.address || "",
        mobileNumber: acc.mobileNumber || "",
        aadhaarNumber: acc.aadhaarNumber || "",
        state: acc.state || "",
        district: acc.district || "",
        arrestedOn: acc.arrestedDate || acc.arrestedOn,
        notice41A: acc.notice41A ? {
          issued: acc.notice41A.issued || false,
          notice1Date: acc.notice41A.notice1Date,
          notice2Date: acc.notice41A.notice2Date,
          notice3Date: acc.notice41A.notice3Date,
        } : undefined,
        warrant: acc.warrant ? {
          prayed: acc.warrant.prayed || false,
          prayerDate: acc.warrant.prayerDate,
          receiptDate: acc.warrant.receiptDate,
          executionDate: acc.warrant.executionDate,
          returnDate: acc.warrant.returnDate,
        } : undefined,
        proclamation: acc.proclamation ? {
          prayed: acc.proclamation.prayed || false,
          prayerDate: acc.proclamation.prayerDate,
          receiptDate: acc.proclamation.receiptDate,
          executionDate: acc.proclamation.executionDate,
          returnDate: acc.proclamation.returnDate,
        } : undefined,
        attachment: acc.attachment ? {
          prayed: acc.attachment.prayed || false,
          prayerDate: acc.attachment.prayerDate,
          receiptDate: acc.attachment.receiptDate,
          executionDate: acc.attachment.executionDate,
          returnDate: acc.attachment.returnDate,
        } : undefined,
        chargesheet: acc.chargesheet ? {
          date: acc.chargesheet.date,
          file: acc.chargesheet.file,
        } : undefined,
      };
    });
  }, [caseData]);

  const spReports = useMemo<
    Array<{ label: string; date: string; file: { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null }>
  >(() => {
    const reportsData = caseData?.reports;
    if (!reportsData) return [];

    if (Array.isArray(reportsData.spReports) && reportsData.spReports.length > 0) {
      return reportsData.spReports.map((report: any) => ({
        label: report.label || "",
        date: report.date || "",
        file: report.file || null,
      })).filter((report: { label: string; date: string; file: any }) => report.label || report.date);
    }

    // Legacy support: convert old pair structure to new structure
    const legacySources = [
      { label: "R1", date: reportsData.r1 },
      { label: "R2", date: reportsData.r2 },
      { label: "R3", date: reportsData.r3 },
    ];

    return legacySources
      .filter(({ date }) => date)
      .map(({ label, date }) => ({
        label: label || "",
        date: date || "",
        file: null,
      }));
  }, [caseData?.reports]);

  const dspReports = useMemo<
    Array<{ label: string; date: string; file: { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null }>
  >(() => {
    const reportsData = caseData?.reports;
    if (!reportsData) return [];

    if (Array.isArray(reportsData.dspReports) && reportsData.dspReports.length > 0) {
      return reportsData.dspReports.map((report: any) => ({
        label: report.label || "",
        date: report.date || "",
        file: report.file || null,
      })).filter((report: { label: string; date: string; file: any }) => report.label || report.date);
    }

    // Legacy support: convert old pair structure to new structure
    const legacySources = [
      { label: "PR1", date: reportsData.pr1 },
      { label: "PR2", date: reportsData.pr2 },
      { label: "PR3", date: reportsData.pr3 },
    ];

    return legacySources
      .filter(({ date }) => date)
      .map(({ label, date }) => ({
        label: label || "",
        date: date || "",
        file: null,
      }));
  }, [caseData?.reports]);

  // Calculate days passed after arrest
  const getDaysAfterArrest = (arrestedOn?: string) => {
    if (!arrestedOn) return null;
    const arrestDate = new Date(arrestedOn);
    const today = new Date();
    const diffTime = today.getTime() - arrestDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Charge sheet alert calculation
  const getChargesheetAlert = (arrestedOn?: string) => {
    if (!arrestedOn) return null;
    const days = getDaysAfterArrest(arrestedOn);
    if (!days) return null;

    // Alert at 50 days for 60-day deadline, 80 days for 90-day deadline
    const alert60 = days >= 50 && days < 60;
    const alert90 = days >= 80 && days < 90;

    if (alert60) return { type: "60-day", daysRemaining: 60 - days, alert: true };
    if (alert90) return { type: "90-day", daysRemaining: 90 - days, alert: true };
    if (days >= 60 && days < 90) return { type: "60-day", daysRemaining: 0, alert: true, overdue: true };
    if (days >= 90) return { type: "90-day", daysRemaining: 0, alert: true, overdue: true };

    return null;
  };

  const reasonForPendency = useMemo(() => {
    return caseData?.reasonForPendency || [];
  }, [caseData]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-8 text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-8 text-center">
          <p className="text-red-600 mb-4">{error || "Case not found"}</p>
          <Link href="/" className="text-blue-700 hover:underline">Back to Search</Link>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-slate-600">
          <Link href="/" className="text-blue-700 hover:underline">Search</Link>
          {user?.role === "SuperAdmin" && (
            <>
              <span className="mx-2">/</span>
              <Link href="/dashboard" className="text-blue-700 hover:underline">Dashboard</Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="font-medium">Case Detail</span>
        </div>

        {/* Chargesheet Alert */}
        {chargesheetAlert && (
          <div className={`mb-6 rounded-lg shadow-sm ring-1 overflow-hidden ${chargesheetAlert.isOverdue
            ? "bg-red-50 border-red-200 ring-red-300"
            : chargesheetAlert.daysRemaining <= 7
              ? "bg-orange-50 border-orange-200 ring-orange-300"
              : "bg-blue-50 border-blue-200 ring-blue-300"
            }`}>
            <div className="px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${chargesheetAlert.isOverdue
                    ? "bg-red-100 text-red-700"
                    : chargesheetAlert.daysRemaining <= 7
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                    }`}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${chargesheetAlert.isOverdue
                      ? "text-red-900"
                      : chargesheetAlert.daysRemaining <= 7
                        ? "text-orange-900"
                        : "text-blue-900"
                      }`}>
                      {chargesheetAlert.isOverdue
                        ? `Chargesheet Overdue by ${Math.abs(chargesheetAlert.daysRemaining)} days`
                        : `${chargesheetAlert.daysRemaining} days left to file chargesheet`}
                    </h3>
                    <p className={`text-sm mt-0.5 ${chargesheetAlert.isOverdue
                      ? "text-red-700"
                      : chargesheetAlert.daysRemaining <= 7
                        ? "text-orange-700"
                        : "text-blue-700"
                      }`}>
                      Deadline: {new Date(chargesheetAlert.deadlineDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} ({chargesheetAlert.deadlineType} days from earliest arrest)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Case Header */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-4 py-4 md:px-6 md:py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-semibold tracking-wide">Case {summary.caseNo}</h1>
              <p className="text-sm text-slate-600">{summary.policeStation} • {summary.section} • {summary.crimeHead}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePrintPDF}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print PDF
              </button>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${summary.caseStatus === "Disposed" ? "bg-green-100 text-green-800 ring-green-600/20" :
                  summary.caseStatus === "Under investigation" ? "bg-orange-100 text-orange-800 ring-orange-600/20" :
                    "bg-red-100 text-red-800 ring-red-600/20"
                  }`}>
                  {summary.caseStatus}
                  {summary.caseStatus === "Under investigation" && summary.investigationStatus && ` (${summary.investigationStatus})`}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${decisionStatusBadgeClass(summary.decisionPendingStatus)}`}>
                  {summary.decisionPendingStatus}
                </span>
                {summary.caseDecisionStatus && (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${summary.caseDecisionStatus === "True" ? "bg-green-100 text-green-800 ring-green-600/20" :
                    summary.caseDecisionStatus === "False" ? "bg-red-100 text-red-800 ring-red-600/20" :
                      summary.caseDecisionStatus === "Partial Pendency" ? "bg-yellow-100 text-yellow-800 ring-yellow-600/20" :
                        summary.caseDecisionStatus === "Complete Pendency" ? "bg-orange-100 text-orange-800 ring-orange-600/20" :
                          "bg-slate-100 text-slate-800 ring-slate-600/20"
                    }`}>
                    Case: {summary.caseDecisionStatus}
                  </span>
                )}
              </div>
              {summary.srNsr && (
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-indigo-50 text-indigo-700 ring-indigo-600/20">
                  {summary.srNsr}
                </span>
              )}
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-600/20">
                {summary.priority}
              </span>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-purple-50 text-purple-700 ring-purple-600/20">
                {summary.punishmentCategory}
              </span>
            </div>
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-slate-200">
            <Fact label="Year" value={String(summary.year)} />
            <Fact label="Police Station" value={summary.policeStation} />
            <Fact label="Total Accused" value={String(summary.totalAccused)} />
            <Fact label="Section" value={summary.section} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-white rounded-lg shadow-sm ring-1 ring-slate-200">
          <div className="px-4 md:px-6 border-b border-slate-200">
            <nav className="-mb-px flex flex-wrap gap-4 text-sm">
              {[
                { id: "overview", label: "Overview" },
                { id: "accused", label: "Accused" },
                { id: "notices", label: "Notices & Warrants" },
                { id: "prosecution", label: "Prosecution" },
                { id: "victim", label: "Victim" },
                { id: "reports", label: "Reports" },
                { id: "petition", label: "Petition" },
                { id: "notes", label: "Notes" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-3 border-b-2 ${activeTab === t.id ? "border-blue-800 text-blue-800" : "border-transparent text-slate-600 hover:text-slate-900"}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 md:p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Case Summary">
                  <ul className="text-sm space-y-2">
                    <li><strong className="font-medium">Crime Head:</strong> {summary.crimeHead}</li>
                    <li><strong className="font-medium">Section:</strong> {summary.section}</li>
                    <li><strong className="font-medium">Punishment:</strong> {summary.punishmentCategory}</li>
                    <li><strong className="font-medium">Status:</strong> {summary.caseStatus}{summary.caseStatus === "Under investigation" && summary.investigationStatus && ` (${summary.investigationStatus})`}</li>
                    <li><strong className="font-medium">Decision Status (Accused):</strong> {summary.decisionPendingStatus}</li>
                    {summary.caseDecisionStatus && <li><strong className="font-medium">Case Decision Status:</strong> {summary.caseDecisionStatus}</li>}
                    {summary.srNsr && <li><strong className="font-medium">SR/NSR:</strong> {summary.srNsr}</li>}
                    <li><strong className="font-medium">Priority:</strong> {summary.priority}</li>
                    <li><strong className="font-medium">Property/Professional Crime:</strong> {summary.isPropertyProfessionalCrime ? "Yes" : "No"}</li>
                  </ul>
                </Card>
                <Card title="Progress">
                  <ProgressRow
                    label="Arrest(s)"
                    value={`${accused.filter(a => a.status === "Arrested").length} of ${accused.length}`}
                  />
                  <ProgressRow
                    label="41A Notices"
                    value={`${accused.filter(a => a.notice41A?.issued).length} issued`}
                  />
                  <ProgressRow
                    label="Warrants"
                    value={`${accused.filter(a => a.warrant?.prayed).length} prayed`}
                  />
                  <ProgressRow
                    label="Chargesheet submitted in Court"
                    value={summary.finalChargesheetSubmitted ? "Submitted" : "Pending"}
                  />
                </Card>
              </div>
            )}

            {activeTab === "accused" && (
              <div className="space-y-6">
                <Card title="Accused List">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Name</th>
                        <th className="px-4 py-2 text-left font-medium">Status</th>
                        <th className="px-4 py-2 text-left font-medium">Address</th>
                        <th className="px-4 py-2 text-left font-medium">Mobile Number</th>
                        <th className="px-4 py-2 text-left font-medium">Aadhaar Number</th>
                        <th className="px-4 py-2 text-left font-medium">State</th>
                        <th className="px-4 py-2 text-left font-medium">District</th>
                        <th className="px-4 py-2 text-left font-medium">Arrest Date</th>
                        <th className="px-4 py-2 text-left font-medium">Days After Arrest</th>
                        <th className="px-4 py-2 text-left font-medium">Charge Sheet Alert</th>
                        <th className="px-4 py-2 text-left font-medium">Chargesheet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {accused.map((a) => {
                        const daysAfterArrest = getDaysAfterArrest(a.arrestedOn);
                        const alert = getChargesheetAlert(a.arrestedOn);
                        return (
                          <tr key={a.name} className="hover:bg-slate-50">
                            <td className="px-4 py-2">{a.name}</td>
                            <td className="px-4 py-2">
                              {a.status === "Decision pending" ? (
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-red-100 text-red-800 ring-red-600/20">Decision pending</span>
                              ) : a.status === "Arrested" ? (
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-green-100 text-green-800 ring-green-600/20">Arrested</span>
                              ) : a.status === "Not arrested" ? (
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-orange-100 text-orange-800 ring-orange-600/20">Not arrested</span>
                              ) : a.status === "Pending Verification" ? (
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-yellow-100 text-yellow-800 ring-yellow-600/20">Pending Verification</span>
                              ) : (
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-slate-100 text-slate-800 ring-slate-600/20">{a.status}</span>
                              )}
                            </td>
                            <td className="px-4 py-2">{a.address || "—"}</td>
                            <td className="px-4 py-2">{a.mobileNumber || "—"}</td>
                            <td className="px-4 py-2">{a.aadhaarNumber || "—"}</td>
                            <td className="px-4 py-2">{a.state || "—"}</td>
                            <td className="px-4 py-2">{a.district || "—"}</td>
                            <td className="px-4 py-2">{a.arrestedOn || "—"}</td>
                            <td className="px-4 py-2">
                              {daysAfterArrest !== null ? (
                                <span className="font-medium">{daysAfterArrest} days</span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {alert ? (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${alert.overdue ? "bg-red-100 text-red-800 ring-red-600/20" : "bg-yellow-100 text-yellow-800 ring-yellow-600/20"
                                  }`}>
                                  {alert.overdue ? `Overdue (${alert.type})` : `${alert.daysRemaining} days remaining (${alert.type})`}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col gap-1">
                                {a.chargesheet?.date && (
                                  <span className="text-xs text-slate-700">Date: {new Date(a.chargesheet.date).toLocaleDateString()}</span>
                                )}
                                {a.chargesheet?.file && (
                                  <a
                                    href={a.chargesheet.file.secure_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                  >
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    View File
                                  </a>
                                )}
                                {!a.chargesheet?.date && !a.chargesheet?.file && "—"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {activeTab === "notices" && (
              <div className="space-y-6">
                {accused.length === 0 ? (
                  <Card title="Notices & Warrants">
                    <p className="text-sm text-slate-500">No accused information available.</p>
                  </Card>
                ) : (
                  accused.map((acc) => (
                    <Card key={acc.name} title={`${acc.name} - Notices & Warrants`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SubSection title="41A Notice">
                          <FieldRow label="Issued" value={acc.notice41A?.issued ? "Yes" : "No"} />
                          {acc.notice41A?.issued && (
                            <>
                              <FieldRow label="Notice 1 - Date" value={acc.notice41A.notice1Date ? new Date(acc.notice41A.notice1Date).toLocaleDateString() : "—"} />
                              <FieldRow label="Notice 2 - Date" value={acc.notice41A.notice2Date ? new Date(acc.notice41A.notice2Date).toLocaleDateString() : "—"} />
                              <FieldRow label="Notice 3 - Date" value={acc.notice41A.notice3Date ? new Date(acc.notice41A.notice3Date).toLocaleDateString() : "—"} />
                            </>
                          )}
                        </SubSection>
                        <SubSection title="Warrant">
                          <FieldRow label="Prayed" value={acc.warrant?.prayed ? "Yes" : "No"} />
                          {acc.warrant?.prayed && (
                            <>
                              <FieldRow label="Date of Prayer" value={acc.warrant.prayerDate ? new Date(acc.warrant.prayerDate).toLocaleDateString() : "—"} />
                              <FieldRow label="Date of Receipt" value={acc.warrant.receiptDate ? new Date(acc.warrant.receiptDate).toLocaleDateString() : "—"} />
                              <FieldRow label="Date of Execution" value={acc.warrant.executionDate ? new Date(acc.warrant.executionDate).toLocaleDateString() : "—"} />
                              <FieldRow label="Date of Return" value={acc.warrant.returnDate ? new Date(acc.warrant.returnDate).toLocaleDateString() : "—"} />
                            </>
                          )}
                        </SubSection>
                        <SubSection title="Proclamation">
                          <FieldRow label="Prayed" value={acc.proclamation?.prayed ? "Yes" : "No"} />
                          {acc.proclamation?.prayed && (
                            <>
                              <FieldRow label="Date of Prayer" value={acc.proclamation.prayerDate ? new Date(acc.proclamation.prayerDate).toLocaleDateString() : "—"} />
                              <FieldRow label="Date of Receipt" value={acc.proclamation.receiptDate ? new Date(acc.proclamation.receiptDate).toLocaleDateString() : "—"} />
                              <FieldRow label="Date of Execution" value={acc.proclamation.executionDate ? new Date(acc.proclamation.executionDate).toLocaleDateString() : "—"} />
                              <FieldRow label="Date of Return" value={acc.proclamation.returnDate ? new Date(acc.proclamation.returnDate).toLocaleDateString() : "—"} />
                            </>
                          )}
                        </SubSection>
                        <SubSection title="Attachment">
                          <FieldRow label="Prayed" value={acc.attachment?.prayed ? "Yes" : "No"} />
                          {acc.attachment?.prayed && (
                            <>
                              <FieldRow label="Date of Prayer" value={acc.attachment.prayerDate ? new Date(acc.attachment.prayerDate).toLocaleDateString() : "—"} />
                              <FieldRow label="Date of Receipt" value={acc.attachment.receiptDate ? new Date(acc.attachment.receiptDate).toLocaleDateString() : "—"} />
                              <FieldRow label="Date of Execution" value={acc.attachment.executionDate ? new Date(acc.attachment.executionDate).toLocaleDateString() : "—"} />
                              <FieldRow label="Date of Return" value={acc.attachment.returnDate ? new Date(acc.attachment.returnDate).toLocaleDateString() : "—"} />
                            </>
                          )}
                        </SubSection>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === "prosecution" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Chargesheet submitted in VO">
                  <FieldRow label="Chargesheet submitted in VO" value={caseData?.chargeSheet?.submitted ? "Yes" : "No"} />
                  {caseData?.chargeSheet?.submitted && caseData?.chargeSheet?.submissionDate && (
                    <FieldRow label="Date of Submission (VO)" value={new Date(caseData.chargeSheet.submissionDate).toLocaleDateString()} />
                  )}
                  {caseData?.chargeSheet?.file && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Chargesheet File</label>
                      <a
                        href={caseData.chargeSheet.file.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {caseData.chargeSheet.file.original_filename || "View File"}
                      </a>
                    </div>
                  )}
                </Card>
                <Card title="Chargesheet submitted in Court">
                  <FieldRow label="Chargesheet submitted in Court" value={summary.finalChargesheetSubmitted ? "Yes" : "No"} />
                  {summary.finalChargesheetSubmitted && summary.finalChargesheetSubmissionDate && (
                    <FieldRow label="Date of Submission (Court)" value={new Date(summary.finalChargesheetSubmissionDate).toLocaleDateString()} />
                  )}
                </Card>
                <Card title="Prosecution Sanction">
                  {caseData?.prosecutionSanction && Array.isArray(caseData.prosecutionSanction) && caseData.prosecutionSanction.length > 0 ? (
                    <div className="space-y-4">
                      {caseData.prosecutionSanction.map((sanction: any, index: number) => (
                        <div key={sanction._id || index} className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Sanction {index + 1}</h4>
                          <FieldRow label="Type" value={sanction.type || "—"} />
                          {sanction.submissionDate && (
                            <FieldRow label="Date of Submission" value={new Date(sanction.submissionDate).toLocaleDateString()} />
                          )}
                          {sanction.receiptDate && (
                            <FieldRow label="Date of Receipt" value={new Date(sanction.receiptDate).toLocaleDateString()} />
                          )}
                          {sanction.file && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <label className="block text-xs font-medium text-slate-700 mb-1">File</label>
                              <a
                                href={sanction.file.secure_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {sanction.file.original_filename || "View File"}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No prosecution sanctions recorded</p>
                  )}
                </Card>
                <Card title="FSL / Forensic">
                  {caseData?.fsl && Array.isArray(caseData.fsl) && caseData.fsl.length > 0 ? (
                    <div className="space-y-4">
                      {caseData.fsl.map((fslEntry: any, index: number) => (
                        <div key={index} className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">FSL Report {index + 1}</h4>
                          <FieldRow label="FSL Report Required" value={fslEntry.reportRequired ? "Yes" : "No"} />
                          <FieldRow label="Sample to be Collected" value={fslEntry.sampleToBeCollected || "—"} />
                          <FieldRow label="Sample Collected" value={fslEntry.sampleCollected ? "Yes" : "No"} />
                          {fslEntry.sampleCollectionDate && (
                            <FieldRow label="Date of Sample Collection" value={new Date(fslEntry.sampleCollectionDate).toLocaleDateString()} />
                          )}
                          {fslEntry.sampleSendingDate && (
                            <FieldRow label="Date of Sample Sending" value={new Date(fslEntry.sampleSendingDate).toLocaleDateString()} />
                          )}
                          <FieldRow label="FSL Report Received" value={fslEntry.reportReceived ? "Yes" : "No"} />
                          {fslEntry.reportReceivedDate && (
                            <FieldRow label="Date of Report Received" value={new Date(fslEntry.reportReceivedDate).toLocaleDateString()} />
                          )}
                          {fslEntry.reportDate && (
                            <FieldRow label="Date of Report" value={new Date(fslEntry.reportDate).toLocaleDateString()} />
                          )}
                          {fslEntry.file && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <label className="block text-xs font-medium text-slate-700 mb-1">File</label>
                              <a
                                href={fslEntry.file.secure_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {fslEntry.file.original_filename || "View File"}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No FSL reports recorded</p>
                  )}
                </Card>
              </div>
            )}

            {activeTab === "victim" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Injury Report">
                  <FieldRow label="Report Required" value={caseData?.injuryReport?.report ? "Yes" : "No"} />
                  <FieldRow label="Injury Type" value={caseData?.injuryReport?.injuryType || "—"} />
                  {caseData?.injuryReport && (
                    <>
                      <FieldRow label="Date of Injury" value={caseData.injuryReport.injuryDate ? new Date(caseData.injuryReport.injuryDate).toLocaleDateString() : "—"} />
                      <FieldRow label="Report Received" value={caseData.injuryReport.reportReceived ? "Yes" : "No"} />
                      <FieldRow label="Date of Report" value={caseData.injuryReport.reportDate ? new Date(caseData.injuryReport.reportDate).toLocaleDateString() : "—"} />
                    </>
                  )}
                  {caseData?.injuryReport?.file && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Injury Report File</label>
                      <a
                        href={caseData.injuryReport.file.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {caseData.injuryReport.file.original_filename || "View File"}
                      </a>
                    </div>
                  )}
                </Card>
                <Card title="PM Report (Post Mortem)">
                  <FieldRow label="PM Report" value={caseData?.pmReport?.report || "N/A"} />
                  {caseData?.pmReport && (
                    <>
                      <FieldRow label="Date of PM" value={caseData.pmReport.pmDate ? new Date(caseData.pmReport.pmDate).toLocaleDateString() : "—"} />
                      <FieldRow label="Report Received" value={caseData.pmReport.reportReceived ? "Yes" : "No"} />
                      <FieldRow label="Date of Report" value={caseData.pmReport.reportDate ? new Date(caseData.pmReport.reportDate).toLocaleDateString() : "—"} />
                    </>
                  )}
                  {caseData?.pmReport?.file && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <label className="block text-xs font-medium text-slate-700 mb-1">PM Report File</label>
                      <a
                        href={caseData.pmReport.file.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {caseData.pmReport.file.original_filename || "View File"}
                      </a>
                    </div>
                  )}
                </Card>
                <Card title="Compensation Proposal">
                  <FieldRow label="Compensation Proposal Required" value={caseData?.compensationProposal?.required ? "Yes" : "No"} />
                  {caseData?.compensationProposal && (
                    <>
                      <FieldRow label="Compensation Proposal Submitted" value={caseData.compensationProposal.submitted ? "Yes" : "No"} />
                      <FieldRow label="Date of Submission" value={caseData.compensationProposal.submissionDate ? new Date(caseData.compensationProposal.submissionDate).toLocaleDateString() : "—"} />
                    </>
                  )}
                </Card>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Internal Reports">
                  <div className="space-y-4">
                    {/* SP Reports Section */}
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Reports by SP</span>
                      {spReports.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">No SP reports recorded.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {spReports.map((report, index) => (
                            <div key={index} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                                <span>{report.label || `R${index + 1}`}</span>
                                <span>{report.date ? new Date(report.date).toLocaleDateString() : "—"}</span>
                              </div>
                              {report.file && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <a
                                    href={report.file.secure_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {report.file.original_filename || "View File"}
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Supervision (after SP Reports) */}
                    <div className="space-y-2">
                      <FieldRow
                        label="Supervision"
                        value={caseData?.reports?.supervision ? new Date(caseData.reports.supervision).toLocaleDateString() : "—"}
                      />
                    </div>

                    {/* DSP Reports Section */}
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Reports by DSP</span>
                      {dspReports.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">No DSP reports recorded.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {dspReports.map((report, index) => (
                            <div key={index} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                                <span>{report.label || `PR${index + 1}`}</span>
                                <span>{report.date ? new Date(report.date).toLocaleDateString() : "—"}</span>
                              </div>
                              {report.file && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <a
                                    href={report.file.secure_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {report.file.original_filename || "View File"}
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Other Reports */}
                    <div className="space-y-2">
                      <FieldRow
                        label="FPR"
                        value={caseData?.reports?.fpr ? new Date(caseData.reports.fpr).toLocaleDateString() : "—"}
                      />
                      <FieldRow
                        label="Final Order"
                        value={caseData?.reports?.finalOrder ? new Date(caseData.reports.finalOrder).toLocaleDateString() : "—"}
                      />
                      <FieldRow
                        label="Final Chargesheet"
                        value={caseData?.reports?.finalChargesheet ? new Date(caseData.reports.finalChargesheet).toLocaleDateString() : "—"}
                      />
                    </div>
                    {caseData?.reports?.file && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <label className="block text-xs font-medium text-slate-700 mb-2">All Reports File</label>
                        <a
                          href={caseData.reports.file.secure_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {caseData.reports.file.original_filename || "View File"}
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
                <Card title="Reasons for Pendency">
                  <div className="space-y-4">
                    <div className="text-sm">
                      <span className="text-slate-600 font-medium">Diary Entries:</span>
                      {caseData?.diary && Array.isArray(caseData.diary) && caseData.diary.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {caseData.diary.map((diaryEntry: any, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              <span className="font-medium text-slate-900">
                                {diaryEntry.diaryNo || "—"}
                                {diaryEntry.diaryDate ? ` • ${new Date(diaryEntry.diaryDate).toLocaleDateString()}` : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-slate-500">No diary entries recorded</p>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-600 font-medium">Reason:</span>
                      {reasonForPendency.length === 0 ? (
                        <p className="mt-2 text-slate-500">No reasons specified</p>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {reasonForPendency.map((reason: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              <span className="font-medium text-slate-900">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "petition" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {caseData?.publicPetitionFile && (
                  <Card title="Public Petition File">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">File</label>
                      <a
                        href={caseData.publicPetitionFile.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {caseData.publicPetitionFile.original_filename || "View File"}
                      </a>
                    </div>
                  </Card>
                )}
                <Card title="Petition">
                  <FieldRow label="Petition" value={summary.petition ? "Yes" : "No"} />
                </Card>
              </div>
            )}

            {activeTab === "notes" && (
              <Card title={`Notes (${notes.length})`}>
                {notesLoading ? (
                  <div className="text-center py-8 text-slate-500">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-sm">Loading notes...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <p className="text-sm">No notes available for this case.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-slate-900">{note.author}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">{formatDate(note.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 md:px-6 border-slate-200 border-r last:border-r-0">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg ring-1 ring-slate-200">
      <div className="px-4 py-3 md:px-5 md:py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 text-sm font-medium">{title}</div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
