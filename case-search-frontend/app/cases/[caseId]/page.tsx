"use client";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";

type AccusedStatus = "True" | "False" | "Decision Pending" | "Arrested" | "Not Arrested";
type CaseStatus = "Disposed" | "Under investigation" | "Decision Pending";
type InvestigationStatus = "Detected" | "Undetected";
type Priority = "Under monitoring" | "Normal";

type AccusedInfo = {
  name: string;
  status: AccusedStatus;
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
        investigationStatus: undefined as InvestigationStatus | undefined,
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
      caseStatus: (caseData.caseStatus || "Under investigation") as CaseStatus,
      investigationStatus: caseData.investigationStatus as InvestigationStatus | undefined,
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

  const accused: AccusedInfo[] = useMemo(() => {
    if (!caseData?.accused) return [];
    
    return caseData.accused.map((acc: any) => ({
      name: acc.name || "",
      status: (acc.status || "Decision Pending") as AccusedStatus,
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
    }));
  }, [caseData]);

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
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-slate-600">
        <Link href="/" className="text-blue-700 hover:underline">Search</Link>
        <span className="mx-2">/</span>
        <Link href="/dashboard" className="text-blue-700 hover:underline">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="font-medium">Case Detail</span>
      </div>

      {/* Case Header */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="px-4 py-4 md:px-6 md:py-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-wide">Case {summary.caseNo}</h1>
            <p className="text-sm text-slate-600">{summary.policeStation} • {summary.section} • {summary.crimeHead}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
              summary.caseStatus === "Disposed" ? "bg-green-100 text-green-800 ring-green-600/20" :
              summary.caseStatus === "Under investigation" ? "bg-orange-100 text-orange-800 ring-orange-600/20" :
              "bg-red-100 text-red-800 ring-red-600/20"
            }`}>
              {summary.caseStatus}
              {summary.investigationStatus && ` (${summary.investigationStatus})`}
            </span>
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
                  <li><strong className="font-medium">Status:</strong> {summary.caseStatus} {summary.investigationStatus && `(${summary.investigationStatus})`}</li>
                  <li><strong className="font-medium">Priority:</strong> {summary.priority}</li>
                  <li><strong className="font-medium">Property/Professional Crime:</strong> {summary.isPropertyProfessionalCrime ? "Yes" : "No"}</li>
                </ul>
              </Card>
              <Card title="Progress">
                <ProgressRow 
                  label="Arrest(s)" 
                  value={`${accused.filter(a => a.status === "Arrested" || a.status === "True").length} of ${accused.length}`} 
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
                  label="Charge Sheet" 
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
                      <th className="px-4 py-2 text-left font-medium">Arrest Date</th>
                      <th className="px-4 py-2 text-left font-medium">Days After Arrest</th>
                      <th className="px-4 py-2 text-left font-medium">Charge Sheet Alert</th>
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
                            {a.status === "Decision Pending" ? (
                              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-red-100 text-red-800 ring-red-600/20">Decision Pending</span>
                            ) : a.status === "Arrested" ? (
                              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-green-100 text-green-800 ring-green-600/20">Arrested</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-orange-100 text-orange-800 ring-orange-600/20">Not Arrested</span>
                            )}
                          </td>
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
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                alert.overdue ? "bg-red-100 text-red-800 ring-red-600/20" : "bg-yellow-100 text-yellow-800 ring-yellow-600/20"
                              }`}>
                                {alert.overdue ? `Overdue (${alert.type})` : `${alert.daysRemaining} days remaining (${alert.type})`}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>

              {/* Accused-wise information */}
              {accused.map((acc) => (
                <Card key={acc.name} title={`${acc.name} - Arrest / Notice / Warrant`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SubSection title="41A Notice">
                      <FieldRow label="Issued" value={acc.notice41A?.issued ? "Yes" : "No"} />
                      {acc.notice41A?.issued && (
                        <>
                          <FieldRow label="Notice 1 - Date" value={acc.notice41A.notice1Date || "—"} />
                          <FieldRow label="Notice 2 - Date" value={acc.notice41A.notice2Date || "—"} />
                          <FieldRow label="Notice 3 - Date" value={acc.notice41A.notice3Date || "—"} />
                        </>
                      )}
                    </SubSection>
                    <SubSection title="Warrant">
                      <FieldRow label="Prayed" value={acc.warrant?.prayed ? "Yes" : "No"} />
                      {acc.warrant?.prayed && (
                        <>
                          <FieldRow label="Date of Prayer" value={acc.warrant.prayerDate || "—"} />
                          <FieldRow label="Date of Receipt" value={acc.warrant.receiptDate || "—"} />
                          <FieldRow label="Date of Execution" value={acc.warrant.executionDate || "—"} />
                          <FieldRow label="Date of Return" value={acc.warrant.returnDate || "—"} />
                        </>
                      )}
                    </SubSection>
                    <SubSection title="Proclamation">
                      <FieldRow label="Prayed" value={acc.proclamation?.prayed ? "Yes" : "No"} />
                      {acc.proclamation?.prayed && (
                        <>
                          <FieldRow label="Date of Prayer" value={acc.proclamation.prayerDate || "—"} />
                          <FieldRow label="Date of Receipt" value={acc.proclamation.receiptDate || "—"} />
                          <FieldRow label="Date of Execution" value={acc.proclamation.executionDate || "—"} />
                          <FieldRow label="Date of Return" value={acc.proclamation.returnDate || "—"} />
                        </>
                      )}
                    </SubSection>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "notices" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="41A Notice">
                <FieldRow label="Issued" value={caseData?.notice41A?.issued ? "Yes" : "No"} />
                {caseData?.notice41A?.issued && (
                  <>
                    <FieldRow label="Notice 1 - Date" value={caseData.notice41A.notice1Date ? new Date(caseData.notice41A.notice1Date).toLocaleDateString() : "—"} />
                    <FieldRow label="Notice 2 - Date" value={caseData.notice41A.notice2Date ? new Date(caseData.notice41A.notice2Date).toLocaleDateString() : "—"} />
                    <FieldRow label="Notice 3 - Date" value={caseData.notice41A.notice3Date ? new Date(caseData.notice41A.notice3Date).toLocaleDateString() : "—"} />
                  </>
                )}
              </Card>
              <Card title="Warrant">
                <FieldRow label="Prayed" value={caseData?.warrant?.prayed ? "Yes" : "No"} />
                {caseData?.warrant?.prayed && (
                  <>
                    <FieldRow label="Date of Prayer" value={caseData.warrant.prayerDate ? new Date(caseData.warrant.prayerDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Receipt" value={caseData.warrant.receiptDate ? new Date(caseData.warrant.receiptDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Execution" value={caseData.warrant.executionDate ? new Date(caseData.warrant.executionDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Return" value={caseData.warrant.returnDate ? new Date(caseData.warrant.returnDate).toLocaleDateString() : "—"} />
                  </>
                )}
              </Card>
              <Card title="Proclamation">
                <FieldRow label="Prayed" value={caseData?.proclamation?.prayed ? "Yes" : "No"} />
                {caseData?.proclamation?.prayed && (
                  <>
                    <FieldRow label="Date of Prayer" value={caseData.proclamation.prayerDate ? new Date(caseData.proclamation.prayerDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Receipt" value={caseData.proclamation.receiptDate ? new Date(caseData.proclamation.receiptDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Execution" value={caseData.proclamation.executionDate ? new Date(caseData.proclamation.executionDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Return" value={caseData.proclamation.returnDate ? new Date(caseData.proclamation.returnDate).toLocaleDateString() : "—"} />
                  </>
                )}
              </Card>
              <Card title="Attachment">
                <FieldRow label="Prayed" value={caseData?.attachment?.prayed ? "Yes" : "No"} />
                {caseData?.attachment?.prayed && (
                  <>
                    <FieldRow label="Date of Prayer" value={caseData.attachment.prayerDate ? new Date(caseData.attachment.prayerDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Receipt" value={caseData.attachment.receiptDate ? new Date(caseData.attachment.receiptDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Execution" value={caseData.attachment.executionDate ? new Date(caseData.attachment.executionDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Return" value={caseData.attachment.returnDate ? new Date(caseData.attachment.returnDate).toLocaleDateString() : "—"} />
                  </>
                )}
              </Card>
            </div>
          )}

          {activeTab === "prosecution" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Charge Sheet">
                <FieldRow label="Submitted" value={caseData?.chargeSheet?.submitted ? "Yes" : "No"} />
                {caseData?.chargeSheet?.submitted && (
                  <>
                    <FieldRow label="Date of Submission" value={caseData.chargeSheet.submissionDate ? new Date(caseData.chargeSheet.submissionDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Receipt" value={caseData.chargeSheet.receiptDate ? new Date(caseData.chargeSheet.receiptDate).toLocaleDateString() : "—"} />
                  </>
                )}
              </Card>
              <Card title="Final Charge Sheet Submission in Court">
                <FieldRow label="Submitted" value={summary.finalChargesheetSubmitted ? "Yes" : "No"} />
                {summary.finalChargesheetSubmitted && summary.finalChargesheetSubmissionDate && (
                  <FieldRow label="Date of Submission" value={new Date(summary.finalChargesheetSubmissionDate).toLocaleDateString()} />
                )}
              </Card>
              <Card title="Prosecution Sanction">
                <FieldRow label="Required" value={caseData?.prosecutionSanction?.required ? "Yes" : "No"} />
                {caseData?.prosecutionSanction?.submissionDate && (
                  <>
                    <FieldRow label="Date of Submission" value={new Date(caseData.prosecutionSanction.submissionDate).toLocaleDateString()} />
                    <FieldRow label="Date of Receipt" value={caseData.prosecutionSanction.receiptDate ? new Date(caseData.prosecutionSanction.receiptDate).toLocaleDateString() : "—"} />
                  </>
                )}
              </Card>
              <Card title="FSL / Forensic">
                <FieldRow label="FSL Report Required" value={caseData?.fsl?.reportRequired ? "Yes" : "No"} />
                {caseData?.fsl && (
                  <>
                    <FieldRow label="Sample to be Collected" value={caseData.fsl.sampleToBeCollected || "—"} />
                    <FieldRow label="Sample Collected" value={caseData.fsl.sampleCollected ? "Yes" : "No"} />
                    <FieldRow label="Date of Sample Collection" value={caseData.fsl.sampleCollectionDate ? new Date(caseData.fsl.sampleCollectionDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Sample Sending" value={caseData.fsl.sampleSendingDate ? new Date(caseData.fsl.sampleSendingDate).toLocaleDateString() : "—"} />
                    <FieldRow label="FSL Report Received" value={caseData.fsl.reportReceived ? "Yes" : "No"} />
                    <FieldRow label="Date of Report Received" value={caseData.fsl.reportReceivedDate ? new Date(caseData.fsl.reportReceivedDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Date of Report" value={caseData.fsl.reportDate ? new Date(caseData.fsl.reportDate).toLocaleDateString() : "—"} />
                  </>
                )}
              </Card>
            </div>
          )}

          {activeTab === "victim" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Injury Report">
                <FieldRow label="Injury Report" value={caseData?.injuryReport?.report ? "Yes" : "No"} />
                {caseData?.injuryReport && (
                  <>
                    <FieldRow label="Date of Injury" value={caseData.injuryReport.injuryDate ? new Date(caseData.injuryReport.injuryDate).toLocaleDateString() : "—"} />
                    <FieldRow label="Report Received" value={caseData.injuryReport.reportReceived ? "Yes" : "No"} />
                    <FieldRow label="Date of Report" value={caseData.injuryReport.reportDate ? new Date(caseData.injuryReport.reportDate).toLocaleDateString() : "—"} />
                  </>
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
                <FieldRow label="R1" value={caseData?.reports?.r1 ? new Date(caseData.reports.r1).toLocaleDateString() : "—"} />
                <FieldRow label="Supervision" value={caseData?.reports?.supervision ? new Date(caseData.reports.supervision).toLocaleDateString() : "—"} />
                <FieldRow label="R2" value={caseData?.reports?.r2 ? new Date(caseData.reports.r2).toLocaleDateString() : "—"} />
                <FieldRow label="R3" value={caseData?.reports?.r3 ? new Date(caseData.reports.r3).toLocaleDateString() : "—"} />
                <FieldRow label="PR1 (DSP)" value={caseData?.reports?.pr1 ? new Date(caseData.reports.pr1).toLocaleDateString() : "—"} />
                <FieldRow label="PR2 (DSP)" value={caseData?.reports?.pr2 ? new Date(caseData.reports.pr2).toLocaleDateString() : "—"} />
                <FieldRow label="PR3 (DSP)" value={caseData?.reports?.pr3 ? new Date(caseData.reports.pr3).toLocaleDateString() : "—"} />
                <FieldRow label="FPR" value={caseData?.reports?.fpr ? new Date(caseData.reports.fpr).toLocaleDateString() : "—"} />
                <FieldRow label="Final Order" value={caseData?.reports?.finalOrder ? new Date(caseData.reports.finalOrder).toLocaleDateString() : "—"} />
                <FieldRow label="Final Chargesheet" value={caseData?.reports?.finalChargesheet ? new Date(caseData.reports.finalChargesheet).toLocaleDateString() : "—"} />
              </Card>
              <Card title="Reasons for Pendency">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-slate-600 font-medium">Diary No. & Date:</span>
                    <span className="ml-2 font-medium text-slate-900">
                      {caseData?.diaryNo || "—"} {caseData?.diaryDate ? `• ${new Date(caseData.diaryDate).toLocaleDateString()}` : ""}
                    </span>
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
