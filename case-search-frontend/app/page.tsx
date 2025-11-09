"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type CaseStatus = "Disposed" | "Under investigation" | "Decision Pending";
type InvestigationStatus = "Detected" | "Undetected";
type Priority = "Under monitoring" | "Normal";

type AccusedStatus = "Arrested" | "Not arrested" | "Decision pending";

type Accused = {
  name: string;
  status: AccusedStatus;
  arrestedDate?: string;
};

type WarrantInfo = {
  prayed: boolean;
  prayerDate?: string;
  receiptDate?: string;
  executionDate?: string;
  returnDate?: string;
};

type ProclamationInfo = {
  prayed: boolean;
  prayerDate?: string;
  receiptDate?: string;
  executionDate?: string;
  returnDate?: string;
};

type AttachmentInfo = {
  prayed: boolean;
  prayerDate?: string;
  receiptDate?: string;
  executionDate?: string;
  returnDate?: string;
};

type ReportInfo = {
  r1?: string;
  supervision?: string;
  r2?: string;
  r3?: string;
  pr1?: string;
  pr2?: string;
  pr3?: string;
  fpr?: string;
  finalOrder?: string;
  finalChargesheet?: string;
};

type CaseRow = {
  caseNo: string;
  year: number;
  policeStation: string;
  crimeSection: string;
  punishmentCategory: "\u22647 yrs" | ">7 yrs";
  accused: Accused[];
  caseStatus: CaseStatus;
  investigationStatus?: InvestigationStatus;
  priority?: Priority;
  isPropertyProfessionalCrime?: boolean;
  warrant?: WarrantInfo;
  proclamation?: ProclamationInfo;
  attachment?: AttachmentInfo;
  reports?: ReportInfo;
  finalChargesheetSubmitted?: boolean;
  finalChargesheetSubmissionDate?: string;
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
    investigationStatus: [] as Array<InvestigationStatus>,
    priority: [] as Array<Priority>,
    isPropertyProfessionalCrime: false,
    reasonForPendency: [] as string[],
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
    // Warrant filters
    warrantPrayed: "" as "" | "Yes" | "No" | "NA",
    warrantPrayerDateFrom: "",
    warrantPrayerDateTo: "",
    warrantReceiptDateFrom: "",
    warrantReceiptDateTo: "",
    warrantExecutionDateFrom: "",
    warrantExecutionDateTo: "",
    warrantReceivedNotExecuted: false,
    warrantIssuedMonthsAgo: "" as "" | "2" | "3" | "4",
    // Proclamation filters
    proclamationPrayed: "" as "" | "Yes" | "No" | "NA",
    proclamationPrayerDateFrom: "",
    proclamationPrayerDateTo: "",
    proclamationReceiptDateFrom: "",
    proclamationReceiptDateTo: "",
    proclamationExecutionDateFrom: "",
    proclamationExecutionDateTo: "",
    proclamationReceivedNotExecuted: false,
    proclamationIssuedMonthsAgo: "" as "" | "2" | "3" | "4",
    // Attachment filters
    attachmentPrayed: "" as "" | "Yes" | "No" | "NA",
    attachmentPrayerDateFrom: "",
    attachmentPrayerDateTo: "",
    attachmentReceiptDateFrom: "",
    attachmentReceiptDateTo: "",
    attachmentReceivedNotExecuted: false,
    attachmentIssuedMonthsAgo: "" as "" | "2" | "3" | "4",
    // Report filters
    reportR1: "" as "" | "Yes" | "No",
    reportR1DateFrom: "",
    reportR1DateTo: "",
    reportSupervision: "" as "" | "Yes" | "No",
    reportSupervisionDateFrom: "",
    reportSupervisionDateTo: "",
    reportR2: "" as "" | "Yes" | "No",
    reportR2DateFrom: "",
    reportR2DateTo: "",
    reportR2IssuedMonthsAgo: "" as "" | "3" | "6",
    reportR3: "" as "" | "Yes" | "No",
    reportR3DateFrom: "",
    reportR3DateTo: "",
    reportPR1: "" as "" | "Yes" | "No",
    reportPR1DateFrom: "",
    reportPR1DateTo: "",
    reportPR2: "" as "" | "Yes" | "No",
    reportPR2DateFrom: "",
    reportPR2DateTo: "",
    reportPR3: "" as "" | "Yes" | "No",
    reportPR3DateFrom: "",
    reportPR3DateTo: "",
    reportFPR: "" as "" | "Yes" | "No",
    reportFPRDateFrom: "",
    reportFPRDateTo: "",
    reportFPRWithoutChargesheet: false,
    reportFinalOrder: "" as "" | "Yes" | "No",
    reportFinalOrderDateFrom: "",
    reportFinalOrderDateTo: "",
    reportFinalChargesheet: "" as "" | "Yes" | "No",
    reportFinalChargesheetDateFrom: "",
    reportFinalChargesheetDateTo: "",
    finalChargesheetSubmitted: "" as "" | "Yes" | "No",
    finalChargesheetSubmissionDateFrom: "",
    finalChargesheetSubmissionDateTo: "",
    pageSize: 10 as 10 | 25 | 50,
  });

  const [data] = useState<CaseRow[]>([
    {
      caseNo: "12/2023",
      year: 2023,
      policeStation: "Central PS",
      crimeSection: "379 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Disposed",
      priority: "Normal",
      accused: [
        { name: "Rakesh Kumar", status: "Arrested", arrestedDate: "2023-01-15" },
        { name: "Suman Verma", status: "Arrested", arrestedDate: "2023-01-20" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2023-01-25",
        receiptDate: "2023-01-26",
        executionDate: "2023-02-01",
        returnDate: "2023-02-05",
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2023-01-12",
        supervision: "2023-02-01",
        r2: "2023-02-15",
        r3: "2023-03-01",
        pr1: "2023-03-05",
        pr2: "2023-03-10",
        pr3: "2023-03-12",
        fpr: "2023-03-10",
        finalOrder: "2023-03-15",
        finalChargesheet: "2023-03-20",
      },
      finalChargesheetSubmitted: true,
      finalChargesheetSubmissionDate: "2023-03-20",
    },
    {
      caseNo: "77/2024",
      year: 2024,
      policeStation: "North Zone PS",
      crimeSection: "420 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Detected",
      priority: "Under monitoring",
      isPropertyProfessionalCrime: true,
      accused: [
        { name: "Amit Sharma", status: "Arrested", arrestedDate: "2024-02-10" },
        { name: "Priya Singh", status: "Not arrested" },
        { name: "Rajesh Patel", status: "Not arrested" },
        { name: "Deepak Yadav", status: "Decision pending" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2024-03-05",
        receiptDate: "2024-03-06",
        executionDate: undefined,
        returnDate: undefined,
      },
      proclamation: {
        prayed: true,
        prayerDate: "2024-03-10",
        receiptDate: "2024-03-12",
        executionDate: undefined,
        returnDate: undefined,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-02-12",
        supervision: "2024-03-01",
        r2: "2024-04-01",
        r3: undefined,
        pr1: "2024-04-05",
        fpr: "2024-04-10",
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "05/2025",
      year: 2025,
      policeStation: "East Division PS",
      crimeSection: "376 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "Decision Pending",
      priority: "Under monitoring",
      accused: [
        { name: "Vikram Singh", status: "Decision pending" },
      ],
      warrant: {
        prayed: false,
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: undefined,
        supervision: undefined,
        r2: undefined,
        r3: undefined,
        fpr: undefined,
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "23/2024",
      year: 2024,
      policeStation: "South Sector PS",
      crimeSection: "302 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Undetected",
      priority: "Under monitoring",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Mohit Agarwal", status: "Arrested", arrestedDate: "2024-01-15" },
        { name: "Suresh Kumar", status: "Not arrested" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2024-01-20",
        receiptDate: "2024-01-22",
        executionDate: "2024-02-01",
        returnDate: "2024-02-05",
      },
      proclamation: {
        prayed: true,
        prayerDate: "2024-02-10",
        receiptDate: "2024-02-12",
        executionDate: "2024-02-20",
        returnDate: "2024-02-25",
      },
      attachment: {
        prayed: true,
        prayerDate: "2024-03-01",
        receiptDate: "2024-03-03",
        executionDate: undefined,
        returnDate: undefined,
      },
      reports: {
        r1: "2024-01-12",
        supervision: "2024-01-25",
        r2: "2024-02-15",
        r3: "2024-03-01",
        pr1: "2024-03-05",
        pr2: "2024-03-10",
        pr3: "2024-03-15",
        fpr: "2024-03-20",
        finalOrder: "2024-03-25",
        finalChargesheet: "2024-04-01",
      },
      finalChargesheetSubmitted: true,
      finalChargesheetSubmissionDate: "2024-04-05",
    },
    {
      caseNo: "45/2024",
      year: 2024,
      policeStation: "Harbour PS",
      crimeSection: "406 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Detected",
      priority: "Normal",
      isPropertyProfessionalCrime: true,
      accused: [
        { name: "Ravi Mehta", status: "Arrested", arrestedDate: "2024-05-10" },
        { name: "Kiran Desai", status: "Arrested", arrestedDate: "2024-05-12" },
        { name: "Anil Patel", status: "Not arrested" },
      ],
      warrant: {
        prayed: false,
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-05-08",
        supervision: "2024-05-20",
        r2: "2024-06-15",
        r3: undefined,
        pr1: "2024-06-20",
        pr2: undefined,
        pr3: undefined,
        fpr: "2024-07-01",
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "89/2024",
      year: 2024,
      policeStation: "Airport PS",
      crimeSection: "498A IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Detected",
      priority: "Under monitoring",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Rajesh Gupta", status: "Arrested", arrestedDate: "2024-08-01" },
        { name: "Meera Gupta", status: "Not arrested" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2024-08-15",
        receiptDate: "2024-08-16",
        executionDate: undefined,
        returnDate: undefined,
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-07-28",
        supervision: "2024-08-10",
        r2: "2024-09-01",
        r3: undefined,
        pr1: "2024-09-05",
        pr2: "2024-09-10",
        fpr: "2024-09-15",
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "34/2023",
      year: 2023,
      policeStation: "Central PS",
      crimeSection: "384 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Disposed",
      priority: "Normal",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Sunil Yadav", status: "Arrested", arrestedDate: "2023-06-10" },
        { name: "Pankaj Singh", status: "Arrested", arrestedDate: "2023-06-12" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2023-06-20",
        receiptDate: "2023-06-21",
        executionDate: "2023-07-01",
        returnDate: "2023-07-05",
      },
      proclamation: {
        prayed: true,
        prayerDate: "2023-07-10",
        receiptDate: "2023-07-12",
        executionDate: "2023-07-20",
        returnDate: "2023-07-25",
      },
      attachment: {
        prayed: true,
        prayerDate: "2023-08-01",
        receiptDate: "2023-08-03",
        executionDate: "2023-08-10",
        returnDate: "2023-08-15",
      },
      reports: {
        r1: "2023-06-08",
        supervision: "2023-06-25",
        r2: "2023-07-15",
        r3: "2023-08-01",
        pr1: "2023-08-05",
        pr2: "2023-08-10",
        pr3: "2023-08-15",
        fpr: "2023-08-20",
        finalOrder: "2023-08-25",
        finalChargesheet: "2023-09-01",
      },
      finalChargesheetSubmitted: true,
      finalChargesheetSubmissionDate: "2023-09-05",
    },
    {
      caseNo: "56/2024",
      year: 2024,
      policeStation: "North Zone PS",
      crimeSection: "307 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "Decision Pending",
      priority: "Under monitoring",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Vishal Sharma", status: "Decision pending" },
        { name: "Rohit Verma", status: "Decision pending" },
      ],
      warrant: {
        prayed: false,
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-10-01",
        supervision: "2024-10-15",
        r2: undefined,
        r3: undefined,
        pr1: undefined,
        pr2: undefined,
        pr3: undefined,
        fpr: undefined,
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "91/2024",
      year: 2024,
      policeStation: "East Division PS",
      crimeSection: "323 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Undetected",
      priority: "Normal",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Amit Kumar", status: "Not arrested" },
        { name: "Sandeep Singh", status: "Not arrested" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2024-11-01",
        receiptDate: "2024-11-02",
        executionDate: undefined,
        returnDate: undefined,
      },
      proclamation: {
        prayed: true,
        prayerDate: "2024-11-10",
        receiptDate: "2024-11-12",
        executionDate: undefined,
        returnDate: undefined,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-10-28",
        supervision: "2024-11-05",
        r2: "2024-11-20",
        r3: undefined,
        pr1: "2024-11-25",
        fpr: "2024-12-01",
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "102/2023",
      year: 2023,
      policeStation: "South Sector PS",
      crimeSection: "395 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "Disposed",
      priority: "Normal",
      isPropertyProfessionalCrime: true,
      accused: [
        { name: "Manish Kumar", status: "Arrested", arrestedDate: "2023-04-10" },
        { name: "Ajay Singh", status: "Arrested", arrestedDate: "2023-04-12" },
        { name: "Vijay Patel", status: "Arrested", arrestedDate: "2023-04-15" },
        { name: "Sanjay Verma", status: "Not arrested" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2023-04-20",
        receiptDate: "2023-04-21",
        executionDate: "2023-05-01",
        returnDate: "2023-05-05",
      },
      proclamation: {
        prayed: true,
        prayerDate: "2023-05-10",
        receiptDate: "2023-05-12",
        executionDate: "2023-05-20",
        returnDate: "2023-05-25",
      },
      attachment: {
        prayed: true,
        prayerDate: "2023-06-01",
        receiptDate: "2023-06-03",
        executionDate: "2023-06-10",
        returnDate: "2023-06-15",
      },
      reports: {
        r1: "2023-04-08",
        supervision: "2023-04-25",
        r2: "2023-05-15",
        r3: "2023-06-01",
        pr1: "2023-06-05",
        pr2: "2023-06-10",
        pr3: "2023-06-15",
        fpr: "2023-06-20",
        finalOrder: "2023-06-25",
        finalChargesheet: "2023-07-01",
      },
      finalChargesheetSubmitted: true,
      finalChargesheetSubmissionDate: "2023-07-05",
    },
    {
      caseNo: "67/2024",
      year: 2024,
      policeStation: "Harbour PS",
      crimeSection: "411 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Detected",
      priority: "Under monitoring",
      isPropertyProfessionalCrime: true,
      accused: [
        { name: "Karan Malhotra", status: "Arrested", arrestedDate: "2024-07-05" },
        { name: "Arjun Kapoor", status: "Not arrested" },
        { name: "Rahul Jain", status: "Decision pending" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2024-07-20",
        receiptDate: "2024-07-21",
        executionDate: undefined,
        returnDate: undefined,
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-07-03",
        supervision: "2024-07-15",
        r2: "2024-08-10",
        r3: "2024-09-01",
        pr1: "2024-09-05",
        pr2: "2024-09-10",
        fpr: "2024-09-15",
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "78/2023",
      year: 2023,
      policeStation: "Airport PS",
      crimeSection: "506 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Disposed",
      priority: "Normal",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Neeraj Sharma", status: "Arrested", arrestedDate: "2023-09-10" },
      ],
      warrant: {
        prayed: false,
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2023-09-08",
        supervision: "2023-09-20",
        r2: "2023-10-05",
        r3: "2023-10-20",
        pr1: "2023-10-25",
        pr2: "2023-11-01",
        pr3: "2023-11-05",
        fpr: "2023-11-10",
        finalOrder: "2023-11-15",
        finalChargesheet: "2023-11-20",
      },
      finalChargesheetSubmitted: true,
      finalChargesheetSubmissionDate: "2023-11-25",
    },
    {
      caseNo: "113/2024",
      year: 2024,
      policeStation: "Central PS",
      crimeSection: "363 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Undetected",
      priority: "Under monitoring",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Pradeep Kumar", status: "Not arrested" },
        { name: "Manoj Singh", status: "Not arrested" },
        { name: "Dinesh Patel", status: "Decision pending" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2024-12-01",
        receiptDate: "2024-12-02",
        executionDate: undefined,
        returnDate: undefined,
      },
      proclamation: {
        prayed: true,
        prayerDate: "2024-12-10",
        receiptDate: "2024-12-12",
        executionDate: undefined,
        returnDate: undefined,
      },
      attachment: {
        prayed: true,
        prayerDate: "2024-12-20",
        receiptDate: "2024-12-22",
        executionDate: undefined,
        returnDate: undefined,
      },
      reports: {
        r1: "2024-11-28",
        supervision: "2024-12-05",
        r2: undefined,
        r3: undefined,
        pr1: undefined,
        pr2: undefined,
        pr3: undefined,
        fpr: undefined,
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "125/2024",
      year: 2024,
      policeStation: "North Zone PS",
      crimeSection: "457 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Detected",
      priority: "Under monitoring",
      isPropertyProfessionalCrime: true,
      accused: [
        { name: "Nitin Sharma", status: "Arrested", arrestedDate: "2024-09-15" },
        { name: "Ravi Kumar", status: "Not arrested" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2024-10-15",
        receiptDate: "2024-10-16",
        executionDate: undefined,
        returnDate: undefined,
      },
      proclamation: {
        prayed: true,
        prayerDate: "2024-10-20",
        receiptDate: "2024-10-22",
        executionDate: undefined,
        returnDate: undefined,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-09-12",
        supervision: "2024-09-25",
        r2: "2024-07-15",
        r3: undefined,
        pr1: "2024-10-05",
        pr2: "2024-10-10",
        fpr: "2024-10-20",
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "138/2024",
      year: 2024,
      policeStation: "South Sector PS",
      crimeSection: "380 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Detected",
      priority: "Normal",
      isPropertyProfessionalCrime: true,
      accused: [
        { name: "Sahil Mehta", status: "Arrested", arrestedDate: "2024-08-20" },
        { name: "Varun Patel", status: "Not arrested" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2024-09-20",
        receiptDate: "2024-09-21",
        executionDate: undefined,
        returnDate: undefined,
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-08-18",
        supervision: "2024-08-30",
        r2: "2024-06-10",
        r3: undefined,
        pr1: "2024-09-10",
        fpr: "2024-09-25",
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "149/2024",
      year: 2024,
      policeStation: "Harbour PS",
      crimeSection: "354 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Detected",
      priority: "Under monitoring",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Akhil Verma", status: "Arrested", arrestedDate: "2024-07-25" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2024-08-25",
        receiptDate: "2024-08-26",
        executionDate: undefined,
        returnDate: undefined,
      },
      proclamation: {
        prayed: true,
        prayerDate: "2024-08-30",
        receiptDate: "2024-09-01",
        executionDate: undefined,
        returnDate: undefined,
      },
      attachment: {
        prayed: true,
        prayerDate: "2024-09-05",
        receiptDate: "2024-09-06",
        executionDate: undefined,
        returnDate: undefined,
      },
      reports: {
        r1: "2024-07-23",
        supervision: "2024-08-05",
        r2: "2024-05-20",
        r3: "2024-09-10",
        pr1: "2024-09-15",
        pr2: "2024-09-20",
        fpr: "2024-10-01",
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "156/2024",
      year: 2024,
      policeStation: "East Division PS",
      crimeSection: "366 IPC",
      punishmentCategory: ">7 yrs",
      caseStatus: "Under investigation",
      investigationStatus: "Undetected",
      priority: "Under monitoring",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Yash Kumar", status: "Not arrested" },
        { name: "Kunal Singh", status: "Decision pending" },
      ],
      warrant: {
        prayed: false,
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-11-10",
        supervision: "2024-11-20",
        r2: "2024-04-15",
        r3: undefined,
        pr1: undefined,
        pr2: undefined,
        pr3: undefined,
        fpr: undefined,
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "167/2024",
      year: 2024,
      policeStation: "Airport PS",
      crimeSection: "417 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Decision Pending",
      priority: "Normal",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Tarun Agarwal", status: "Decision pending" },
      ],
      warrant: {
        prayed: false,
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2024-12-01",
        supervision: "2024-12-10",
        r2: undefined,
        r3: undefined,
        pr1: undefined,
        pr2: undefined,
        pr3: undefined,
        fpr: undefined,
        finalChargesheet: undefined,
      },
      finalChargesheetSubmitted: false,
    },
    {
      caseNo: "178/2023",
      year: 2023,
      policeStation: "Central PS",
      crimeSection: "427 IPC",
      punishmentCategory: "\u22647 yrs",
      caseStatus: "Disposed",
      priority: "Normal",
      isPropertyProfessionalCrime: false,
      accused: [
        { name: "Abhishek Gupta", status: "Arrested", arrestedDate: "2023-11-05" },
        { name: "Rohit Yadav", status: "Arrested", arrestedDate: "2023-11-07" },
      ],
      warrant: {
        prayed: true,
        prayerDate: "2023-11-15",
        receiptDate: "2023-11-16",
        executionDate: "2023-11-25",
        returnDate: "2023-11-30",
      },
      proclamation: {
        prayed: false,
      },
      attachment: {
        prayed: false,
      },
      reports: {
        r1: "2023-11-03",
        supervision: "2023-11-15",
        r2: "2023-12-01",
        r3: "2023-12-15",
        pr1: "2023-12-20",
        pr2: "2023-12-25",
        pr3: "2024-01-01",
        fpr: "2024-01-05",
        finalOrder: "2024-01-10",
        finalChargesheet: "2024-01-15",
      },
      finalChargesheetSubmitted: true,
      finalChargesheetSubmissionDate: "2024-01-20",
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
        
        // Investigation status filter (only for "Under investigation" cases)
        if (filters.investigationStatus.length > 0) {
          if (row.caseStatus !== "Under investigation") return null;
          if (row.investigationStatus && !filters.investigationStatus.includes(row.investigationStatus)) return null;
        }
        
        // Priority filter
        if (filters.priority.length > 0) {
          if (!row.priority || !filters.priority.includes(row.priority)) return null;
        }
        
        // Property/Professional crime filter
        if (filters.isPropertyProfessionalCrime && !row.isPropertyProfessionalCrime) return null;
        
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

        // Warrant filters
        if (filters.warrantPrayed) {
          if (filters.warrantPrayed === "Yes" && (!row.warrant || !row.warrant.prayed)) return null;
          if (filters.warrantPrayed === "No" && row.warrant && row.warrant.prayed) return null;
          if (filters.warrantPrayed === "NA" && row.warrant && row.warrant.prayed) return null;
        }
        if (filters.warrantPrayerDateFrom && (!row.warrant?.prayerDate || new Date(row.warrant.prayerDate) < new Date(filters.warrantPrayerDateFrom))) return null;
        if (filters.warrantPrayerDateTo && (!row.warrant?.prayerDate || new Date(row.warrant.prayerDate) > new Date(filters.warrantPrayerDateTo))) return null;
        if (filters.warrantReceiptDateFrom && (!row.warrant?.receiptDate || new Date(row.warrant.receiptDate) < new Date(filters.warrantReceiptDateFrom))) return null;
        if (filters.warrantReceiptDateTo && (!row.warrant?.receiptDate || new Date(row.warrant.receiptDate) > new Date(filters.warrantReceiptDateTo))) return null;
        if (filters.warrantExecutionDateFrom && (!row.warrant?.executionDate || new Date(row.warrant.executionDate) < new Date(filters.warrantExecutionDateFrom))) return null;
        if (filters.warrantExecutionDateTo && (!row.warrant?.executionDate || new Date(row.warrant.executionDate) > new Date(filters.warrantExecutionDateTo))) return null;
        // Warrant received but not executed
        if (filters.warrantReceivedNotExecuted) {
          if (!row.warrant?.receiptDate || row.warrant?.executionDate) return null;
        }
        // Warrant issued X months ago
        if (filters.warrantIssuedMonthsAgo) {
          if (!row.warrant?.prayerDate) return null;
          const monthsAgo = Number(filters.warrantIssuedMonthsAgo);
          const prayerDate = new Date(row.warrant.prayerDate);
          const today = new Date();
          const diffMonths = (today.getFullYear() - prayerDate.getFullYear()) * 12 + (today.getMonth() - prayerDate.getMonth());
          if (diffMonths < monthsAgo - 1 || diffMonths > monthsAgo + 1) return null;
        }
        // Cases with >=7 yrs punishment where warrant prayed or not
        if (filters.punishment.includes(">7")) {
          // This filter is handled by punishment filter above
        }

        // Proclamation filters
        if (filters.proclamationPrayed) {
          if (filters.proclamationPrayed === "Yes" && (!row.proclamation || !row.proclamation.prayed)) return null;
          if (filters.proclamationPrayed === "No" && row.proclamation && row.proclamation.prayed) return null;
          if (filters.proclamationPrayed === "NA" && row.proclamation && row.proclamation.prayed) return null;
        }
        if (filters.proclamationPrayerDateFrom && (!row.proclamation?.prayerDate || new Date(row.proclamation.prayerDate) < new Date(filters.proclamationPrayerDateFrom))) return null;
        if (filters.proclamationPrayerDateTo && (!row.proclamation?.prayerDate || new Date(row.proclamation.prayerDate) > new Date(filters.proclamationPrayerDateTo))) return null;
        if (filters.proclamationReceiptDateFrom && (!row.proclamation?.receiptDate || new Date(row.proclamation.receiptDate) < new Date(filters.proclamationReceiptDateFrom))) return null;
        if (filters.proclamationReceiptDateTo && (!row.proclamation?.receiptDate || new Date(row.proclamation.receiptDate) > new Date(filters.proclamationReceiptDateTo))) return null;
        if (filters.proclamationExecutionDateFrom && (!row.proclamation?.executionDate || new Date(row.proclamation.executionDate) < new Date(filters.proclamationExecutionDateFrom))) return null;
        if (filters.proclamationExecutionDateTo && (!row.proclamation?.executionDate || new Date(row.proclamation.executionDate) > new Date(filters.proclamationExecutionDateTo))) return null;
        // Proclamation received but not executed
        if (filters.proclamationReceivedNotExecuted) {
          if (!row.proclamation?.receiptDate || row.proclamation?.executionDate) return null;
        }
        // Proclamation issued X months ago
        if (filters.proclamationIssuedMonthsAgo) {
          if (!row.proclamation?.prayerDate) return null;
          const monthsAgo = Number(filters.proclamationIssuedMonthsAgo);
          const prayerDate = new Date(row.proclamation.prayerDate);
          const today = new Date();
          const diffMonths = (today.getFullYear() - prayerDate.getFullYear()) * 12 + (today.getMonth() - prayerDate.getMonth());
          if (diffMonths < monthsAgo - 1 || diffMonths > monthsAgo + 1) return null;
        }

        // Attachment filters
        if (filters.attachmentPrayed) {
          if (filters.attachmentPrayed === "Yes" && (!row.attachment || !row.attachment.prayed)) return null;
          if (filters.attachmentPrayed === "No" && row.attachment && row.attachment.prayed) return null;
          if (filters.attachmentPrayed === "NA" && row.attachment && row.attachment.prayed) return null;
        }
        if (filters.attachmentPrayerDateFrom && (!row.attachment?.prayerDate || new Date(row.attachment.prayerDate) < new Date(filters.attachmentPrayerDateFrom))) return null;
        if (filters.attachmentPrayerDateTo && (!row.attachment?.prayerDate || new Date(row.attachment.prayerDate) > new Date(filters.attachmentPrayerDateTo))) return null;
        if (filters.attachmentReceiptDateFrom && (!row.attachment?.receiptDate || new Date(row.attachment.receiptDate) < new Date(filters.attachmentReceiptDateFrom))) return null;
        if (filters.attachmentReceiptDateTo && (!row.attachment?.receiptDate || new Date(row.attachment.receiptDate) > new Date(filters.attachmentReceiptDateTo))) return null;
        // Attachment received but not executed
        if (filters.attachmentReceivedNotExecuted) {
          if (!row.attachment?.receiptDate || row.attachment?.executionDate) return null;
        }
        // Attachment issued X months ago
        if (filters.attachmentIssuedMonthsAgo) {
          if (!row.attachment?.prayerDate) return null;
          const monthsAgo = Number(filters.attachmentIssuedMonthsAgo);
          const prayerDate = new Date(row.attachment.prayerDate);
          const today = new Date();
          const diffMonths = (today.getFullYear() - prayerDate.getFullYear()) * 12 + (today.getMonth() - prayerDate.getMonth());
          if (diffMonths < monthsAgo - 1 || diffMonths > monthsAgo + 1) return null;
        }

        // Report filters
        if (filters.reportR1) {
          const hasR1 = filters.reportR1 === "Yes" ? !!row.reports?.r1 : !row.reports?.r1;
          if (!hasR1) return null;
        }
        if (filters.reportR1DateFrom && (!row.reports?.r1 || new Date(row.reports.r1) < new Date(filters.reportR1DateFrom))) return null;
        if (filters.reportR1DateTo && (!row.reports?.r1 || new Date(row.reports.r1) > new Date(filters.reportR1DateTo))) return null;

        if (filters.reportSupervision) {
          const hasSupervision = filters.reportSupervision === "Yes" ? !!row.reports?.supervision : !row.reports?.supervision;
          if (!hasSupervision) return null;
        }
        if (filters.reportSupervisionDateFrom && (!row.reports?.supervision || new Date(row.reports.supervision) < new Date(filters.reportSupervisionDateFrom))) return null;
        if (filters.reportSupervisionDateTo && (!row.reports?.supervision || new Date(row.reports.supervision) > new Date(filters.reportSupervisionDateTo))) return null;

        if (filters.reportR2) {
          const hasR2 = filters.reportR2 === "Yes" ? !!row.reports?.r2 : !row.reports?.r2;
          if (!hasR2) return null;
        }
        if (filters.reportR2DateFrom && (!row.reports?.r2 || new Date(row.reports.r2) < new Date(filters.reportR2DateFrom))) return null;
        if (filters.reportR2DateTo && (!row.reports?.r2 || new Date(row.reports.r2) > new Date(filters.reportR2DateTo))) return null;
        // R2 issued more than X months ago
        if (filters.reportR2IssuedMonthsAgo) {
          if (!row.reports?.r2) return null;
          const monthsAgo = Number(filters.reportR2IssuedMonthsAgo);
          const r2Date = new Date(row.reports.r2);
          const today = new Date();
          const diffMonths = (today.getFullYear() - r2Date.getFullYear()) * 12 + (today.getMonth() - r2Date.getMonth());
          if (diffMonths < monthsAgo) return null;
        }

        if (filters.reportR3) {
          const hasR3 = filters.reportR3 === "Yes" ? !!row.reports?.r3 : !row.reports?.r3;
          if (!hasR3) return null;
        }
        if (filters.reportR3DateFrom && (!row.reports?.r3 || new Date(row.reports.r3) < new Date(filters.reportR3DateFrom))) return null;
        if (filters.reportR3DateTo && (!row.reports?.r3 || new Date(row.reports.r3) > new Date(filters.reportR3DateTo))) return null;

        // PR1, PR2, PR3 reports
        if (filters.reportPR1) {
          const hasPR1 = filters.reportPR1 === "Yes" ? !!row.reports?.pr1 : !row.reports?.pr1;
          if (!hasPR1) return null;
        }
        if (filters.reportPR1DateFrom && (!row.reports?.pr1 || new Date(row.reports.pr1) < new Date(filters.reportPR1DateFrom))) return null;
        if (filters.reportPR1DateTo && (!row.reports?.pr1 || new Date(row.reports.pr1) > new Date(filters.reportPR1DateTo))) return null;

        if (filters.reportPR2) {
          const hasPR2 = filters.reportPR2 === "Yes" ? !!row.reports?.pr2 : !row.reports?.pr2;
          if (!hasPR2) return null;
        }
        if (filters.reportPR2DateFrom && (!row.reports?.pr2 || new Date(row.reports.pr2) < new Date(filters.reportPR2DateFrom))) return null;
        if (filters.reportPR2DateTo && (!row.reports?.pr2 || new Date(row.reports.pr2) > new Date(filters.reportPR2DateTo))) return null;

        if (filters.reportPR3) {
          const hasPR3 = filters.reportPR3 === "Yes" ? !!row.reports?.pr3 : !row.reports?.pr3;
          if (!hasPR3) return null;
        }
        if (filters.reportPR3DateFrom && (!row.reports?.pr3 || new Date(row.reports.pr3) < new Date(filters.reportPR3DateFrom))) return null;
        if (filters.reportPR3DateTo && (!row.reports?.pr3 || new Date(row.reports.pr3) > new Date(filters.reportPR3DateTo))) return null;

        if (filters.reportFPR) {
          const hasFPR = filters.reportFPR === "Yes" ? !!row.reports?.fpr : !row.reports?.fpr;
          if (!hasFPR) return null;
        }
        if (filters.reportFPRDateFrom && (!row.reports?.fpr || new Date(row.reports.fpr) < new Date(filters.reportFPRDateFrom))) return null;
        if (filters.reportFPRDateTo && (!row.reports?.fpr || new Date(row.reports.fpr) > new Date(filters.reportFPRDateTo))) return null;
        // FPR issued but charge sheet not submitted
        if (filters.reportFPRWithoutChargesheet) {
          if (!row.reports?.fpr || row.reports?.finalChargesheet) return null;
        }

        // Final Order
        if (filters.reportFinalOrder) {
          const hasFinalOrder = filters.reportFinalOrder === "Yes" ? !!row.reports?.finalOrder : !row.reports?.finalOrder;
          if (!hasFinalOrder) return null;
        }
        if (filters.reportFinalOrderDateFrom && (!row.reports?.finalOrder || new Date(row.reports.finalOrder) < new Date(filters.reportFinalOrderDateFrom))) return null;
        if (filters.reportFinalOrderDateTo && (!row.reports?.finalOrder || new Date(row.reports.finalOrder) > new Date(filters.reportFinalOrderDateTo))) return null;

        if (filters.reportFinalChargesheet) {
          const hasFinal = filters.reportFinalChargesheet === "Yes" ? !!row.reports?.finalChargesheet : !row.reports?.finalChargesheet;
          if (!hasFinal) return null;
        }
        if (filters.reportFinalChargesheetDateFrom && (!row.reports?.finalChargesheet || new Date(row.reports.finalChargesheet) < new Date(filters.reportFinalChargesheetDateFrom))) return null;
        if (filters.reportFinalChargesheetDateTo && (!row.reports?.finalChargesheet || new Date(row.reports.finalChargesheet) > new Date(filters.reportFinalChargesheetDateTo))) return null;

        // Final charge sheet submission in court
        if (filters.finalChargesheetSubmitted) {
          const submitted = filters.finalChargesheetSubmitted === "Yes";
          if (row.finalChargesheetSubmitted !== submitted) return null;
        }
        if (filters.finalChargesheetSubmissionDateFrom && (!row.finalChargesheetSubmissionDate || new Date(row.finalChargesheetSubmissionDate) < new Date(filters.finalChargesheetSubmissionDateFrom))) return null;
        if (filters.finalChargesheetSubmissionDateTo && (!row.finalChargesheetSubmissionDate || new Date(row.finalChargesheetSubmissionDate) > new Date(filters.finalChargesheetSubmissionDateTo))) return null;

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
      investigationStatus: [],
      priority: [],
      isPropertyProfessionalCrime: false,
      reasonForPendency: [],
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
      warrantPrayed: "",
      warrantPrayerDateFrom: "",
      warrantPrayerDateTo: "",
      warrantReceiptDateFrom: "",
      warrantReceiptDateTo: "",
      warrantExecutionDateFrom: "",
      warrantExecutionDateTo: "",
      warrantReceivedNotExecuted: false,
      warrantIssuedMonthsAgo: "",
      proclamationPrayed: "",
      proclamationPrayerDateFrom: "",
      proclamationPrayerDateTo: "",
      proclamationReceiptDateFrom: "",
      proclamationReceiptDateTo: "",
      proclamationExecutionDateFrom: "",
      proclamationExecutionDateTo: "",
      proclamationReceivedNotExecuted: false,
      proclamationIssuedMonthsAgo: "",
      attachmentPrayed: "",
      attachmentPrayerDateFrom: "",
      attachmentPrayerDateTo: "",
      attachmentReceiptDateFrom: "",
      attachmentReceiptDateTo: "",
      attachmentReceivedNotExecuted: false,
      attachmentIssuedMonthsAgo: "",
      reportR1: "",
      reportR1DateFrom: "",
      reportR1DateTo: "",
      reportSupervision: "",
      reportSupervisionDateFrom: "",
      reportSupervisionDateTo: "",
      reportR2: "",
      reportR2DateFrom: "",
      reportR2DateTo: "",
      reportR2IssuedMonthsAgo: "",
      reportR3: "",
      reportR3DateFrom: "",
      reportR3DateTo: "",
      reportPR1: "",
      reportPR1DateFrom: "",
      reportPR1DateTo: "",
      reportPR2: "",
      reportPR2DateFrom: "",
      reportPR2DateTo: "",
      reportPR3: "",
      reportPR3DateFrom: "",
      reportPR3DateTo: "",
      reportFPR: "",
      reportFPRDateFrom: "",
      reportFPRDateTo: "",
      reportFPRWithoutChargesheet: false,
      reportFinalOrder: "",
      reportFinalOrderDateFrom: "",
      reportFinalOrderDateTo: "",
      reportFinalChargesheet: "",
      reportFinalChargesheetDateFrom: "",
      reportFinalChargesheetDateTo: "",
      finalChargesheetSubmitted: "",
      finalChargesheetSubmissionDateFrom: "",
      finalChargesheetSubmissionDateTo: "",
      pageSize: 10,
    });
  }

  function statusBadgeColor(status: CaseStatus) {
    switch (status) {
      case "Disposed":
        return "bg-green-100 text-green-800 ring-green-600/20";
      case "Under investigation":
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
                    {(["Disposed", "Under investigation", "Decision Pending"] as CaseStatus[]).map((status) => (
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
                {/* Investigation Status (only shown when Under investigation is selected) */}
                {filters.caseStatus.includes("Under investigation") && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Investigation Status</label>
                    <div className="flex flex-col gap-2 pt-2">
                      {(["Detected", "Undetected"] as InvestigationStatus[]).map((status) => (
                        <label key={status} className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={filters.investigationStatus.includes(status)}
                            onChange={(e) => {
                              const set = new Set(filters.investigationStatus);
                              if (e.target.checked) set.add(status); else set.delete(status);
                              setFilters({ ...filters, investigationStatus: Array.from(set) });
                            }}
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <div className="flex flex-col gap-2 pt-2">
                    {(["Under monitoring", "Normal"] as Priority[]).map((priority) => (
                      <label key={priority} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.priority.includes(priority)}
                          onChange={(e) => {
                            const set = new Set(filters.priority);
                            if (e.target.checked) set.add(priority); else set.delete(priority);
                            setFilters({ ...filters, priority: Array.from(set) });
                          }}
                        />
                        {priority}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Property/Professional Crime */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property/Professional Crime</label>
                  <label className="inline-flex items-center gap-2 text-sm pt-2">
                    <input
                      type="checkbox"
                      checked={filters.isPropertyProfessionalCrime}
                      onChange={(e) => setFilters({ ...filters, isPropertyProfessionalCrime: e.target.checked })}
                    />
                    Identify property/professional crimes
                  </label>
                </div>
                {/* Reason for Pendency */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Pendency</label>
                  <select
                    multiple
                    value={filters.reasonForPendency}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters({ ...filters, reasonForPendency: selected });
                    }}
                    className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    size={4}
                  >
                    {REASON_FOR_PENDENCY_OPTIONS.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
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
              <div className="mb-6 border-t border-slate-200 pt-6 space-y-6">
                {/* Date Filters */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Date Filters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Case Date From</label>
                      <input type="date" value={filters.caseDateFrom} onChange={(e) => setFilters({ ...filters, caseDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Case Date To</label>
                      <input type="date" value={filters.caseDateTo} onChange={(e) => setFilters({ ...filters, caseDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
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

                {/* Warrant Filters */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Warrant Filters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Warrant Prayed</label>
                      <select value={filters.warrantPrayed} onChange={(e) => setFilters({ ...filters, warrantPrayed: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="NA">NA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prayer Date From</label>
                      <input type="date" value={filters.warrantPrayerDateFrom} onChange={(e) => setFilters({ ...filters, warrantPrayerDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prayer Date To</label>
                      <input type="date" value={filters.warrantPrayerDateTo} onChange={(e) => setFilters({ ...filters, warrantPrayerDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Date From</label>
                      <input type="date" value={filters.warrantReceiptDateFrom} onChange={(e) => setFilters({ ...filters, warrantReceiptDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Date To</label>
                      <input type="date" value={filters.warrantReceiptDateTo} onChange={(e) => setFilters({ ...filters, warrantReceiptDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Execution Date From</label>
                      <input type="date" value={filters.warrantExecutionDateFrom} onChange={(e) => setFilters({ ...filters, warrantExecutionDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Execution Date To</label>
                      <input type="date" value={filters.warrantExecutionDateTo} onChange={(e) => setFilters({ ...filters, warrantExecutionDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Warrant Received but Not Executed</label>
                      <label className="inline-flex items-center gap-2 text-sm pt-2">
                        <input
                          type="checkbox"
                          checked={filters.warrantReceivedNotExecuted}
                          onChange={(e) => setFilters({ ...filters, warrantReceivedNotExecuted: e.target.checked })}
                        />
                        Received but not executed
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Warrant Issued (Months Ago)</label>
                      <select value={filters.warrantIssuedMonthsAgo} onChange={(e) => setFilters({ ...filters, warrantIssuedMonthsAgo: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Any</option>
                        <option value="2">2 months ago</option>
                        <option value="3">3 months ago</option>
                        <option value="4">4 months ago</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Proclamation Filters */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Proclamation Filters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Proclamation Prayed</label>
                      <select value={filters.proclamationPrayed} onChange={(e) => setFilters({ ...filters, proclamationPrayed: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="NA">NA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prayer Date From</label>
                      <input type="date" value={filters.proclamationPrayerDateFrom} onChange={(e) => setFilters({ ...filters, proclamationPrayerDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prayer Date To</label>
                      <input type="date" value={filters.proclamationPrayerDateTo} onChange={(e) => setFilters({ ...filters, proclamationPrayerDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Date From</label>
                      <input type="date" value={filters.proclamationReceiptDateFrom} onChange={(e) => setFilters({ ...filters, proclamationReceiptDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Date To</label>
                      <input type="date" value={filters.proclamationReceiptDateTo} onChange={(e) => setFilters({ ...filters, proclamationReceiptDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Execution Date From</label>
                      <input type="date" value={filters.proclamationExecutionDateFrom} onChange={(e) => setFilters({ ...filters, proclamationExecutionDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Execution Date To</label>
                      <input type="date" value={filters.proclamationExecutionDateTo} onChange={(e) => setFilters({ ...filters, proclamationExecutionDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Proclamation Received but Not Executed</label>
                      <label className="inline-flex items-center gap-2 text-sm pt-2">
                        <input
                          type="checkbox"
                          checked={filters.proclamationReceivedNotExecuted}
                          onChange={(e) => setFilters({ ...filters, proclamationReceivedNotExecuted: e.target.checked })}
                        />
                        Received but not executed
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Proclamation Issued (Months Ago)</label>
                      <select value={filters.proclamationIssuedMonthsAgo} onChange={(e) => setFilters({ ...filters, proclamationIssuedMonthsAgo: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Any</option>
                        <option value="2">2 months ago</option>
                        <option value="3">3 months ago</option>
                        <option value="4">4 months ago</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Attachment Filters */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Attachment Filters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Attachment Prayed</label>
                      <select value={filters.attachmentPrayed} onChange={(e) => setFilters({ ...filters, attachmentPrayed: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="NA">NA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prayer Date From</label>
                      <input type="date" value={filters.attachmentPrayerDateFrom} onChange={(e) => setFilters({ ...filters, attachmentPrayerDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prayer Date To</label>
                      <input type="date" value={filters.attachmentPrayerDateTo} onChange={(e) => setFilters({ ...filters, attachmentPrayerDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Date From</label>
                      <input type="date" value={filters.attachmentReceiptDateFrom} onChange={(e) => setFilters({ ...filters, attachmentReceiptDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Date To</label>
                      <input type="date" value={filters.attachmentReceiptDateTo} onChange={(e) => setFilters({ ...filters, attachmentReceiptDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Attachment Received but Not Executed</label>
                      <label className="inline-flex items-center gap-2 text-sm pt-2">
                        <input
                          type="checkbox"
                          checked={filters.attachmentReceivedNotExecuted}
                          onChange={(e) => setFilters({ ...filters, attachmentReceivedNotExecuted: e.target.checked })}
                        />
                        Received but not executed
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Attachment Issued (Months Ago)</label>
                      <select value={filters.attachmentIssuedMonthsAgo} onChange={(e) => setFilters({ ...filters, attachmentIssuedMonthsAgo: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Any</option>
                        <option value="2">2 months ago</option>
                        <option value="3">3 months ago</option>
                        <option value="4">4 months ago</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Report Filters */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Report Filters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* R1 Report */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R1 Report</label>
                      <select value={filters.reportR1} onChange={(e) => setFilters({ ...filters, reportR1: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R1 Date From</label>
                      <input type="date" value={filters.reportR1DateFrom} onChange={(e) => setFilters({ ...filters, reportR1DateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R1 Date To</label>
                      <input type="date" value={filters.reportR1DateTo} onChange={(e) => setFilters({ ...filters, reportR1DateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                    {/* Supervision Report */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Supervision Report</label>
                      <select value={filters.reportSupervision} onChange={(e) => setFilters({ ...filters, reportSupervision: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Supervision Date From</label>
                      <input type="date" value={filters.reportSupervisionDateFrom} onChange={(e) => setFilters({ ...filters, reportSupervisionDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Supervision Date To</label>
                      <input type="date" value={filters.reportSupervisionDateTo} onChange={(e) => setFilters({ ...filters, reportSupervisionDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* R2 Report */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R2 Report</label>
                      <select value={filters.reportR2} onChange={(e) => setFilters({ ...filters, reportR2: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R2 Date From</label>
                      <input type="date" value={filters.reportR2DateFrom} onChange={(e) => setFilters({ ...filters, reportR2DateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R2 Date To</label>
                      <input type="date" value={filters.reportR2DateTo} onChange={(e) => setFilters({ ...filters, reportR2DateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R2 Issued More Than (Months)</label>
                      <select value={filters.reportR2IssuedMonthsAgo} onChange={(e) => setFilters({ ...filters, reportR2IssuedMonthsAgo: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Any</option>
                        <option value="3">More than 3 months</option>
                        <option value="6">More than 6 months</option>
                      </select>
                    </div>

                    {/* R3 Report */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R3 Report</label>
                      <select value={filters.reportR3} onChange={(e) => setFilters({ ...filters, reportR3: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R3 Date From</label>
                      <input type="date" value={filters.reportR3DateFrom} onChange={(e) => setFilters({ ...filters, reportR3DateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">R3 Date To</label>
                      <input type="date" value={filters.reportR3DateTo} onChange={(e) => setFilters({ ...filters, reportR3DateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* PR1 Report (issued by DSP) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PR1 Report (DSP)</label>
                      <select value={filters.reportPR1} onChange={(e) => setFilters({ ...filters, reportPR1: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PR1 Date From</label>
                      <input type="date" value={filters.reportPR1DateFrom} onChange={(e) => setFilters({ ...filters, reportPR1DateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PR1 Date To</label>
                      <input type="date" value={filters.reportPR1DateTo} onChange={(e) => setFilters({ ...filters, reportPR1DateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* PR2 Report (issued by DSP) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PR2 Report (DSP)</label>
                      <select value={filters.reportPR2} onChange={(e) => setFilters({ ...filters, reportPR2: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PR2 Date From</label>
                      <input type="date" value={filters.reportPR2DateFrom} onChange={(e) => setFilters({ ...filters, reportPR2DateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PR2 Date To</label>
                      <input type="date" value={filters.reportPR2DateTo} onChange={(e) => setFilters({ ...filters, reportPR2DateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* PR3 Report (issued by DSP) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PR3 Report (DSP)</label>
                      <select value={filters.reportPR3} onChange={(e) => setFilters({ ...filters, reportPR3: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PR3 Date From</label>
                      <input type="date" value={filters.reportPR3DateFrom} onChange={(e) => setFilters({ ...filters, reportPR3DateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PR3 Date To</label>
                      <input type="date" value={filters.reportPR3DateTo} onChange={(e) => setFilters({ ...filters, reportPR3DateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* FPR Report */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">FPR Report</label>
                      <select value={filters.reportFPR} onChange={(e) => setFilters({ ...filters, reportFPR: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">FPR Date From</label>
                      <input type="date" value={filters.reportFPRDateFrom} onChange={(e) => setFilters({ ...filters, reportFPRDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">FPR Date To</label>
                      <input type="date" value={filters.reportFPRDateTo} onChange={(e) => setFilters({ ...filters, reportFPRDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">FPR Without Charge Sheet</label>
                      <label className="inline-flex items-center gap-2 text-sm pt-2">
                        <input
                          type="checkbox"
                          checked={filters.reportFPRWithoutChargesheet}
                          onChange={(e) => setFilters({ ...filters, reportFPRWithoutChargesheet: e.target.checked })}
                        />
                        FPR issued but charge sheet not submitted
                      </label>
                    </div>

                    {/* Final Order */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Final Order</label>
                      <select value={filters.reportFinalOrder} onChange={(e) => setFilters({ ...filters, reportFinalOrder: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Final Order Date From</label>
                      <input type="date" value={filters.reportFinalOrderDateFrom} onChange={(e) => setFilters({ ...filters, reportFinalOrderDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Final Order Date To</label>
                      <input type="date" value={filters.reportFinalOrderDateTo} onChange={(e) => setFilters({ ...filters, reportFinalOrderDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* Final Chargesheet */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Final Chargesheet</label>
                      <select value={filters.reportFinalChargesheet} onChange={(e) => setFilters({ ...filters, reportFinalChargesheet: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Final Chargesheet Date From</label>
                      <input type="date" value={filters.reportFinalChargesheetDateFrom} onChange={(e) => setFilters({ ...filters, reportFinalChargesheetDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Final Chargesheet Date To</label>
                      <input type="date" value={filters.reportFinalChargesheetDateTo} onChange={(e) => setFilters({ ...filters, reportFinalChargesheetDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* Final Charge Sheet Submission in Court */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Final Charge Sheet Submitted in Court</label>
                      <select value={filters.finalChargesheetSubmitted} onChange={(e) => setFilters({ ...filters, finalChargesheetSubmitted: e.target.value as any })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Submission Date From</label>
                      <input type="date" value={filters.finalChargesheetSubmissionDateFrom} onChange={(e) => setFilters({ ...filters, finalChargesheetSubmissionDateFrom: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Submission Date To</label>
                      <input type="date" value={filters.finalChargesheetSubmissionDateTo} onChange={(e) => setFilters({ ...filters, finalChargesheetSubmissionDateTo: e.target.value })} className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
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
