"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

type AccusedStatus = "True" | "False" | "Decision Pending" | "Arrested" | "Not Arrested";

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
      caseStatus: "In-progress" as const,
    }),
    [caseNo]
  );

  const [activeTab, setActiveTab] = useState<
    "overview" | "accused" | "notices" | "prosecution" | "victim" | "reports"
  >("overview");

  const accused = [
    { name: "A1: Rakesh Kumar", status: "Arrested" as AccusedStatus, arrestedOn: "2025-01-02" },
    { name: "A2: Suman Verma", status: "Not Arrested" as AccusedStatus },
    { name: "A3: Unknown", status: "Decision Pending" as AccusedStatus },
  ];

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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-orange-100 text-orange-800 ring-orange-600/20">{summary.caseStatus}</span>
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-600/20">{summary.punishmentCategory}</span>
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
                  <li><strong className="font-medium">Status:</strong> {summary.caseStatus}</li>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {accused.map((a) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card title="Arrest / Notice / Warrant">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SubSection title="41A Notice">
                    <FieldRow label="Issued" value="Yes" />
                    <FieldRow label="Notice 1 - Date" value="2025-02-12" />
                    <FieldRow label="Notice 2 - Date" value="2025-02-28" />
                    <FieldRow label="Notice 3 - Date" value="—" />
                  </SubSection>
                  <SubSection title="Warrant">
                    <FieldRow label="Prayed" value="Yes" />
                    <FieldRow label="Date of Prayer" value="2025-03-05" />
                    <FieldRow label="Date of Receipt" value="2025-03-06" />
                    <FieldRow label="Date of Execution" value="—" />
                    <FieldRow label="Date of Return" value="—" />
                  </SubSection>
                  <SubSection title="Proclamation & Attachment">
                    <FieldRow label="Proclamation Prayed" value="No" />
                    <FieldRow label="Attachment Prayed" value="No" />
                  </SubSection>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "notices" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <FieldRow label="Date of Report" value="—" />
              </Card>
            </div>
          )}

          {activeTab === "victim" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Victim Documents">
                <FieldRow label="Injury Report" value="N/A" />
                <FieldRow label="PM Report" value="N/A" />
                <FieldRow label="Compensation Proposal" value="No" />
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Internal Reports">
                <FieldRow label="R1" value="2025-01-12" />
                <FieldRow label="Supervision" value="2025-02-01" />
                <FieldRow label="R2" value="—" />
                <FieldRow label="R3" value="—" />
                <FieldRow label="FPR" value="—" />
                <FieldRow label="Final Chargesheet" value="—" />
              </Card>
              <Card title="Reasons for Pendency">
                <FieldRow label="Diary No. & Date" value="—" />
                <FieldRow label="Reason" value="Awaiting prosecution sanction" />
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


