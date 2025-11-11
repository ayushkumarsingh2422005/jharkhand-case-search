"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CaseStatus = "Disposed" | "Under investigation" | "Decision Pending";
type InvestigationStatus = "Detected" | "Undetected";
type Priority = "Under monitoring" | "Normal";
type AccusedStatus = "Arrested" | "Not arrested" | "Decision pending";

const POLICE_STATIONS = [
  "Central PS",
  "North Zone PS",
  "East Division PS",
  "South Sector PS",
  "Harbour PS",
  "Airport PS",
];

const CRIME_HEADS = [
  "Theft",
  "Robbery",
  "Assault",
  "Cyber Crime",
  "Narcotics",
  "Fraud",
];

export default function AddCase() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    caseNo: "",
    year: new Date().getFullYear(),
    policeStation: "",
    crimeHead: "",
    crimeSection: "",
    punishmentCategory: "≤7 yrs" as "≤7 yrs" | ">7 yrs",
    caseDate: "",
    caseStatus: "Under investigation" as CaseStatus,
    investigationStatus: "" as InvestigationStatus | "",
    priority: "Normal" as Priority,
    isPropertyProfessionalCrime: false,
    petition: false,
    reasonForPendency: [] as string[],
    diaryNo: "",
    diaryDate: "",
    warrant: {
      prayed: false,
      prayerDate: "",
      receiptDate: "",
      executionDate: "",
      returnDate: "",
    },
    proclamation: {
      prayed: false,
      prayerDate: "",
      receiptDate: "",
      executionDate: "",
      returnDate: "",
    },
    attachment: {
      prayed: false,
      prayerDate: "",
      receiptDate: "",
      executionDate: "",
      returnDate: "",
    },
    notice41A: {
      issued: false,
      notice1Date: "",
      notice2Date: "",
      notice3Date: "",
    },
    reports: {
      r1: "",
      supervision: "",
      r2: "",
      r3: "",
      pr1: "",
      pr2: "",
      pr3: "",
      fpr: "",
      finalOrder: "",
      finalChargesheet: "",
    },
    chargeSheet: {
      submitted: false,
      submissionDate: "",
      receiptDate: "",
    },
    finalChargesheetSubmitted: false,
    finalChargesheetSubmissionDate: "",
    prosecutionSanction: {
      required: false,
      submissionDate: "",
      receiptDate: "",
    },
    fsl: {
      reportRequired: false,
      sampleToBeCollected: "",
      sampleCollected: false,
      sampleCollectionDate: "",
      sampleSendingDate: "",
      reportReceived: false,
      reportReceivedDate: "",
      reportDate: "",
    },
    injuryReport: {
      report: false,
      injuryDate: "",
      reportReceived: false,
      reportDate: "",
    },
    pmReport: {
      report: "" as "Yes" | "No" | "N/A" | "",
      pmDate: "",
      reportReceived: false,
      reportDate: "",
    },
    compensationProposal: {
      required: false,
      submitted: false,
      submissionDate: "",
    },
    accused: [] as Array<{
      name: string;
      status: AccusedStatus;
      arrestedDate?: string;
      arrestedOn?: string;
      notice41A?: {
        issued?: boolean;
        notice1Date?: string;
        notice2Date?: string;
        notice3Date?: string;
      };
      warrant?: {
        prayed?: boolean;
        prayerDate?: string;
        receiptDate?: string;
        executionDate?: string;
        returnDate?: string;
      };
      proclamation?: {
        prayed?: boolean;
        prayerDate?: string;
        receiptDate?: string;
        executionDate?: string;
        returnDate?: string;
      };
      attachment?: {
        prayed?: boolean;
        prayerDate?: string;
        receiptDate?: string;
        executionDate?: string;
        returnDate?: string;
      };
    }>,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "year") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || new Date().getFullYear() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addAccused = () => {
    setFormData(prev => ({
      ...prev,
      accused: [...prev.accused, { name: "", status: "Decision pending" as AccusedStatus }],
    }));
  };

  const updateAccused = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      accused: prev.accused.map((acc, i) =>
        i === index ? { ...acc, [field]: value } : acc
      ),
    }));
  };

  const updateAccusedNotice41A = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      accused: prev.accused.map((acc, i) => {
        if (i === index) {
          return {
            ...acc,
            notice41A: {
              ...(acc.notice41A || {}),
              [field]: value,
            },
          };
        }
        return acc;
      }),
    }));
  };

  const updateAccusedLegalProcess = (index: number, processType: 'warrant' | 'proclamation' | 'attachment', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      accused: prev.accused.map((acc, i) => {
        if (i === index) {
          return {
            ...acc,
            [processType]: {
              ...(acc[processType] || {}),
              [field]: value,
            },
          };
        }
        return acc;
      }),
    }));
  };

  const updateCaseLegalProcess = (processType: 'warrant' | 'proclamation' | 'attachment', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [processType]: {
        ...(prev[processType] || {}),
        [field]: value,
      },
    }));
  };

  const updateCaseNotice41A = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      notice41A: {
        ...(prev.notice41A || {}),
        [field]: value,
      },
    }));
  };

  const updateReports = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      reports: {
        ...(prev.reports || {}),
        [field]: value,
      },
    }));
  };

  const updateChargeSheet = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      chargeSheet: {
        ...(prev.chargeSheet || {}),
        [field]: value,
      },
    }));
  };

  const updateProsecutionSanction = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      prosecutionSanction: {
        ...(prev.prosecutionSanction || {}),
        [field]: value,
      },
    }));
  };

  const updateFSL = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      fsl: {
        ...(prev.fsl || {}),
        [field]: value,
      },
    }));
  };

  const updateInjuryReport = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      injuryReport: {
        ...(prev.injuryReport || {}),
        [field]: value,
      },
    }));
  };

  const updatePMReport = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      pmReport: {
        ...(prev.pmReport || {}),
        [field]: value,
      },
    }));
  };

  const updateCompensationProposal = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      compensationProposal: {
        ...(prev.compensationProposal || {}),
        [field]: value,
      },
    }));
  };

  const removeAccused = (index: number) => {
    setFormData(prev => ({
      ...prev,
      accused: prev.accused.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Clean up form data - remove empty strings from date fields in nested objects
      const cleanNestedDates = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value === '' && (key.includes('Date') || key.includes('date'))) {
            continue; // Skip empty date strings
          } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            cleaned[key] = cleanNestedDates(value);
          } else if (Array.isArray(value)) {
            cleaned[key] = value.map(item => 
              typeof item === 'object' && item !== null ? cleanNestedDates(item) : item
            );
          } else {
            cleaned[key] = value;
          }
        }
        return cleaned;
      };

      const cleanedData = cleanNestedDates({
        ...formData,
        investigationStatus: formData.investigationStatus || undefined,
        pmReport: {
          ...formData.pmReport,
          report: formData.pmReport.report || undefined,
        },
      });

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create case");
      }

      router.push(`/dashboard`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-slate-600">
        <Link href="/" className="text-blue-700 hover:underline">Search</Link>
        <span className="mx-2">/</span>
        <Link href="/dashboard" className="text-blue-700 hover:underline">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="font-medium">Add Case</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden mb-6">
        <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600/10 text-blue-700 grid place-content-center">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold tracking-wide">Add New Case</h2>
              <p className="text-xs md:text-sm text-slate-600">Enter case details below</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-4 md:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Number *</label>
                <input
                  type="text"
                  name="caseNo"
                  value={formData.caseNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="e.g., 77/2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Police Station *</label>
                <input
                  list="ps-list"
                  name="policeStation"
                  value={formData.policeStation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="Select or type"
                />
                <datalist id="ps-list">
                  {POLICE_STATIONS.map((ps) => (
                    <option key={ps} value={ps} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Crime Head *</label>
                <input
                  list="crime-heads"
                  name="crimeHead"
                  value={formData.crimeHead}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="Select or type"
                />
                <datalist id="crime-heads">
                  {CRIME_HEADS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Section *</label>
                <input
                  type="text"
                  name="crimeSection"
                  value={formData.crimeSection}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="e.g., 420 IPC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Punishment Category *</label>
                <select
                  name="punishmentCategory"
                  value={formData.punishmentCategory}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  <option value="≤7 yrs">≤7 Years</option>
                  <option value=">7 yrs">{" >7 Years"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Date</label>
                <input
                  type="date"
                  name="caseDate"
                  value={formData.caseDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Status *</label>
                <select
                  name="caseStatus"
                  value={formData.caseStatus}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  <option value="Under investigation">Under investigation</option>
                  <option value="Disposed">Disposed</option>
                  <option value="Decision Pending">Decision Pending</option>
                </select>
              </div>
              {formData.caseStatus === "Under investigation" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Investigation Status</label>
                  <select
                    name="investigationStatus"
                    value={formData.investigationStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  >
                    <option value="">Select status</option>
                    <option value="Detected">Detected</option>
                    <option value="Undetected">Undetected</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  <option value="Normal">Normal</option>
                  <option value="Under monitoring">Under monitoring</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Property/Professional Crime</label>
                <label className="inline-flex items-center gap-2 text-sm pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPropertyProfessionalCrime"
                    checked={formData.isPropertyProfessionalCrime}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Identify property/professional crimes
                </label>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Petition</label>
                <label className="inline-flex items-center gap-2 text-sm pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="petition"
                    checked={formData.petition}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Case has petition
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Diary Number</label>
                <input
                  type="text"
                  name="diaryNo"
                  value={formData.diaryNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="Enter diary number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Diary Date</label>
                <input
                  type="date"
                  name="diaryDate"
                  value={formData.diaryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
            </div>
          </div>

          {/* Accused Information */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Accused Information
              </h3>
              <button
                type="button"
                onClick={addAccused}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Accused
              </button>
            </div>

            {formData.accused.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No accused added yet. Click "Add Accused" to add one.</p>
            ) : (
              <div className="space-y-4">
                {formData.accused.map((accused, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-medium text-slate-700">Accused {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeAccused(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={accused.name}
                          onChange={(e) => updateAccused(index, "name", e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Status *</label>
                        <select
                          value={accused.status}
                          onChange={(e) => updateAccused(index, "status", e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                        >
                          <option value="Decision pending">Decision pending</option>
                          <option value="Arrested">Arrested</option>
                          <option value="Not arrested">Not arrested</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Arrest Date</label>
                        <input
                          type="date"
                          value={accused.arrestedDate || ""}
                          onChange={(e) => updateAccused(index, "arrestedDate", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Arrested On</label>
                        <input
                          type="date"
                          value={accused.arrestedOn || ""}
                          onChange={(e) => updateAccused(index, "arrestedOn", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                        />
                      </div>
                    </div>
                    {/* Notice 41A Section */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-semibold text-slate-700 mb-3">Notice 41A</h5>
                      <div className="space-y-3">
                        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={accused.notice41A?.issued || false}
                            onChange={(e) => updateAccusedNotice41A(index, "issued", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Notice 41A Issued
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Notice 1 Date</label>
                            <input
                              type="date"
                              value={accused.notice41A?.notice1Date || ""}
                              onChange={(e) => updateAccusedNotice41A(index, "notice1Date", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Notice 2 Date</label>
                            <input
                              type="date"
                              value={accused.notice41A?.notice2Date || ""}
                              onChange={(e) => updateAccusedNotice41A(index, "notice2Date", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Notice 3 Date</label>
                            <input
                              type="date"
                              value={accused.notice41A?.notice3Date || ""}
                              onChange={(e) => updateAccusedNotice41A(index, "notice3Date", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Warrant Section */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-semibold text-slate-700 mb-3">Warrant</h5>
                      <div className="space-y-3">
                        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={accused.warrant?.prayed || false}
                            onChange={(e) => updateAccusedLegalProcess(index, "warrant", "prayed", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Warrant Prayed
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Prayer Date</label>
                            <input
                              type="date"
                              value={accused.warrant?.prayerDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "warrant", "prayerDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Receipt Date</label>
                            <input
                              type="date"
                              value={accused.warrant?.receiptDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "warrant", "receiptDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Execution Date</label>
                            <input
                              type="date"
                              value={accused.warrant?.executionDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "warrant", "executionDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Return Date</label>
                            <input
                              type="date"
                              value={accused.warrant?.returnDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "warrant", "returnDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Proclamation Section */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-semibold text-slate-700 mb-3">Proclamation</h5>
                      <div className="space-y-3">
                        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={accused.proclamation?.prayed || false}
                            onChange={(e) => updateAccusedLegalProcess(index, "proclamation", "prayed", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Proclamation Prayed
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Prayer Date</label>
                            <input
                              type="date"
                              value={accused.proclamation?.prayerDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "proclamation", "prayerDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Receipt Date</label>
                            <input
                              type="date"
                              value={accused.proclamation?.receiptDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "proclamation", "receiptDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Execution Date</label>
                            <input
                              type="date"
                              value={accused.proclamation?.executionDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "proclamation", "executionDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Return Date</label>
                            <input
                              type="date"
                              value={accused.proclamation?.returnDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "proclamation", "returnDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Attachment Section */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-semibold text-slate-700 mb-3">Attachment</h5>
                      <div className="space-y-3">
                        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={accused.attachment?.prayed || false}
                            onChange={(e) => updateAccusedLegalProcess(index, "attachment", "prayed", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Attachment Prayed
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Prayer Date</label>
                            <input
                              type="date"
                              value={accused.attachment?.prayerDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "attachment", "prayerDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Receipt Date</label>
                            <input
                              type="date"
                              value={accused.attachment?.receiptDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "attachment", "receiptDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Execution Date</label>
                            <input
                              type="date"
                              value={accused.attachment?.executionDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "attachment", "executionDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Return Date</label>
                            <input
                              type="date"
                              value={accused.attachment?.returnDate || ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "attachment", "returnDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Case-Level Legal Processes */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Case-Level Legal Processes
            </h3>

            <div className="space-y-6">
              {/* Case-Level Notice 41A */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 mb-3">Notice 41A (Case-Level)</h4>
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notice41A.issued}
                      onChange={(e) => updateCaseNotice41A("issued", e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Notice 41A Issued
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Notice 1 Date</label>
                      <input
                        type="date"
                        value={formData.notice41A.notice1Date}
                        onChange={(e) => updateCaseNotice41A("notice1Date", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Notice 2 Date</label>
                      <input
                        type="date"
                        value={formData.notice41A.notice2Date}
                        onChange={(e) => updateCaseNotice41A("notice2Date", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Notice 3 Date</label>
                      <input
                        type="date"
                        value={formData.notice41A.notice3Date}
                        onChange={(e) => updateCaseNotice41A("notice3Date", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Case-Level Warrant */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 mb-3">Warrant (Case-Level)</h4>
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.warrant.prayed}
                      onChange={(e) => updateCaseLegalProcess("warrant", "prayed", e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Warrant Prayed
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Prayer Date</label>
                      <input
                        type="date"
                        value={formData.warrant.prayerDate}
                        onChange={(e) => updateCaseLegalProcess("warrant", "prayerDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Receipt Date</label>
                      <input
                        type="date"
                        value={formData.warrant.receiptDate}
                        onChange={(e) => updateCaseLegalProcess("warrant", "receiptDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Execution Date</label>
                      <input
                        type="date"
                        value={formData.warrant.executionDate}
                        onChange={(e) => updateCaseLegalProcess("warrant", "executionDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Return Date</label>
                      <input
                        type="date"
                        value={formData.warrant.returnDate}
                        onChange={(e) => updateCaseLegalProcess("warrant", "returnDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Case-Level Proclamation */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 mb-3">Proclamation (Case-Level)</h4>
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.proclamation.prayed}
                      onChange={(e) => updateCaseLegalProcess("proclamation", "prayed", e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Proclamation Prayed
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Prayer Date</label>
                      <input
                        type="date"
                        value={formData.proclamation.prayerDate}
                        onChange={(e) => updateCaseLegalProcess("proclamation", "prayerDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Receipt Date</label>
                      <input
                        type="date"
                        value={formData.proclamation.receiptDate}
                        onChange={(e) => updateCaseLegalProcess("proclamation", "receiptDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Execution Date</label>
                      <input
                        type="date"
                        value={formData.proclamation.executionDate}
                        onChange={(e) => updateCaseLegalProcess("proclamation", "executionDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Return Date</label>
                      <input
                        type="date"
                        value={formData.proclamation.returnDate}
                        onChange={(e) => updateCaseLegalProcess("proclamation", "returnDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Case-Level Attachment */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 mb-3">Attachment (Case-Level)</h4>
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.attachment.prayed}
                      onChange={(e) => updateCaseLegalProcess("attachment", "prayed", e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Attachment Prayed
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Prayer Date</label>
                      <input
                        type="date"
                        value={formData.attachment.prayerDate}
                        onChange={(e) => updateCaseLegalProcess("attachment", "prayerDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Receipt Date</label>
                      <input
                        type="date"
                        value={formData.attachment.receiptDate}
                        onChange={(e) => updateCaseLegalProcess("attachment", "receiptDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Execution Date</label>
                      <input
                        type="date"
                        value={formData.attachment.executionDate}
                        onChange={(e) => updateCaseLegalProcess("attachment", "executionDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Return Date</label>
                      <input
                        type="date"
                        value={formData.attachment.returnDate}
                        onChange={(e) => updateCaseLegalProcess("attachment", "returnDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Reports
            </h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">R1 Date</label>
                  <input
                    type="date"
                    value={formData.reports.r1}
                    onChange={(e) => updateReports("r1", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Supervision Date</label>
                  <input
                    type="date"
                    value={formData.reports.supervision}
                    onChange={(e) => updateReports("supervision", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">R2 Date</label>
                  <input
                    type="date"
                    value={formData.reports.r2}
                    onChange={(e) => updateReports("r2", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">R3 Date</label>
                  <input
                    type="date"
                    value={formData.reports.r3}
                    onChange={(e) => updateReports("r3", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">PR1 Date</label>
                  <input
                    type="date"
                    value={formData.reports.pr1}
                    onChange={(e) => updateReports("pr1", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">PR2 Date</label>
                  <input
                    type="date"
                    value={formData.reports.pr2}
                    onChange={(e) => updateReports("pr2", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">PR3 Date</label>
                  <input
                    type="date"
                    value={formData.reports.pr3}
                    onChange={(e) => updateReports("pr3", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">FPR Date</label>
                  <input
                    type="date"
                    value={formData.reports.fpr}
                    onChange={(e) => updateReports("fpr", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Final Order Date</label>
                  <input
                    type="date"
                    value={formData.reports.finalOrder}
                    onChange={(e) => updateReports("finalOrder", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Final Chargesheet Date</label>
                  <input
                    type="date"
                    value={formData.reports.finalChargesheet}
                    onChange={(e) => updateReports("finalChargesheet", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Charge Sheet Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Charge Sheet
            </h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.chargeSheet.submitted}
                    onChange={(e) => updateChargeSheet("submitted", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Charge Sheet Submitted
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Submission Date</label>
                    <input
                      type="date"
                      value={formData.chargeSheet.submissionDate}
                      onChange={(e) => updateChargeSheet("submissionDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Receipt Date</label>
                    <input
                      type="date"
                      value={formData.chargeSheet.receiptDate}
                      onChange={(e) => updateChargeSheet("receiptDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="finalChargesheetSubmitted"
                    checked={formData.finalChargesheetSubmitted}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Final Chargesheet Submitted
                </label>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Final Chargesheet Submission Date</label>
                  <input
                    type="date"
                    name="finalChargesheetSubmissionDate"
                    value={formData.finalChargesheetSubmissionDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Prosecution Sanction Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
              </svg>
              Prosecution Sanction
            </h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.prosecutionSanction.required}
                    onChange={(e) => updateProsecutionSanction("required", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Prosecution Sanction Required
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Submission Date</label>
                    <input
                      type="date"
                      value={formData.prosecutionSanction.submissionDate}
                      onChange={(e) => updateProsecutionSanction("submissionDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Receipt Date</label>
                    <input
                      type="date"
                      value={formData.prosecutionSanction.receiptDate}
                      onChange={(e) => updateProsecutionSanction("receiptDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FSL/Forensic Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              FSL/Forensic
            </h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fsl.reportRequired}
                    onChange={(e) => updateFSL("reportRequired", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Report Required
                </label>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Sample To Be Collected</label>
                  <input
                    type="text"
                    value={formData.fsl.sampleToBeCollected}
                    onChange={(e) => updateFSL("sampleToBeCollected", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter sample type"
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fsl.sampleCollected}
                    onChange={(e) => updateFSL("sampleCollected", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Sample Collected
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Sample Collection Date</label>
                    <input
                      type="date"
                      value={formData.fsl.sampleCollectionDate}
                      onChange={(e) => updateFSL("sampleCollectionDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Sample Sending Date</label>
                    <input
                      type="date"
                      value={formData.fsl.sampleSendingDate}
                      onChange={(e) => updateFSL("sampleSendingDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Report Date</label>
                    <input
                      type="date"
                      value={formData.fsl.reportDate}
                      onChange={(e) => updateFSL("reportDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fsl.reportReceived}
                      onChange={(e) => updateFSL("reportReceived", e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Report Received
                  </label>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Report Received Date</label>
                    <input
                      type="date"
                      value={formData.fsl.reportReceivedDate}
                      onChange={(e) => updateFSL("reportReceivedDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Injury Report Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Injury Report
            </h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.injuryReport.report}
                    onChange={(e) => updateInjuryReport("report", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Report Available
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Injury Date</label>
                    <input
                      type="date"
                      value={formData.injuryReport.injuryDate}
                      onChange={(e) => updateInjuryReport("injuryDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Report Date</label>
                    <input
                      type="date"
                      value={formData.injuryReport.reportDate}
                      onChange={(e) => updateInjuryReport("reportDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.injuryReport.reportReceived}
                    onChange={(e) => updateInjuryReport("reportReceived", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Report Received
                </label>
              </div>
            </div>
          </div>

          {/* PM Report Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              PM Report
            </h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Report</label>
                  <select
                    value={formData.pmReport.report}
                    onChange={(e) => updatePMReport("report", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">PM Date</label>
                    <input
                      type="date"
                      value={formData.pmReport.pmDate}
                      onChange={(e) => updatePMReport("pmDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Report Date</label>
                    <input
                      type="date"
                      value={formData.pmReport.reportDate}
                      onChange={(e) => updatePMReport("reportDate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pmReport.reportReceived}
                    onChange={(e) => updatePMReport("reportReceived", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Report Received
                </label>
              </div>
            </div>
          </div>

          {/* Compensation Proposal Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Compensation Proposal
            </h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.compensationProposal.required}
                    onChange={(e) => updateCompensationProposal("required", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Compensation Proposal Required
                </label>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.compensationProposal.submitted}
                    onChange={(e) => updateCompensationProposal("submitted", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Compensation Proposal Submitted
                </label>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Submission Date</label>
                  <input
                    type="date"
                    value={formData.compensationProposal.submissionDate}
                    onChange={(e) => updateCompensationProposal("submissionDate", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Notes
            </h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-4">
                Notes can be added after the case is created. Use the case detail page to add notes.
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save Case
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

