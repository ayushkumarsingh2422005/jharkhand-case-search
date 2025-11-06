"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type CaseStatus = "Completed" | "In-progress" | "Decision Pending";

type AccusedStatus = "Arrested" | "Not arrested" | "Decision pending";

type Accused = {
  name: string;
  status: AccusedStatus;
  arrestedDate?: string;
};

type CaseRow = {
  caseNo: string;
  year: number;
  policeStation: string;
  crimeSection: string;
  punishmentCategory: "\u22647 yrs" | ">7 yrs";
  accused: Accused[];
  caseStatus: CaseStatus;
};

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

export default function Home() {
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i), [currentYear]);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState({
    // Basic filters
    caseNo: "",
    year: "",
    yearFrom: "",
    yearTo: "",
    yearBefore: "",
    yearAfter: "",
    policeStation: "",
    crimeHead: "",
    section: "",
    punishment: [] as Array<"\u22647" | ">7">,
    caseStatus: [] as Array<CaseStatus>,
    // Accused filters
    accusedName: "",
    accusedStatus: "" as "" | "Arrested" | "Not arrested" | "Decision pending",
    accusedCountMin: "",
    accusedCountMax: "",
    arrestedCountMin: "",
    arrestedCountMax: "",
    unarrestedCountMin: "",
    unarrestedCountMax: "",
    // Date filters
    caseDateFrom: "",
    caseDateTo: "",
    arrestDateFrom: "",
    arrestDateTo: "",
    pageSize: 10 as 10 | 25 | 50,
  });

  const [data] = useState<CaseRow[]>([
    {
      caseNo: "12/2023",
      year: 2023,
      policeStation: "Central PS",
      crimeSection: "379 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Completed",
      accused: [
        { name: "Rakesh Kumar", status: "Arrested", arrestedDate: "2023-01-15" },
        { name: "Suman Verma", status: "Arrested", arrestedDate: "2023-01-20" },
      ],
    },
    {
      caseNo: "77/2024",
      year: 2024,
      policeStation: "North Zone PS",
      crimeSection: "420 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "In-progress",
      accused: [
        { name: "Amit Sharma", status: "Arrested", arrestedDate: "2024-02-10" },
        { name: "Priya Singh", status: "Not arrested" },
        { name: "Rajesh Patel", status: "Not arrested" },
        { name: "Deepak Yadav", status: "Decision pending" },
      ],
    },
    {
      caseNo: "05/2025",
      year: 2025,
      policeStation: "East Division PS",
      crimeSection: "376 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "Decision Pending",
      accused: [
        { name: "Vikram Singh", status: "Decision pending" },
      ],
    },
  ]);

  const filtered = useMemo(() => {
    return data
      .map((row) => {
        // Check accused filters
        let matchedAccused: Accused[] = [];
        if (filters.accusedName || filters.accusedStatus) {
          matchedAccused = row.accused.filter((acc) => {
            const nameMatch = !filters.accusedName || acc.name.toLowerCase().includes(filters.accusedName.toLowerCase());
            const statusMatch = !filters.accusedStatus || acc.status.toLowerCase() === filters.accusedStatus.toLowerCase();
            return nameMatch && statusMatch;
          });
        }

        // If accused filters are applied but no match, exclude case
        if ((filters.accusedName || filters.accusedStatus) && matchedAccused.length === 0) {
          return null;
        }

        // Basic filters
        if (filters.caseNo && !row.caseNo.toLowerCase().includes(filters.caseNo.toLowerCase())) return null;
        if (filters.policeStation && row.policeStation !== filters.policeStation) return null;
        if (filters.crimeHead && !row.crimeSection.toLowerCase().includes(filters.crimeHead.toLowerCase())) return null;
        if (filters.section && !row.crimeSection.toLowerCase().includes(filters.section.toLowerCase())) return null;
        
        // Year filters
        if (filters.year && row.year !== Number(filters.year)) return null;
        if (filters.yearFrom && row.year < Number(filters.yearFrom)) return null;
        if (filters.yearTo && row.year > Number(filters.yearTo)) return null;
        if (filters.yearBefore && row.year >= Number(filters.yearBefore)) return null;
        if (filters.yearAfter && row.year <= Number(filters.yearAfter)) return null;
        
        // Punishment filter
        if (filters.punishment.length) {
          const wantsLE7 = filters.punishment.includes("\u22647");
          const wantsGT7 = filters.punishment.includes(">7");
          if (wantsLE7 && wantsGT7) {
            // both selected → allow
          } else if (wantsLE7 && row.punishmentCategory !== "\u22647 yrs") return null;
          else if (wantsGT7 && row.punishmentCategory !== ">7 yrs") return null;
        }
        
        // Case status filter
        if (filters.caseStatus.length > 0 && !filters.caseStatus.includes(row.caseStatus)) return null;
        
        // Accused count filters
        const totalAccused = row.accused.length;
        const arrestedCount = row.accused.filter(a => a.status === "Arrested").length;
        const unarrestedCount = row.accused.filter(a => a.status === "Not arrested").length;
        
        if (filters.accusedCountMin && totalAccused < Number(filters.accusedCountMin)) return null;
        if (filters.accusedCountMax && totalAccused > Number(filters.accusedCountMax)) return null;
        if (filters.arrestedCountMin && arrestedCount < Number(filters.arrestedCountMin)) return null;
        if (filters.arrestedCountMax && arrestedCount > Number(filters.arrestedCountMax)) return null;
        if (filters.unarrestedCountMin && unarrestedCount < Number(filters.unarrestedCountMin)) return null;
        if (filters.unarrestedCountMax && unarrestedCount > Number(filters.unarrestedCountMax)) return null;
        
        // Date filters (if we had case dates in data, we'd check them here)
        // For now, we'll check arrest dates
        if (filters.arrestDateFrom || filters.arrestDateTo) {
          const hasArrestedWithDate = row.accused.some(a => {
            if (a.status !== "Arrested" || !a.arrestedDate) return false;
            const arrestDate = new Date(a.arrestedDate);
            if (filters.arrestDateFrom && arrestDate < new Date(filters.arrestDateFrom)) return false;
            if (filters.arrestDateTo && arrestDate > new Date(filters.arrestDateTo)) return false;
            return true;
          });
          if (!hasArrestedWithDate) return null;
        }

        return { ...row, matchedAccused };
      })
      .filter((row): row is CaseRow & { matchedAccused: Accused[] } => row !== null);
  }, [data, filters]);

  function reset() {
    setFilters({
      caseNo: "",
      year: "",
      yearFrom: "",
      yearTo: "",
      yearBefore: "",
      yearAfter: "",
      policeStation: "",
      crimeHead: "",
      section: "",
      punishment: [],
      caseStatus: [],
      accusedName: "",
      accusedStatus: "",
      accusedCountMin: "",
      accusedCountMax: "",
      arrestedCountMin: "",
      arrestedCountMax: "",
      unarrestedCountMin: "",
      unarrestedCountMax: "",
      caseDateFrom: "",
      caseDateTo: "",
      arrestDateFrom: "",
      arrestDateTo: "",
      pageSize: 10,
    });
  }

  function statusBadgeColor(status: CaseStatus) {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 ring-green-600/20";
      case "In-progress":
        return "bg-orange-100 text-orange-800 ring-orange-600/20";
      default:
        return "bg-red-100 text-red-800 ring-red-600/20";
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-blue-900/30">
        <div className="bg-blue-900 text-white">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-white/10 grid place-content-center">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/></svg>
              </div>
              <h1 className="text-base md:text-lg font-semibold tracking-wide">CASE MANAGEMENT SYSTEM</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">SI Anil Kumar</div>
                <div className="text-xs/5 text-blue-100">Investigating Officer</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/10 grid place-content-center">
                <svg className="h-5 w-5 text-blue-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200">
          <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-600/10 text-blue-700 grid place-content-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold tracking-wide">Search Cases</h2>
                <p className="text-xs md:text-sm text-slate-600">Use filters to quickly locate a case</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 md:px-6 md:py-6">
            {/* Basic Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Case Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Case Number</label>
                  <input value={filters.caseNo} onChange={(e) => setFilters({ ...filters, caseNo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 77/2024" />
                </div>
                {/* Year - Exact */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year (Exact)</label>
                  <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                {/* Year Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year From</label>
                  <select value={filters.yearFrom} onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Any</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year To</label>
                  <select value={filters.yearTo} onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Any</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                {/* Year Comparison */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Before Year</label>
                  <select value={filters.yearBefore} onChange={(e) => setFilters({ ...filters, yearBefore: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Any</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">After Year</label>
                  <select value={filters.yearAfter} onChange={(e) => setFilters({ ...filters, yearAfter: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Any</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                {/* Police Station */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Police Station</label>
                  <input list="ps-list" value={filters.policeStation} onChange={(e) => setFilters({ ...filters, policeStation: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Search station" />
                  <datalist id="ps-list">
                    {POLICE_STATIONS.map((ps) => (
                      <option key={ps} value={ps} />
                    ))}
                  </datalist>
                </div>
                {/* Crime Head */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Crime Head</label>
                  <input list="crime-heads" value={filters.crimeHead} onChange={(e) => setFilters({ ...filters, crimeHead: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Select or type" />
                  <datalist id="crime-heads">
                    {CRIME_HEADS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                  <input value={filters.section} onChange={(e) => setFilters({ ...filters, section: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 420 IPC" />
                </div>
                {/* Punishment Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Punishment Range</label>
                  <div className="flex gap-4 pt-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.punishment.includes("\u22647")}
                        onChange={(e) => {
                          const set = new Set(filters.punishment);
                          if (e.target.checked) set.add("\u22647"); else set.delete("\u22647");
                          setFilters({ ...filters, punishment: Array.from(set) as Array<"\u22647" | ">7"> });
                        }}
                      />
                      ≤7 Years
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.punishment.includes(">7")}
                        onChange={(e) => {
                          const set = new Set(filters.punishment);
                          if (e.target.checked) set.add(">7"); else set.delete(">7");
                          setFilters({ ...filters, punishment: Array.from(set) as Array<"\u22647" | ">7"> });
                        }}
                      />
                      {">7 Years"}
                    </label>
                  </div>
                </div>
                {/* Case Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Case Status</label>
                  <div className="flex flex-col gap-2 pt-2">
                    {(["Completed", "In-progress", "Decision Pending"] as CaseStatus[]).map((status) => (
                      <label key={status} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.caseStatus.includes(status)}
                          onChange={(e) => {
                            const set = new Set(filters.caseStatus);
                            if (e.target.checked) set.add(status); else set.delete(status);
                            setFilters({ ...filters, caseStatus: Array.from(set) });
                          }}
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Accused Filters */}
            <div className="mb-6 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Accused Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Accused Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Accused Name</label>
                  <input value={filters.accusedName} onChange={(e) => setFilters({ ...filters, accusedName: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter name" />
                </div>
                {/* Accused Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Accused Status</label>
                  <select value={filters.accusedStatus} onChange={(e) => setFilters({ ...filters, accusedStatus: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All</option>
                    <option>Arrested</option>
                    <option>Not arrested</option>
                    <option>Decision pending</option>
                  </select>
                </div>
                {/* Accused Count Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Accused (Min)</label>
                  <input type="number" min="0" value={filters.accusedCountMin} onChange={(e) => setFilters({ ...filters, accusedCountMin: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Min count" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Accused (Max)</label>
                  <input type="number" min="0" value={filters.accusedCountMax} onChange={(e) => setFilters({ ...filters, accusedCountMax: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Max count" />
                </div>
                {/* Arrested Count Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Arrested Count (Min)</label>
                  <input type="number" min="0" value={filters.arrestedCountMin} onChange={(e) => setFilters({ ...filters, arrestedCountMin: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Min count" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Arrested Count (Max)</label>
                  <input type="number" min="0" value={filters.arrestedCountMax} onChange={(e) => setFilters({ ...filters, arrestedCountMax: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Max count" />
                </div>
                {/* Unarrested Count Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unarrested Count (Min)</label>
                  <input type="number" min="0" value={filters.unarrestedCountMin} onChange={(e) => setFilters({ ...filters, unarrestedCountMin: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Min count" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unarrested Count (Max)</label>
                  <input type="number" min="0" value={filters.unarrestedCountMax} onChange={(e) => setFilters({ ...filters, unarrestedCountMax: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Max count" />
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mb-6 border-t border-slate-200 pt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Date Filters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Case Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Case Date From</label>
                    <input type="date" value={filters.caseDateFrom} onChange={(e) => setFilters({ ...filters, caseDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Case Date To</label>
                    <input type="date" value={filters.caseDateTo} onChange={(e) => setFilters({ ...filters, caseDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  {/* Arrest Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Arrest Date From</label>
                    <input type="date" value={filters.arrestDateFrom} onChange={(e) => setFilters({ ...filters, arrestDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Arrest Date To</label>
                    <input type="date" value={filters.arrestDateTo} onChange={(e) => setFilters({ ...filters, arrestDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Filters Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {showAdvancedFilters ? (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
                    Hide Advanced Filters
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    Show Advanced Filters
                  </>
                )}
              </button>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Showing</span>
                <select value={filters.pageSize} onChange={(e) => setFilters({ ...filters, pageSize: Number(e.target.value) as 10 | 25 | 50 })} className="rounded-md border-slate-300">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>per page</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => {/* no-op demo search */}} className="inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  Search
                </button>
                <button onClick={reset} className="rounded-md px-4 py-2 font-medium text-slate-700 border border-slate-300 hover:bg-slate-50">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="mt-6 bg-white rounded-lg shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-50 text-slate-800">
                <tr className="*:\:px-4 *:\:py-3">
                  <th className="px-4 py-3 text-left font-medium">Case No.</th>
                  <th className="px-4 py-3 text-left font-medium">Year</th>
                  <th className="px-4 py-3 text-left font-medium">Police Station</th>
                  <th className="px-4 py-3 text-left font-medium">Crime Section</th>
                  <th className="px-4 py-3 text-left font-medium">Punishment</th>
                  <th className="px-4 py-3 text-left font-medium">Accused</th>
                  <th className="px-4 py-3 text-left font-medium">Case Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.slice(0, filters.pageSize).map((row) => {
                  const total = row.accused.length;
                  const arrested = row.accused.filter((a) => a.status === "Arrested").length;
                  const unarrested = row.accused.filter((a) => a.status === "Not arrested").length;
                  const matchedAccused = row.matchedAccused || [];

                  return (
                    <>
                      <tr key={row.caseNo} className="hover:bg-slate-50 odd:bg-white even:bg-slate-50/50">
                        <td className="px-4 py-3 whitespace-nowrap">{row.caseNo}</td>
                        <td className="px-4 py-3">{row.year}</td>
                        <td className="px-4 py-3">{row.policeStation}</td>
                        <td className="px-4 py-3">{row.crimeSection}</td>
                        <td className="px-4 py-3">{row.punishmentCategory}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-900">{total}</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-red-600 font-medium">{arrested}</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-green-600 font-medium">{unarrested}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusBadgeColor(row.caseStatus)}`}>
                            {row.caseStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/cases/${row.caseNo.replaceAll("/", "-")}`}
                            title="Open detailed case timeline"
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                          >
                            View Case
                          </Link>
                        </td>
                      </tr>
                      {matchedAccused.length > 0 && (
                        <tr key={`${row.caseNo}-matched`} className="bg-blue-50/30">
                          <td colSpan={8} className="px-4 py-2">
                            <div className="text-xs text-slate-600">
                              <span className="font-medium">Matched Accused:</span>{" "}
                              {matchedAccused.map((acc, idx) => (
                                <span key={idx}>
                                  <span className="font-medium">{acc.name}</span>
                                  <span className="text-slate-500"> ({acc.status})</span>
                                  {idx < matchedAccused.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">No results found. Adjust filters and try again.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white text-sm">
            <div className="text-slate-600">Showing <span className="font-medium">{Math.min(filters.pageSize, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> entries</div>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">Prev</button>
              <button className="px-3 py-1.5 border border-slate-300 rounded-md bg-blue-600 text-white hover:bg-blue-700">1</button>
              <button className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">2</button>
              <button className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
