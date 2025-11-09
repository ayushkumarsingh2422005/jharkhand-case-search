"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
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
  const params = useParams<{ caseId: string }>();
  const caseNo = (params?.caseId ?? "").toString().replaceAll("-", "/");

  // Demo data mapped from case number
  const summary = useMemo(
    () => ({
      caseNo,
      year: Number(caseNo.split("/")[1] || new Date().getFullYear()),
      policeStation: "Central PS",
      crimeHead: "Fraud",
      section: "420 IPC",
      punishmentCategory: ">7 yrs",
      totalAccused: 3,
      caseStatus: "Under investigation" as CaseStatus,
      investigationStatus: "Detected" as InvestigationStatus,
      priority: "Under monitoring" as Priority,
      isPropertyProfessionalCrime: true,
      petition: false,
      finalChargesheetSubmitted: false,
      finalChargesheetSubmissionDate: undefined as string | undefined,
    }),
    [caseNo]
  );

  const [activeTab, setActiveTab] = useState<
    "overview" | "accused" | "notices" | "prosecution" | "victim" | "reports" | "petition"
  >("overview");

  const accused: AccusedInfo[] = [
    {
      name: "A1: Rakesh Kumar",
      status: "Arrested",
      arrestedOn: "2025-01-02",
      notice41A: {
        issued: true,
        notice1Date: "2025-02-12",
        notice2Date: "2025-02-28",
      },
      warrant: {
        prayed: true,
        prayerDate: "2025-03-05",
        receiptDate: "2025-03-06",
      },
    },
    {
      name: "A2: Suman Verma",
      status: "Not Arrested",
      notice41A: {
        issued: true,
        notice1Date: "2025-02-15",
      },
    },
    {
      name: "A3: Unknown",
      status: "Decision Pending",
    },
  ];

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

  const reasonForPendency = ["Awaiting prosecution sanction", "Awaiting FSL report"];

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-slate-600">
        <Link href="/" className="text-blue-700 hover:underline">Search</Link>
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
                <ProgressRow label="Arrest(s)" value="1 of 3" />
                <ProgressRow label="41A Notices" value="2 issued" />
                <ProgressRow label="Warrants" value="1 prayed" />
                <ProgressRow label="Charge Sheet" value="Pending" />
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
                <FieldRow label="Issued" value="Yes" />
                <FieldRow label="Notice 1 - Date" value="2025-02-12" />
                <FieldRow label="Notice 2 - Date" value="2025-02-28" />
                <FieldRow label="Notice 3 - Date" value="—" />
              </Card>
              <Card title="Warrant">
                <FieldRow label="Prayed" value="Yes" />
                <FieldRow label="Date of Prayer" value="2025-03-05" />
                <FieldRow label="Date of Receipt" value="2025-03-06" />
                <FieldRow label="Date of Execution" value="—" />
                <FieldRow label="Date of Return" value="—" />
              </Card>
              <Card title="Proclamation">
                <FieldRow label="Prayed" value="Yes" />
                <FieldRow label="Date of Prayer" value="2025-03-10" />
                <FieldRow label="Date of Receipt" value="2025-03-12" />
                <FieldRow label="Date of Execution" value="—" />
                <FieldRow label="Date of Return" value="—" />
              </Card>
              <Card title="Attachment">
                <FieldRow label="Prayed" value="No" />
                <FieldRow label="Date of Prayer" value="—" />
                <FieldRow label="Date of Receipt" value="—" />
                <FieldRow label="Date of Execution" value="—" />
                <FieldRow label="Date of Return" value="—" />
              </Card>
            </div>
          )}

          {activeTab === "prosecution" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Charge Sheet">
                <FieldRow label="Submitted" value="No" />
                <FieldRow label="Date of Submission" value="—" />
                <FieldRow label="Date of Receipt" value="—" />
              </Card>
              <Card title="Final Charge Sheet Submission in Court">
                <FieldRow label="Submitted" value={summary.finalChargesheetSubmitted ? "Yes" : "No"} />
                {summary.finalChargesheetSubmitted && summary.finalChargesheetSubmissionDate && (
                  <FieldRow label="Date of Submission" value={summary.finalChargesheetSubmissionDate} />
                )}
              </Card>
              <Card title="Prosecution Sanction">
                <FieldRow label="Required" value="Yes" />
                <FieldRow label="Date of Submission" value="2025-02-02" />
                <FieldRow label="Date of Receipt" value="—" />
              </Card>
              <Card title="FSL / Forensic">
                <FieldRow label="FSL Report Required" value="Yes" />
                <FieldRow label="Sample to be Collected" value="Oral swab, 2 samples" />
                <FieldRow label="Sample Collected" value="Yes" />
                <FieldRow label="Date of Sample Collection" value="2025-02-18" />
                <FieldRow label="Date of Sample Sending" value="2025-02-19" />
                <FieldRow label="FSL Report Received" value="No" />
                <FieldRow label="Date of Report Received" value="—" />
                <FieldRow label="Date of Report" value="—" />
              </Card>
            </div>
          )}

          {activeTab === "victim" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Injury Report">
                <FieldRow label="Injury Report" value="Yes" />
                <FieldRow label="Date of Injury" value="2025-01-15" />
                <FieldRow label="Report Received" value="Yes" />
                <FieldRow label="Date of Report" value="2025-01-20" />
              </Card>
              <Card title="PM Report (Post Mortem)">
                <FieldRow label="PM Report" value="N/A" />
                <FieldRow label="Date of PM" value="—" />
                <FieldRow label="Report Received" value="—" />
                <FieldRow label="Date of Report" value="—" />
              </Card>
              <Card title="Compensation Proposal">
                <FieldRow label="Compensation Proposal Required" value="Yes" />
                <FieldRow label="Compensation Proposal Submitted" value="Yes" />
                <FieldRow label="Date of Submission" value="2025-02-10" />
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Internal Reports">
                <FieldRow label="R1" value="2025-01-12" />
                <FieldRow label="Supervision" value="2025-02-01" />
                <FieldRow label="R2" value="2025-02-15" />
                <FieldRow label="R3" value="—" />
                <FieldRow label="PR1 (DSP)" value="2025-02-20" />
                <FieldRow label="PR2 (DSP)" value="2025-03-01" />
                <FieldRow label="PR3 (DSP)" value="—" />
                <FieldRow label="FPR" value="2025-03-10" />
                <FieldRow label="Final Order" value="—" />
                <FieldRow label="Final Chargesheet" value="—" />
              </Card>
              <Card title="Reasons for Pendency">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-slate-600 font-medium">Diary No. & Date:</span>
                    <span className="ml-2 font-medium text-slate-900">—</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600 font-medium">Reason:</span>
                    <ul className="mt-2 space-y-1">
                      {reasonForPendency.map((reason, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          <span className="font-medium text-slate-900">{reason}</span>
                        </li>
                      ))}
                    </ul>
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
