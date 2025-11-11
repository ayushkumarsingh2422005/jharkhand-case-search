"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type CaseStatus = "Disposed" | "Under investigation" | "Decision Pending";
type InvestigationStatus = "Detected" | "Undetected";
type SrNsr = "SR" | "NSR";
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

export default function EditCase() {
  const router = useRouter();
  const params = useParams<{ caseId: string | string[] | undefined }>();
  // Handle caseId which could be string, array, or undefined
  const caseId = Array.isArray(params?.caseId) ? params.caseId[0] : params?.caseId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Notes state
  type Note = {
    _id: string;
    content: string;
    author: string;
    createdAt: string;
  };
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteAuthor, setNewNoteAuthor] = useState("");
  const [addingNote, setAddingNote] = useState(false);

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
    srNsr: "" as SrNsr | "",
    priority: "Normal" as Priority,
    isPropertyProfessionalCrime: false,
    petition: false,
    reasonForPendency: [] as string[],
    diary: [] as Array<{ diaryNo: string; diaryDate: string }>,
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
    },
    finalChargesheetSubmitted: false,
    finalChargesheetSubmissionDate: "",
    prosecutionSanction: [] as Array<{
      type: string;
      submissionDate: string;
      receiptDate: string;
    }>,
    fsl: [] as Array<{
      reportRequired: boolean;
      sampleToBeCollected: string;
      sampleCollected: boolean;
      sampleCollectionDate: string;
      sampleSendingDate: string;
      reportReceived: boolean;
      reportReceivedDate: string;
      reportDate: string;
    }>,
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

  useEffect(() => {
    if (caseId && typeof caseId === 'string') {
      fetchCase();
    } else {
      setError("Case ID is missing");
      setLoading(false);
    }
  }, [caseId]);

  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    if (caseData?._id) {
      fetchNotes(caseData._id);
    }
  }, [caseData?._id]);

  const fetchNotes = async (caseIdValue: string) => {
    if (!caseIdValue) return;
    
    try {
      setNotesLoading(true);
      const response = await fetch(`/api/notes?caseId=${caseIdValue}`);
      const data = await response.json();
      
      if (data.success) {
        setNotes(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setNotesLoading(false);
    }
  };

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
        const fetchedCaseData = data.data;
        setCaseData(fetchedCaseData);
        setFormData({
          caseNo: fetchedCaseData.caseNo || "",
          year: fetchedCaseData.year || new Date().getFullYear(),
          policeStation: fetchedCaseData.policeStation || "",
          crimeHead: fetchedCaseData.crimeHead || "",
          crimeSection: fetchedCaseData.crimeSection || fetchedCaseData.section || "",
          punishmentCategory: fetchedCaseData.punishmentCategory || "≤7 yrs",
          caseDate: fetchedCaseData.caseDate ? new Date(fetchedCaseData.caseDate).toISOString().split('T')[0] : "",
          caseStatus: fetchedCaseData.caseStatus || "Under investigation",
          investigationStatus: fetchedCaseData.investigationStatus || "",
          srNsr: fetchedCaseData.srNsr || "",
          priority: fetchedCaseData.priority || "Normal",
          isPropertyProfessionalCrime: fetchedCaseData.isPropertyProfessionalCrime || false,
          petition: fetchedCaseData.petition || false,
          reasonForPendency: fetchedCaseData.reasonForPendency || [],
          diary: fetchedCaseData.diary && Array.isArray(fetchedCaseData.diary) 
            ? fetchedCaseData.diary.map((entry: any) => ({
                diaryNo: entry.diaryNo || "",
                diaryDate: entry.diaryDate ? new Date(entry.diaryDate).toISOString().split('T')[0] : "",
              }))
            : [],
          reports: {
            r1: fetchedCaseData.reports?.r1 ? new Date(fetchedCaseData.reports.r1).toISOString().split('T')[0] : "",
            supervision: fetchedCaseData.reports?.supervision ? new Date(fetchedCaseData.reports.supervision).toISOString().split('T')[0] : "",
            r2: fetchedCaseData.reports?.r2 ? new Date(fetchedCaseData.reports.r2).toISOString().split('T')[0] : "",
            r3: fetchedCaseData.reports?.r3 ? new Date(fetchedCaseData.reports.r3).toISOString().split('T')[0] : "",
            pr1: fetchedCaseData.reports?.pr1 ? new Date(fetchedCaseData.reports.pr1).toISOString().split('T')[0] : "",
            pr2: fetchedCaseData.reports?.pr2 ? new Date(fetchedCaseData.reports.pr2).toISOString().split('T')[0] : "",
            pr3: fetchedCaseData.reports?.pr3 ? new Date(fetchedCaseData.reports.pr3).toISOString().split('T')[0] : "",
            fpr: fetchedCaseData.reports?.fpr ? new Date(fetchedCaseData.reports.fpr).toISOString().split('T')[0] : "",
            finalOrder: fetchedCaseData.reports?.finalOrder ? new Date(fetchedCaseData.reports.finalOrder).toISOString().split('T')[0] : "",
            finalChargesheet: fetchedCaseData.reports?.finalChargesheet ? new Date(fetchedCaseData.reports.finalChargesheet).toISOString().split('T')[0] : "",
          },
          chargeSheet: {
            submitted: fetchedCaseData.chargeSheet?.submitted || false,
            submissionDate: fetchedCaseData.chargeSheet?.submissionDate ? new Date(fetchedCaseData.chargeSheet.submissionDate).toISOString().split('T')[0] : "",
          },
          finalChargesheetSubmitted: fetchedCaseData.finalChargesheetSubmitted || false,
          finalChargesheetSubmissionDate: fetchedCaseData.finalChargesheetSubmissionDate ? new Date(fetchedCaseData.finalChargesheetSubmissionDate).toISOString().split('T')[0] : "",
          prosecutionSanction: fetchedCaseData.prosecutionSanction && Array.isArray(fetchedCaseData.prosecutionSanction)
            ? fetchedCaseData.prosecutionSanction.map((sanction: any) => ({
                type: sanction.type || "",
                submissionDate: sanction.submissionDate ? new Date(sanction.submissionDate).toISOString().split('T')[0] : "",
                receiptDate: sanction.receiptDate ? new Date(sanction.receiptDate).toISOString().split('T')[0] : "",
              }))
            : [],
          fsl: fetchedCaseData.fsl && Array.isArray(fetchedCaseData.fsl)
            ? fetchedCaseData.fsl.map((fslEntry: any) => ({
                reportRequired: fslEntry.reportRequired || false,
                sampleToBeCollected: fslEntry.sampleToBeCollected || "",
                sampleCollected: fslEntry.sampleCollected || false,
                sampleCollectionDate: fslEntry.sampleCollectionDate ? new Date(fslEntry.sampleCollectionDate).toISOString().split('T')[0] : "",
                sampleSendingDate: fslEntry.sampleSendingDate ? new Date(fslEntry.sampleSendingDate).toISOString().split('T')[0] : "",
                reportReceived: fslEntry.reportReceived || false,
                reportReceivedDate: fslEntry.reportReceivedDate ? new Date(fslEntry.reportReceivedDate).toISOString().split('T')[0] : "",
                reportDate: fslEntry.reportDate ? new Date(fslEntry.reportDate).toISOString().split('T')[0] : "",
              }))
            : [],
          injuryReport: {
            report: fetchedCaseData.injuryReport?.report || false,
            injuryDate: fetchedCaseData.injuryReport?.injuryDate ? new Date(fetchedCaseData.injuryReport.injuryDate).toISOString().split('T')[0] : "",
            reportReceived: fetchedCaseData.injuryReport?.reportReceived || false,
            reportDate: fetchedCaseData.injuryReport?.reportDate ? new Date(fetchedCaseData.injuryReport.reportDate).toISOString().split('T')[0] : "",
          },
          pmReport: {
            report: fetchedCaseData.pmReport?.report || "",
            pmDate: fetchedCaseData.pmReport?.pmDate ? new Date(fetchedCaseData.pmReport.pmDate).toISOString().split('T')[0] : "",
            reportReceived: fetchedCaseData.pmReport?.reportReceived || false,
            reportDate: fetchedCaseData.pmReport?.reportDate ? new Date(fetchedCaseData.pmReport.reportDate).toISOString().split('T')[0] : "",
          },
          compensationProposal: {
            required: fetchedCaseData.compensationProposal?.required || false,
            submitted: fetchedCaseData.compensationProposal?.submitted || false,
            submissionDate: fetchedCaseData.compensationProposal?.submissionDate ? new Date(fetchedCaseData.compensationProposal.submissionDate).toISOString().split('T')[0] : "",
          },
          accused: fetchedCaseData.accused || [],
        });
      } else {
        setError(data.error || "Failed to fetch case");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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

  const addDiaryEntry = () => {
    setFormData(prev => ({
      ...prev,
      diary: [...prev.diary, { diaryNo: "", diaryDate: "" }],
    }));
  };

  const updateDiaryEntry = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      diary: prev.diary.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const removeDiaryEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diary: prev.diary.filter((_, i) => i !== index),
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

  const addProsecutionSanction = () => {
    setFormData(prev => ({
      ...prev,
      prosecutionSanction: [...prev.prosecutionSanction, { type: "", submissionDate: "", receiptDate: "" }],
    }));
  };

  const updateProsecutionSanction = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      prosecutionSanction: prev.prosecutionSanction.map((sanction, i) =>
        i === index ? { ...sanction, [field]: value } : sanction
      ),
    }));
  };

  const removeProsecutionSanction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prosecutionSanction: prev.prosecutionSanction.filter((_, i) => i !== index),
    }));
  };

  const addFSL = () => {
    setFormData(prev => ({
      ...prev,
      fsl: [...prev.fsl, {
        reportRequired: false,
        sampleToBeCollected: "",
        sampleCollected: false,
        sampleCollectionDate: "",
        sampleSendingDate: "",
        reportReceived: false,
        reportReceivedDate: "",
        reportDate: "",
      }],
    }));
  };

  const updateFSL = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      fsl: prev.fsl.map((fslEntry, i) =>
        i === index ? { ...fslEntry, [field]: value } : fslEntry
      ),
    }));
  };

  const removeFSL = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fsl: prev.fsl.filter((_, i) => i !== index),
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
    setSaving(true);
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
        srNsr: formData.srNsr || undefined,
        diary: formData.diary.filter(entry => entry.diaryNo || entry.diaryDate),
        prosecutionSanction: formData.prosecutionSanction.filter(sanction => sanction.type),
        fsl: formData.fsl.filter(fslEntry => fslEntry.reportRequired || fslEntry.sampleToBeCollected || fslEntry.sampleCollected),
        pmReport: {
          ...formData.pmReport,
          report: formData.pmReport.report || undefined,
        },
      });

      if (!caseId || typeof caseId !== 'string') {
        throw new Error("Case ID is missing");
      }

      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update case");
      }

      router.push(`/dashboard`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !newNoteAuthor.trim() || !caseData?._id || !caseData?.caseNo) {
      return;
    }

    try {
      setAddingNote(true);
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseData._id,
          caseNo: caseData.caseNo,
          content: newNoteContent.trim(),
          author: newNoteAuthor.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotes([data.data, ...notes]);
        setNewNoteContent("");
        setNewNoteAuthor("");
      } else {
        setError(data.error || "Failed to add note");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-8 text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-600">Loading case data...</p>
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
        <span className="font-medium">Edit Case</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden mb-6">
        <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600/10 text-blue-700 grid place-content-center">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold tracking-wide">Edit Case</h2>
              <p className="text-xs md:text-sm text-slate-600">Update case details below</p>
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">SR/NSR</label>
                <select
                  name="srNsr"
                  value={formData.srNsr}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  <option value="">Select</option>
                  <option value="SR">SR</option>
                  <option value="NSR">NSR</option>
                </select>
              </div>
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
              {/* Diary Entries */}
              <div className="col-span-full">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Diary Entries</label>
                  <button
                    type="button"
                    onClick={addDiaryEntry}
                    className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Diary Entry
                  </button>
                </div>
                {formData.diary.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-2">No diary entries. Click "Add Diary Entry" to add one.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.diary.map((entry, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Diary Number</label>
                          <input
                            type="text"
                            value={entry.diaryNo}
                            onChange={(e) => updateDiaryEntry(index, "diaryNo", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                            placeholder="Enter diary number"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Diary Date</label>
                          <input
                            type="date"
                            value={entry.diaryDate}
                            onChange={(e) => updateDiaryEntry(index, "diaryDate", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => removeDiaryEntry(index)}
                            className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          value={accused.arrestedDate ? new Date(accused.arrestedDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => updateAccused(index, "arrestedDate", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Arrested On</label>
                        <input
                          type="date"
                          value={accused.arrestedOn ? new Date(accused.arrestedOn).toISOString().split('T')[0] : ""}
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
                              value={accused.notice41A?.notice1Date ? new Date(accused.notice41A.notice1Date).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedNotice41A(index, "notice1Date", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Notice 2 Date</label>
                            <input
                              type="date"
                              value={accused.notice41A?.notice2Date ? new Date(accused.notice41A.notice2Date).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedNotice41A(index, "notice2Date", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Notice 3 Date</label>
                            <input
                              type="date"
                              value={accused.notice41A?.notice3Date ? new Date(accused.notice41A.notice3Date).toISOString().split('T')[0] : ""}
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
                              value={accused.warrant?.prayerDate ? new Date(accused.warrant.prayerDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "warrant", "prayerDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Receipt Date</label>
                            <input
                              type="date"
                              value={accused.warrant?.receiptDate ? new Date(accused.warrant.receiptDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "warrant", "receiptDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Execution Date</label>
                            <input
                              type="date"
                              value={accused.warrant?.executionDate ? new Date(accused.warrant.executionDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "warrant", "executionDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Return Date</label>
                            <input
                              type="date"
                              value={accused.warrant?.returnDate ? new Date(accused.warrant.returnDate).toISOString().split('T')[0] : ""}
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
                              value={accused.proclamation?.prayerDate ? new Date(accused.proclamation.prayerDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "proclamation", "prayerDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Receipt Date</label>
                            <input
                              type="date"
                              value={accused.proclamation?.receiptDate ? new Date(accused.proclamation.receiptDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "proclamation", "receiptDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Execution Date</label>
                            <input
                              type="date"
                              value={accused.proclamation?.executionDate ? new Date(accused.proclamation.executionDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "proclamation", "executionDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Return Date</label>
                            <input
                              type="date"
                              value={accused.proclamation?.returnDate ? new Date(accused.proclamation.returnDate).toISOString().split('T')[0] : ""}
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
                              value={accused.attachment?.prayerDate ? new Date(accused.attachment.prayerDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "attachment", "prayerDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Receipt Date</label>
                            <input
                              type="date"
                              value={accused.attachment?.receiptDate ? new Date(accused.attachment.receiptDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "attachment", "receiptDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Execution Date</label>
                            <input
                              type="date"
                              value={accused.attachment?.executionDate ? new Date(accused.attachment.executionDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => updateAccusedLegalProcess(index, "attachment", "executionDate", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Return Date</label>
                            <input
                              type="date"
                              value={accused.attachment?.returnDate ? new Date(accused.attachment.returnDate).toISOString().split('T')[0] : ""}
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
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Submission Date</label>
                  <input
                    type="date"
                    value={formData.chargeSheet.submissionDate}
                    onChange={(e) => updateChargeSheet("submissionDate", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                </svg>
                Prosecution Sanction
              </h3>
              <button
                type="button"
                onClick={addProsecutionSanction}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Prosecution Sanction
              </button>
            </div>
            {formData.prosecutionSanction.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No prosecution sanctions added. Click "Add Prosecution Sanction" to add one.</p>
            ) : (
              <div className="space-y-4">
                {formData.prosecutionSanction.map((sanction, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-xs font-medium text-slate-700">Prosecution Sanction {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeProsecutionSanction(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Type *</label>
                        <input
                          type="text"
                          value={sanction.type}
                          onChange={(e) => updateProsecutionSanction(index, "type", e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Enter sanction type"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Submission Date</label>
                        <input
                          type="date"
                          value={sanction.submissionDate}
                          onChange={(e) => updateProsecutionSanction(index, "submissionDate", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Receipt Date</label>
                        <input
                          type="date"
                          value={sanction.receiptDate}
                          onChange={(e) => updateProsecutionSanction(index, "receiptDate", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FSL/Forensic Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                FSL/Forensic
              </h3>
              <button
                type="button"
                onClick={addFSL}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add FSL Report
              </button>
            </div>
            {formData.fsl.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No FSL reports added. Click "Add FSL Report" to add one.</p>
            ) : (
              <div className="space-y-4">
                {formData.fsl.map((fslEntry, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-xs font-medium text-slate-700">FSL Report {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeFSL(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fslEntry.reportRequired}
                            onChange={(e) => updateFSL(index, "reportRequired", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Report Required
                        </label>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Sample To Be Collected</label>
                          <input
                            type="text"
                            value={fslEntry.sampleToBeCollected}
                            onChange={(e) => updateFSL(index, "sampleToBeCollected", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Enter sample type"
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fslEntry.sampleCollected}
                            onChange={(e) => updateFSL(index, "sampleCollected", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Sample Collected
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Sample Collection Date</label>
                            <input
                              type="date"
                              value={fslEntry.sampleCollectionDate}
                              onChange={(e) => updateFSL(index, "sampleCollectionDate", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Sample Sending Date</label>
                            <input
                              type="date"
                              value={fslEntry.sampleSendingDate}
                              onChange={(e) => updateFSL(index, "sampleSendingDate", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Report Date</label>
                            <input
                              type="date"
                              value={fslEntry.reportDate}
                              onChange={(e) => updateFSL(index, "reportDate", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fslEntry.reportReceived}
                              onChange={(e) => updateFSL(index, "reportReceived", e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            Report Received
                          </label>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Report Received Date</label>
                            <input
                              type="date"
                              value={fslEntry.reportReceivedDate}
                              onChange={(e) => updateFSL(index, "reportReceivedDate", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              Notes ({notes.length})
            </h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
              {/* Add Note Form */}
              <div className="border-b border-slate-200 pb-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-3">Add New Note</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Author</label>
                    <input
                      type="text"
                      value={newNoteAuthor}
                      onChange={(e) => setNewNoteAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter author name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Content</label>
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter note content"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={addingNote || !newNoteContent.trim() || !newNoteAuthor.trim()}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {addingNote ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Note
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Existing Notes */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-3">Existing Notes</h4>
                {notesLoading ? (
                  <div className="text-center py-4 text-slate-500">
                    <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-xs">Loading notes...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">
                    <p className="text-sm">No notes yet. Add a note above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note._id}
                        className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-slate-900">{note.author}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">{formatDate(note.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Update Case
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

