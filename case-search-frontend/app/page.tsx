"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard } from "../components/AuthGuard";
import { useAuth } from "../contexts/AuthContext";
import { deriveDecisionPendingStatus, DecisionPendingStatus } from "@/lib/decisionPending";
import Image from "next/image";

type CaseStatus = "Disposed" | "Under investigation";
type InvestigationStatus = "Detected" | "Undetected";
type Priority = "Under monitoring" | "Normal";

type AccusedStatus = "Arrested" | "Not arrested" | "Decision pending";

type Accused = {
  name: string;
  status: AccusedStatus;
  address?: string;
  mobileNumber?: string;
  aadhaarNumber?: string;
  state?: string;
  district?: string;
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
};


type ReportItem = {
  label?: string;
  date?: string;
  file?: {
    public_id?: string;
    secure_url?: string;
    url?: string;
    original_filename?: string;
    format?: string;
    bytes?: number;
  };
};

type Diary = {
  diaryNo?: string;
  diaryDate?: string;
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
  spReports?: ReportItem[];
  dspReports?: ReportItem[];
};

type CaseRow = {
  caseNo: string;
  year: number;
  policeStation: string;
  crimeHead?: string;
  crimeSection: string;
  punishmentCategory: "\u22647 yrs" | ">7 yrs";
  accused: Accused[];
  caseStatus: CaseStatus;
  decisionPendingStatus: DecisionPendingStatus;
  caseDecisionStatus?: string;
  investigationStatus?: InvestigationStatus;
  priority?: Priority;
  isPropertyProfessionalCrime?: boolean;
  reasonForPendency?: string[];
  reports?: ReportInfo;
  finalChargesheetSubmitted?: boolean;
  finalChargesheetSubmissionDate?: string;
  diary?: Diary[];
};

const POLICE_STATIONS = [
  "Town",
  "Jasidih",
  "Devipur",
  "Kunda",
  "Rikhiya",
  "Mohanpur",
  "Sarwan",
  "Sonaraithari",
  "Mahila Deoghar",
  "ST/SC",
  "Budhai",
  "Madhupur",
  "Pathrol",
  "Margomunda",
  "Karoun",
  "Chitra",
  "Khaga",
  "Palajori",
  "Sarath",
  "Mahila Madhupur",
  "Cyber",
  "Pathradda OP",
];

const DECISION_PENDING_OPTIONS: DecisionPendingStatus[] = [
  "Decision pending",
  "Partial",
  "Completed",
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const DISTRICTS_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool",
    "Prakasam", "Nellore", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"
  ],
  "Arunachal Pradesh": [
    "Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi",
    "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang",
    "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai",
    "Changlang", "Tirap", "Longding", "Kamle", "Pakke Kessang", "Lepa Rada", "Shi Yomi"
  ],
  "Assam": [
    "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang",
    "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat",
    "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong",
    "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari",
    "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"
  ],
  "Bihar": [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
    "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
    "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani",
    "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa",
    "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul",
    "Vaishali", "West Champaran"
  ],
  "Chhattisgarh": [
    "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur",
    "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa",
    "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund",
    "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur",
    "Surguja", "Uttar Bastar Kanker"
  ],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": [
    "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar",
    "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar",
    "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda", "Mahisagar", "Mehsana",
    "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot",
    "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
  ],
  "Haryana": [
    "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram",
    "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh",
    "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
  ],
  "Himachal Pradesh": [
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti",
    "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
  ],
  "Jharkhand": [
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa",
    "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma",
    "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj",
    "Seraikela-Kharsawan", "Simdega", "West Singhbhum"
  ],
  "Karnataka": [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar",
    "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
    "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu",
    "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
    "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Vijayanagara", "Yadgir"
  ],
  "Kerala": [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam",
    "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani",
    "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh",
    "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad",
    "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla",
    "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh",
    "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur",
    "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"
  ],
  "Maharashtra": [
    "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana",
    "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna",
    "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
    "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad",
    "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
    "Washim", "Yavatmal"
  ],
  "Manipur": [
    "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam",
    "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong",
    "Tengnoupal", "Thoubal", "Ukhrul"
  ],
  "Meghalaya": [
    "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills",
    "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills",
    "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
  ],
  "Mizoram": [
    "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei",
    "Mamit", "Saiha", "Saitual", "Serchhip"
  ],
  "Nagaland": [
    "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren",
    "Phek", "Tuensang", "Wokha", "Zunheboto"
  ],
  "Odisha": [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
    "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
    "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha",
    "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada",
    "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
  ],
  "Punjab": [
    "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka",
    "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana",
    "Malerkotla", "Mansa", "Moga", "Muktsar", "Nawanshahr", "Pathankot", "Patiala",
    "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar",
    "Sri Muktsar Sahib", "Tarn Taran"
  ],
  "Rajasthan": [
    "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara",
    "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur",
    "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu",
    "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand",
    "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"
  ],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
    "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
    "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
    "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
    "Viluppuram", "Virudhunagar"
  ],
  "Telangana": [
    "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial",
    "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
    "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak",
    "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal",
    "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet",
    "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
  ],
  "Tripura": [
    "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura",
    "Unakoti", "West Tripura"
  ],
  "Uttar Pradesh": [
    "Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya",
    "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki",
    "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli",
    "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur",
    "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur",
    "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj",
    "Kanpur Dehat", "Kanpur Nagar", "Kaushambi", "Kushinagar", "Lakhimpur Kheri",
    "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau",
    "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh",
    "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur",
    "Shamli", "Shrawasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur",
    "Unnao", "Varanasi"
  ],
  "Uttarakhand": [
    "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar",
    "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"
  ],
  "West Bengal": [
    "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling",
    "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda",
    "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur",
    "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
  ],
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
  ],
  "Jammu and Kashmir": [
    "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu",
    "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri",
    "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
  ],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
};

export default function Home() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i), [currentYear]);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [crimeHeads, setCrimeHeads] = useState<string[]>([]);
  const [reasonForPendencyOptions, setReasonForPendencyOptions] = useState<string[]>([]);
  const [newReasonInput, setNewReasonInput] = useState("");
  const [showAddReasonModal, setShowAddReasonModal] = useState(false);

  // Collapsible filter sections state
  const [expandedSections, setExpandedSections] = useState({
    accused: false,
    dates: false,
    reports: false,
    diary: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
    decisionPendingStatus: "" as "" | DecisionPendingStatus,
    caseDecisionStatus: "" as "" | "True" | "False" | "Partial Pendency" | "Complete Pendency",
    investigationStatus: [] as Array<InvestigationStatus>,
    priority: [] as Array<Priority>,
    isPropertyProfessionalCrime: false,
    reasonForPendency: [] as string[],
    // Accused filters
    accusedName: "",
    accusedStatus: "" as "" | "Arrested" | "Not arrested" | "Decision pending",
    accusedAddress: "",
    accusedMobileNumber: "",
    accusedAadhaarNumber: "",
    accusedState: "",
    accusedDistrict: "",
    accusedCountMin: "",
    accusedCountMax: "",
    arrestedCountMin: "",
    arrestedCountMax: "",
    unarrestedCountMin: "",
    unarrestedCountMax: "",
    // Notice 41A filters
    notice41AIssued: false,
    notice41ADateFrom: "",
    notice41ADateTo: "",
    // Warrant filters
    warrantPrayed: "" as "" | "Yes" | "No",
    warrantPrayerDateFrom: "",
    warrantPrayerDateTo: "",
    warrantReceiptDateFrom: "",
    warrantReceiptDateTo: "",
    warrantExecutionDateFrom: "",
    warrantExecutionDateTo: "",
    warrantReturnDateFrom: "",
    warrantReturnDateTo: "",
    warrantReceivedButNotExecuted: false,
    warrantIssuedMonthsAgo: "",
    // Proclamation filters
    proclamationPrayed: "" as "" | "Yes" | "No",
    proclamationPrayerDateFrom: "",
    proclamationPrayerDateTo: "",
    proclamationReceiptDateFrom: "",
    proclamationReceiptDateTo: "",
    proclamationExecutionDateFrom: "",
    proclamationExecutionDateTo: "",
    proclamationReturnDateFrom: "",
    proclamationReturnDateTo: "",
    proclamationReceivedButNotExecuted: false,
    proclamationIssuedMonthsAgo: "",
    // Attachment filters
    attachmentPrayed: "" as "" | "Yes" | "No",
    attachmentPrayerDateFrom: "",
    attachmentPrayerDateTo: "",
    attachmentReceiptDateFrom: "",
    attachmentReceiptDateTo: "",
    attachmentExecutionDateFrom: "",
    attachmentExecutionDateTo: "",
    attachmentReturnDateFrom: "",
    attachmentReturnDateTo: "",
    attachmentReceivedButNotExecuted: false,
    attachmentIssuedMonthsAgo: "",
    // Date filters
    caseDateFrom: "",
    caseDateTo: "",
    arrestDateFrom: "",
    arrestDateTo: "",
    // Report filters
    reportR1: "" as "" | "Yes" | "No",
    reportR1DateFrom: "",
    reportR1DateTo: "",
    reportR1IssuedMonthsAgo: "",
    reportSupervision: "" as "" | "Yes" | "No",
    reportSupervisionDateFrom: "",
    reportSupervisionDateTo: "",
    reportR2: "" as "" | "Yes" | "No",
    reportR2DateFrom: "",
    reportR2DateTo: "",
    reportR2IssuedMonthsAgo: "",
    reportR3: "" as "" | "Yes" | "No",
    reportR3DateFrom: "",
    reportR3DateTo: "",
    reportR3IssuedMonthsAgo: "",
    reportPR1: "" as "" | "Yes" | "No",
    reportPR1DateFrom: "",
    reportPR1DateTo: "",
    reportPR1IssuedMonthsAgo: "",
    reportPR2: "" as "" | "Yes" | "No",
    reportPR2DateFrom: "",
    reportPR2DateTo: "",
    reportPR2IssuedMonthsAgo: "",
    reportPR3: "" as "" | "Yes" | "No",
    reportPR3DateFrom: "",
    reportPR3DateTo: "",
    reportPR3IssuedMonthsAgo: "",
    reportFPR: "" as "" | "Yes" | "No",
    reportFPRDateFrom: "",
    reportFPRDateTo: "",
    reportFPRIssuedMonthsAgo: "",
    reportFPRWithoutChargesheet: false,
    reportFinalOrder: "" as "" | "Yes" | "No",
    reportFinalOrderDateFrom: "",
    reportFinalOrderDateTo: "",
    reportFinalOrderIssuedMonthsAgo: "",
    reportFinalChargesheet: "" as "" | "Yes" | "No",
    reportFinalChargesheetDateFrom: "",
    reportFinalChargesheetDateTo: "",
    reportFinalChargesheetIssuedMonthsAgo: "",
    finalChargesheetSubmitted: "" as "" | "Yes" | "No",
    finalChargesheetSubmissionDateFrom: "",
    finalChargesheetSubmissionDateTo: "",
    // Diary filters
    diaryNo: "",
    diaryDateFrom: "",
    diaryDateTo: "",
    pageSize: 10 as 10 | 25 | 50,
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const [data, setData] = useState<CaseRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch crime heads
        const crimeHeadsResponse = await fetch('/api/crime-heads');
        const crimeHeadsData = await crimeHeadsResponse.json();
        if (crimeHeadsData.success) {
          setCrimeHeads(crimeHeadsData.data);
        }

        // Fetch reasons for pendency
        const reasonsResponse = await fetch('/api/reason-for-pendency');
        const reasonsData = await reasonsResponse.json();
        if (reasonsData.success) {
          setReasonForPendencyOptions(reasonsData.data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchOptions();
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setDataLoading(true);
      const response = await fetch("/api/cases?limit=1000");
      const result = await response.json();

      if (result.success) {
        // Transform API data to match CaseRow type
        const transformedData: CaseRow[] = result.data.map((item: any) => {
          // Handle legacy data: if caseStatus is "Decision Pending", convert to decisionPending status
          let caseStatus: CaseStatus = item.caseStatus as CaseStatus;
          const legacyDecisionPending =
            item.decisionPending === true || item.caseStatus === "Decision Pending";

          if (item.caseStatus === "Decision Pending") {
            caseStatus = "Under investigation"; // Default to "Under investigation" for legacy data
          }

          const decisionPendingStatus = deriveDecisionPendingStatus(
            item.accused || [],
            legacyDecisionPending
          );

          return {
            caseNo: item.caseNo,
            year: item.year,
            policeStation: item.policeStation,
            crimeHead: item.crimeHead || "",
            crimeSection: item.crimeSection || item.section || "",
            punishmentCategory: item.punishmentCategory as "≤7 yrs" | ">7 yrs",
            accused: item.accused || [],
            caseStatus: caseStatus,
            decisionPendingStatus,
            caseDecisionStatus: item.caseDecisionStatus as string | undefined,
            investigationStatus: item.investigationStatus as InvestigationStatus | undefined,
            priority: item.priority as Priority | undefined,
            isPropertyProfessionalCrime: item.isPropertyProfessionalCrime || false,
            reasonForPendency: item.reasonForPendency || [],
            reports: item.reports,
            finalChargesheetSubmitted: item.finalChargesheetSubmitted || false,
            finalChargesheetSubmissionDate: item.finalChargesheetSubmissionDate,
            diary: item.diary || [],
          };
        });
        setData(transformedData);
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setDataLoading(false);
    }
  };

  // Original hardcoded data (kept as fallback/initial state)
  const [initialData] = useState<CaseRow[]>(() => {
    const seed: Array<Omit<CaseRow, "decisionPendingStatus"> & { decisionPending?: boolean }> = [
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
        caseStatus: "Under investigation",
        priority: "Under monitoring",
        accused: [
          { name: "Vikram Singh", status: "Decision pending" },
        ],
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
        caseStatus: "Under investigation",
        decisionPending: true,
        priority: "Under monitoring",
        isPropertyProfessionalCrime: false,
        accused: [
          { name: "Vishal Sharma", status: "Decision pending" },
          { name: "Rohit Verma", status: "Decision pending" },
        ],
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
        caseStatus: "Under investigation",
        decisionPending: true,
        priority: "Normal",
        isPropertyProfessionalCrime: false,
        accused: [
          { name: "Tarun Agarwal", status: "Decision pending" },
        ],
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
    ];
    return seed.map(({ decisionPending, ...rest }) => ({
      ...rest,
      decisionPendingStatus: deriveDecisionPendingStatus(rest.accused || [], decisionPending),
    }));
  });

  // Helper function to check if a date is older than X days
  const checkTimeAgo = (dateStr: string | undefined | null, daysThresholdStr: string) => {
    if (!dateStr || !daysThresholdStr) return false;
    const daysThreshold = Number(daysThresholdStr);
    if (isNaN(daysThreshold)) return false;

    const dateObj = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > daysThreshold;
  };

  const filtered = useMemo(() => {
    return data
      .map((row) => {
        // Check accused filters
        let matchedAccused: Accused[] = [];
        const hasAccusedFilters = filters.accusedName || filters.accusedStatus || filters.accusedAddress ||
          filters.accusedMobileNumber || filters.accusedAadhaarNumber || filters.accusedState ||
          filters.accusedDistrict || filters.notice41AIssued || filters.warrantPrayed ||
          filters.warrantReceivedButNotExecuted || filters.warrantIssuedMonthsAgo ||
          filters.proclamationPrayed || filters.proclamationReceivedButNotExecuted || filters.proclamationIssuedMonthsAgo ||
          filters.attachmentPrayed || filters.attachmentReceivedButNotExecuted || filters.attachmentIssuedMonthsAgo;

        if (hasAccusedFilters) {
          matchedAccused = row.accused.filter((acc: any) => {
            const nameMatch = !filters.accusedName || acc.name?.toLowerCase().includes(filters.accusedName.toLowerCase());
            const statusMatch = !filters.accusedStatus || acc.status?.toLowerCase() === filters.accusedStatus.toLowerCase();
            const addressMatch = !filters.accusedAddress || acc.address?.toLowerCase().includes(filters.accusedAddress.toLowerCase());
            const mobileMatch = !filters.accusedMobileNumber || acc.mobileNumber?.includes(filters.accusedMobileNumber);
            const aadhaarMatch = !filters.accusedAadhaarNumber || acc.aadhaarNumber?.includes(filters.accusedAadhaarNumber);
            const stateMatch = !filters.accusedState || acc.state === filters.accusedState;
            const districtMatch = !filters.accusedDistrict || acc.district === filters.accusedDistrict;

            // Notice 41A filters
            let notice41AMatch = true;
            if (filters.notice41AIssued) {
              notice41AMatch = acc.notice41A?.issued === true;
            }
            if (filters.notice41ADateFrom || filters.notice41ADateTo) {
              const noticeDate = acc.notice41A?.notice1Date || acc.notice41A?.notice2Date || acc.notice41A?.notice3Date;
              if (!noticeDate) {
                notice41AMatch = false;
              } else {
                const date = new Date(noticeDate);
                if (filters.notice41ADateFrom && date < new Date(filters.notice41ADateFrom)) notice41AMatch = false;
                if (filters.notice41ADateTo && date > new Date(filters.notice41ADateTo)) notice41AMatch = false;
              }
            }

            // Warrant filters
            let warrantMatch = true;
            if (filters.warrantPrayed === "Yes") {
              warrantMatch = acc.warrant?.prayed === true;
            } else if (filters.warrantPrayed === "No") {
              warrantMatch = acc.warrant?.prayed !== true;
            }
            if (filters.warrantReceivedButNotExecuted) {
              const hasReceipt = !!acc.warrant?.receiptDate;
              const hasExecution = !!acc.warrant?.executionDate;
              if (!hasReceipt || hasExecution) warrantMatch = false;
            }
            if (filters.warrantIssuedMonthsAgo) {
              const prayerDate = acc.warrant?.prayerDate;
              if (!prayerDate || !checkTimeAgo(prayerDate, filters.warrantIssuedMonthsAgo)) {
                warrantMatch = false;
              }
            }
            if (filters.warrantPrayerDateFrom || filters.warrantPrayerDateTo) {
              const date = acc.warrant?.prayerDate ? new Date(acc.warrant.prayerDate) : null;
              if (!date) warrantMatch = false;
              else {
                if (filters.warrantPrayerDateFrom && date < new Date(filters.warrantPrayerDateFrom)) warrantMatch = false;
                if (filters.warrantPrayerDateTo && date > new Date(filters.warrantPrayerDateTo)) warrantMatch = false;
              }
            }
            if (filters.warrantReceiptDateFrom || filters.warrantReceiptDateTo) {
              const date = acc.warrant?.receiptDate ? new Date(acc.warrant.receiptDate) : null;
              if (!date) warrantMatch = false;
              else {
                if (filters.warrantReceiptDateFrom && date < new Date(filters.warrantReceiptDateFrom)) warrantMatch = false;
                if (filters.warrantReceiptDateTo && date > new Date(filters.warrantReceiptDateTo)) warrantMatch = false;
              }
            }
            if (filters.warrantExecutionDateFrom || filters.warrantExecutionDateTo) {
              const date = acc.warrant?.executionDate ? new Date(acc.warrant.executionDate) : null;
              if (!date) warrantMatch = false;
              else {
                if (filters.warrantExecutionDateFrom && date < new Date(filters.warrantExecutionDateFrom)) warrantMatch = false;
                if (filters.warrantExecutionDateTo && date > new Date(filters.warrantExecutionDateTo)) warrantMatch = false;
              }
            }
            if (filters.warrantReturnDateFrom || filters.warrantReturnDateTo) {
              const date = acc.warrant?.returnDate ? new Date(acc.warrant.returnDate) : null;
              if (!date) warrantMatch = false;
              else {
                if (filters.warrantReturnDateFrom && date < new Date(filters.warrantReturnDateFrom)) warrantMatch = false;
                if (filters.warrantReturnDateTo && date > new Date(filters.warrantReturnDateTo)) warrantMatch = false;
              }
            }

            // Proclamation filters
            let proclamationMatch = true;
            if (filters.proclamationPrayed === "Yes") {
              proclamationMatch = acc.proclamation?.prayed === true;
            } else if (filters.proclamationPrayed === "No") {
              proclamationMatch = acc.proclamation?.prayed !== true;
            }
            if (filters.proclamationReceivedButNotExecuted) {
              const hasReceipt = !!acc.proclamation?.receiptDate;
              const hasExecution = !!acc.proclamation?.executionDate;
              if (!hasReceipt || hasExecution) proclamationMatch = false;
            }
            if (filters.proclamationIssuedMonthsAgo) {
              const prayerDate = acc.proclamation?.prayerDate;
              if (!prayerDate || !checkTimeAgo(prayerDate, filters.proclamationIssuedMonthsAgo)) {
                proclamationMatch = false;
              }
            }
            if (filters.proclamationPrayerDateFrom || filters.proclamationPrayerDateTo) {
              const date = acc.proclamation?.prayerDate ? new Date(acc.proclamation.prayerDate) : null;
              if (!date) proclamationMatch = false;
              else {
                if (filters.proclamationPrayerDateFrom && date < new Date(filters.proclamationPrayerDateFrom)) proclamationMatch = false;
                if (filters.proclamationPrayerDateTo && date > new Date(filters.proclamationPrayerDateTo)) proclamationMatch = false;
              }
            }
            if (filters.proclamationReceiptDateFrom || filters.proclamationReceiptDateTo) {
              const date = acc.proclamation?.receiptDate ? new Date(acc.proclamation.receiptDate) : null;
              if (!date) proclamationMatch = false;
              else {
                if (filters.proclamationReceiptDateFrom && date < new Date(filters.proclamationReceiptDateFrom)) proclamationMatch = false;
                if (filters.proclamationReceiptDateTo && date > new Date(filters.proclamationReceiptDateTo)) proclamationMatch = false;
              }
            }
            if (filters.proclamationExecutionDateFrom || filters.proclamationExecutionDateTo) {
              const date = acc.proclamation?.executionDate ? new Date(acc.proclamation.executionDate) : null;
              if (!date) proclamationMatch = false;
              else {
                if (filters.proclamationExecutionDateFrom && date < new Date(filters.proclamationExecutionDateFrom)) proclamationMatch = false;
                if (filters.proclamationExecutionDateTo && date > new Date(filters.proclamationExecutionDateTo)) proclamationMatch = false;
              }
            }
            if (filters.proclamationReturnDateFrom || filters.proclamationReturnDateTo) {
              const date = acc.proclamation?.returnDate ? new Date(acc.proclamation.returnDate) : null;
              if (!date) proclamationMatch = false;
              else {
                if (filters.proclamationReturnDateFrom && date < new Date(filters.proclamationReturnDateFrom)) proclamationMatch = false;
                if (filters.proclamationReturnDateTo && date > new Date(filters.proclamationReturnDateTo)) proclamationMatch = false;
              }
            }

            // Attachment filters
            let attachmentMatch = true;
            if (filters.attachmentPrayed === "Yes") {
              attachmentMatch = acc.attachment?.prayed === true;
            } else if (filters.attachmentPrayed === "No") {
              attachmentMatch = acc.attachment?.prayed !== true;
            }
            if (filters.attachmentReceivedButNotExecuted) {
              const hasReceipt = !!acc.attachment?.receiptDate;
              const hasExecution = !!acc.attachment?.executionDate;
              if (!hasReceipt || hasExecution) attachmentMatch = false;
            }
            if (filters.attachmentIssuedMonthsAgo) {
              const prayerDate = acc.attachment?.prayerDate;
              if (!prayerDate || !checkTimeAgo(prayerDate, filters.attachmentIssuedMonthsAgo)) {
                attachmentMatch = false;
              }
            }
            if (filters.attachmentPrayerDateFrom || filters.attachmentPrayerDateTo) {
              const date = acc.attachment?.prayerDate ? new Date(acc.attachment.prayerDate) : null;
              if (!date) attachmentMatch = false;
              else {
                if (filters.attachmentPrayerDateFrom && date < new Date(filters.attachmentPrayerDateFrom)) attachmentMatch = false;
                if (filters.attachmentPrayerDateTo && date > new Date(filters.attachmentPrayerDateTo)) attachmentMatch = false;
              }
            }
            if (filters.attachmentReceiptDateFrom || filters.attachmentReceiptDateTo) {
              const date = acc.attachment?.receiptDate ? new Date(acc.attachment.receiptDate) : null;
              if (!date) attachmentMatch = false;
              else {
                if (filters.attachmentReceiptDateFrom && date < new Date(filters.attachmentReceiptDateFrom)) attachmentMatch = false;
                if (filters.attachmentReceiptDateTo && date > new Date(filters.attachmentReceiptDateTo)) attachmentMatch = false;
              }
            }
            if (filters.attachmentExecutionDateFrom || filters.attachmentExecutionDateTo) {
              const date = acc.attachment?.executionDate ? new Date(acc.attachment.executionDate) : null;
              if (!date) attachmentMatch = false;
              else {
                if (filters.attachmentExecutionDateFrom && date < new Date(filters.attachmentExecutionDateFrom)) attachmentMatch = false;
                if (filters.attachmentExecutionDateTo && date > new Date(filters.attachmentExecutionDateTo)) attachmentMatch = false;
              }
            }
            if (filters.attachmentReturnDateFrom || filters.attachmentReturnDateTo) {
              const date = acc.attachment?.returnDate ? new Date(acc.attachment.returnDate) : null;
              if (!date) attachmentMatch = false;
              else {
                if (filters.attachmentReturnDateFrom && date < new Date(filters.attachmentReturnDateFrom)) attachmentMatch = false;
                if (filters.attachmentReturnDateTo && date > new Date(filters.attachmentReturnDateTo)) attachmentMatch = false;
              }
            }

            return nameMatch && statusMatch && addressMatch && mobileMatch && aadhaarMatch &&
              stateMatch && districtMatch && notice41AMatch && warrantMatch &&
              proclamationMatch && attachmentMatch;
          });
        }

        // If accused filters are applied but no match, exclude case
        if (hasAccusedFilters && matchedAccused.length === 0) {
          return null;
        }

        // Basic filters
        if (filters.caseNo && !row.caseNo.toLowerCase().includes(filters.caseNo.toLowerCase())) return null;
        if (filters.policeStation && row.policeStation !== filters.policeStation) return null;
        if (filters.crimeHead && (!row.crimeHead || row.crimeHead !== filters.crimeHead)) return null;
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

        // Decision Pending filter (derived from accused statuses)
        if (filters.decisionPendingStatus && row.decisionPendingStatus !== filters.decisionPendingStatus) return null;

        // Case Decision Status filter
        if (filters.caseDecisionStatus && row.caseDecisionStatus !== filters.caseDecisionStatus) return null;

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

        // Reason for Pendency filter
        if (filters.reasonForPendency.length > 0) {
          const caseReasons = row.reasonForPendency || [];
          const hasMatchingReason = filters.reasonForPendency.some(filterReason =>
            caseReasons.includes(filterReason)
          );
          if (!hasMatchingReason) return null;
        }

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

        // Report filters
        const reportsData = row.reports || {};
        const spReportsList = Array.isArray(reportsData.spReports) ? reportsData.spReports : [];
        const dspReportsList = Array.isArray(reportsData.dspReports) ? reportsData.dspReports : [];

        const ensureReportPair = (idx: number) => {
          const spReport = spReportsList[idx];
          const dspReport = dspReportsList[idx];

          const legacyR = (reportsData as any)[`r${idx + 1}`];
          const legacyPR = (reportsData as any)[`pr${idx + 1}`];

          if (!spReport && !dspReport && !legacyR && !legacyPR) return null;

          return {
            rLabel: spReport?.label || `R${idx + 1}`,
            rDate: spReport?.date || legacyR || "",
            prLabel: dspReport?.label || `PR${idx + 1}`,
            prDate: dspReport?.date || legacyPR || "",
          };
        };

        const reportPairs = [ensureReportPair(0), ensureReportPair(1), ensureReportPair(2)];
        const [r1Pair, r2Pair, r3Pair] = reportPairs;
        const r1Date = r1Pair?.rDate || "";
        const r2Date = r2Pair?.rDate || "";
        const r3Date = r3Pair?.rDate || "";
        const pr1Date = r1Pair?.prDate || "";
        const pr2Date = r2Pair?.prDate || "";
        const pr3Date = r3Pair?.prDate || "";

        if (filters.reportR1) {
          const hasR1 = filters.reportR1 === "Yes" ? !!r1Date : !r1Date;
          if (!hasR1) return null;
        }
        if (filters.reportR1DateFrom && (!r1Date || new Date(r1Date) < new Date(filters.reportR1DateFrom))) return null;
        if (filters.reportR1DateTo && (!r1Date || new Date(r1Date) > new Date(filters.reportR1DateTo))) return null;
        if (filters.reportR1IssuedMonthsAgo) {
          if (!r1Date || !checkTimeAgo(r1Date, filters.reportR1IssuedMonthsAgo)) return null;
        }

        if (filters.reportSupervision) {
          const hasSupervision = filters.reportSupervision === "Yes" ? !!reportsData.supervision : !reportsData.supervision;
          if (!hasSupervision) return null;
        }
        if (filters.reportSupervisionDateFrom && (!reportsData.supervision || new Date(reportsData.supervision) < new Date(filters.reportSupervisionDateFrom))) return null;
        if (filters.reportSupervisionDateTo && (!reportsData.supervision || new Date(reportsData.supervision) > new Date(filters.reportSupervisionDateTo))) return null;

        if (filters.reportR2) {
          const hasR2 = filters.reportR2 === "Yes" ? !!r2Date : !r2Date;
          if (!hasR2) return null;
        }
        if (filters.reportR2DateFrom && (!r2Date || new Date(r2Date) < new Date(filters.reportR2DateFrom))) return null;
        if (filters.reportR2DateTo && (!r2Date || new Date(r2Date) > new Date(filters.reportR2DateTo))) return null;
        if (filters.reportR2IssuedMonthsAgo) {
          if (!r2Date || !checkTimeAgo(r2Date, filters.reportR2IssuedMonthsAgo)) return null;
        }

        if (filters.reportR3) {
          const hasR3 = filters.reportR3 === "Yes" ? !!r3Date : !r3Date;
          if (!hasR3) return null;
        }
        if (filters.reportR3DateFrom && (!r3Date || new Date(r3Date) < new Date(filters.reportR3DateFrom))) return null;
        if (filters.reportR3DateTo && (!r3Date || new Date(r3Date) > new Date(filters.reportR3DateTo))) return null;
        if (filters.reportR3IssuedMonthsAgo) {
          if (!r3Date || !checkTimeAgo(r3Date, filters.reportR3IssuedMonthsAgo)) return null;
        }

        if (filters.reportPR1) {
          const hasPR1 = filters.reportPR1 === "Yes" ? !!pr1Date : !pr1Date;
          if (!hasPR1) return null;
        }
        if (filters.reportPR1DateFrom && (!pr1Date || new Date(pr1Date) < new Date(filters.reportPR1DateFrom))) return null;
        if (filters.reportPR1DateTo && (!pr1Date || new Date(pr1Date) > new Date(filters.reportPR1DateTo))) return null;
        if (filters.reportPR1IssuedMonthsAgo) {
          if (!pr1Date || !checkTimeAgo(pr1Date, filters.reportPR1IssuedMonthsAgo)) return null;
        }

        if (filters.reportPR2) {
          const hasPR2 = filters.reportPR2 === "Yes" ? !!pr2Date : !pr2Date;
          if (!hasPR2) return null;
        }
        if (filters.reportPR2DateFrom && (!pr2Date || new Date(pr2Date) < new Date(filters.reportPR2DateFrom))) return null;
        if (filters.reportPR2DateTo && (!pr2Date || new Date(pr2Date) > new Date(filters.reportPR2DateTo))) return null;
        if (filters.reportPR2IssuedMonthsAgo) {
          if (!pr2Date || !checkTimeAgo(pr2Date, filters.reportPR2IssuedMonthsAgo)) return null;
        }

        if (filters.reportPR3) {
          const hasPR3 = filters.reportPR3 === "Yes" ? !!pr3Date : !pr3Date;
          if (!hasPR3) return null;
        }
        if (filters.reportPR3DateFrom && (!pr3Date || new Date(pr3Date) < new Date(filters.reportPR3DateFrom))) return null;
        if (filters.reportPR3DateTo && (!pr3Date || new Date(pr3Date) > new Date(filters.reportPR3DateTo))) return null;
        if (filters.reportPR3IssuedMonthsAgo) {
          if (!pr3Date || !checkTimeAgo(pr3Date, filters.reportPR3IssuedMonthsAgo)) return null;
        }

        if (filters.reportFPR) {
          const hasFPR = filters.reportFPR === "Yes" ? !!row.reports?.fpr : !row.reports?.fpr;
          if (!hasFPR) return null;
        }
        if (filters.reportFPRDateFrom && (!row.reports?.fpr || new Date(row.reports.fpr) < new Date(filters.reportFPRDateFrom))) return null;
        if (filters.reportFPRDateTo && (!row.reports?.fpr || new Date(row.reports.fpr) > new Date(filters.reportFPRDateTo))) return null;
        // FPR issued more than X months ago
        if (filters.reportFPRIssuedMonthsAgo) {
          if (!row.reports?.fpr || !checkTimeAgo(row.reports.fpr, filters.reportFPRIssuedMonthsAgo)) return null;
        }
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
        // Final Order issued more than X months ago
        if (filters.reportFinalOrderIssuedMonthsAgo) {
          if (!row.reports?.finalOrder || !checkTimeAgo(row.reports.finalOrder, filters.reportFinalOrderIssuedMonthsAgo)) return null;
        }

        if (filters.reportFinalChargesheet) {
          const hasFinal = filters.reportFinalChargesheet === "Yes" ? !!row.reports?.finalChargesheet : !row.reports?.finalChargesheet;
          if (!hasFinal) return null;
        }
        if (filters.reportFinalChargesheetDateFrom && (!row.reports?.finalChargesheet || new Date(row.reports.finalChargesheet) < new Date(filters.reportFinalChargesheetDateFrom))) return null;
        if (filters.reportFinalChargesheetDateTo && (!row.reports?.finalChargesheet || new Date(row.reports.finalChargesheet) > new Date(filters.reportFinalChargesheetDateTo))) return null;
        // Final Chargesheet issued more than X months ago
        if (filters.reportFinalChargesheetIssuedMonthsAgo) {
          if (!row.reports?.finalChargesheet || !checkTimeAgo(row.reports.finalChargesheet, filters.reportFinalChargesheetIssuedMonthsAgo)) return null;
        }

        // Final charge sheet submission in court
        if (filters.finalChargesheetSubmitted) {
          const submitted = filters.finalChargesheetSubmitted === "Yes";
          if (row.finalChargesheetSubmitted !== submitted) return null;
        }
        if (filters.finalChargesheetSubmissionDateFrom && (!row.finalChargesheetSubmissionDate || new Date(row.finalChargesheetSubmissionDate) < new Date(filters.finalChargesheetSubmissionDateFrom))) return null;
        if (filters.finalChargesheetSubmissionDateTo && (!row.finalChargesheetSubmissionDate || new Date(row.finalChargesheetSubmissionDate) > new Date(filters.finalChargesheetSubmissionDateTo))) return null;

        // Diary filters
        if (filters.diaryNo || filters.diaryDateFrom || filters.diaryDateTo) {
          const diaryEntries = row.diary || [];
          const hasMatchingDiary = diaryEntries.some(entry => {
            let match = true;
            if (filters.diaryNo && !entry.diaryNo?.toLowerCase().includes(filters.diaryNo.toLowerCase())) match = false;

            if (filters.diaryDateFrom || filters.diaryDateTo) {
              if (!entry.diaryDate) {
                match = false;
              } else {
                const dDate = new Date(entry.diaryDate);
                if (filters.diaryDateFrom && dDate < new Date(filters.diaryDateFrom)) match = false;
                if (filters.diaryDateTo && dDate > new Date(filters.diaryDateTo)) match = false;
              }
            }
            return match;
          });
          if (!hasMatchingDiary) return null;
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
      decisionPendingStatus: "",
      caseDecisionStatus: "",
      investigationStatus: [],
      priority: [],
      isPropertyProfessionalCrime: false,
      reasonForPendency: [],
      accusedName: "",
      accusedStatus: "",
      accusedAddress: "",
      accusedMobileNumber: "",
      accusedAadhaarNumber: "",
      accusedState: "",
      accusedDistrict: "",
      accusedCountMin: "",
      accusedCountMax: "",
      arrestedCountMin: "",
      arrestedCountMax: "",
      unarrestedCountMin: "",
      unarrestedCountMax: "",
      notice41AIssued: false,
      notice41ADateFrom: "",
      notice41ADateTo: "",
      warrantPrayed: "",
      warrantPrayerDateFrom: "",
      warrantPrayerDateTo: "",
      warrantReceiptDateFrom: "",
      warrantReceiptDateTo: "",
      warrantExecutionDateFrom: "",
      warrantExecutionDateTo: "",
      warrantReturnDateFrom: "",
      warrantReturnDateTo: "",
      warrantReceivedButNotExecuted: false,
      warrantIssuedMonthsAgo: "",
      proclamationPrayed: "",
      proclamationPrayerDateFrom: "",
      proclamationPrayerDateTo: "",
      proclamationReceiptDateFrom: "",
      proclamationReceiptDateTo: "",
      proclamationExecutionDateFrom: "",
      proclamationExecutionDateTo: "",
      proclamationReturnDateFrom: "",
      proclamationReturnDateTo: "",
      proclamationReceivedButNotExecuted: false,
      proclamationIssuedMonthsAgo: "",
      attachmentPrayed: "",
      attachmentPrayerDateFrom: "",
      attachmentPrayerDateTo: "",
      attachmentReceiptDateFrom: "",
      attachmentReceiptDateTo: "",
      attachmentExecutionDateFrom: "",
      attachmentExecutionDateTo: "",
      attachmentReturnDateFrom: "",
      attachmentReturnDateTo: "",
      attachmentReceivedButNotExecuted: false,
      attachmentIssuedMonthsAgo: "",
      caseDateFrom: "",
      caseDateTo: "",
      arrestDateFrom: "",
      arrestDateTo: "",
      reportR1: "",
      reportR1DateFrom: "",
      reportR1DateTo: "",
      reportR1IssuedMonthsAgo: "",
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
      reportR3IssuedMonthsAgo: "",
      reportPR1: "",
      reportPR1DateFrom: "",
      reportPR1DateTo: "",
      reportPR1IssuedMonthsAgo: "",
      reportPR2: "",
      reportPR2DateFrom: "",
      reportPR2DateTo: "",
      reportPR2IssuedMonthsAgo: "",
      reportPR3: "",
      reportPR3DateFrom: "",
      reportPR3DateTo: "",
      reportPR3IssuedMonthsAgo: "",
      reportFPR: "",
      reportFPRDateFrom: "",
      reportFPRDateTo: "",
      reportFPRIssuedMonthsAgo: "",
      reportFPRWithoutChargesheet: false,
      reportFinalOrder: "",
      reportFinalOrderDateFrom: "",
      reportFinalOrderDateTo: "",
      reportFinalOrderIssuedMonthsAgo: "",
      reportFinalChargesheet: "",
      reportFinalChargesheetDateFrom: "",
      reportFinalChargesheetDateTo: "",
      reportFinalChargesheetIssuedMonthsAgo: "",
      finalChargesheetSubmitted: "",
      finalChargesheetSubmissionDateFrom: "",
      finalChargesheetSubmissionDateTo: "",
      // Diary filters
      diaryNo: "",
      diaryDateFrom: "",
      diaryDateTo: "",
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

  function decisionPendingBadgeColor(status: DecisionPendingStatus) {
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
  }

  // Reusable Time Ago Filter Component
  const TimeAgoFilter = ({
    value,
    onChange,
    label = "Issued More Than"
  }: {
    value: string,
    onChange: (val: string) => void,
    label?: string
  }) => {
    const isCustom = value && !["15", "30", "60", "90", "180", "270", "365"].includes(value);

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <div className="flex gap-2">
          <select
            value={isCustom ? "custom" : value}
            onChange={(e) => {
              if (e.target.value === "custom") {
                onChange(""); // Clear value to show input
              } else {
                onChange(e.target.value);
              }
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
          >
            <option value="">Any time</option>
            <option value="15">15 Days</option>
            <option value="30">1 Month</option>
            <option value="60">2 Months</option>
            <option value="90">3 Months</option>
            <option value="180">6 Months</option>
            <option value="270">9 Months</option>
            <option value="365">1 Year</option>
            <option value="custom">Custom Days</option>
          </select>
          {(isCustom || value === "custom") && (
            <input
              type="number"
              min="1"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Days"
              className="w-24 px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center">
                  <Image src="/logo.png" alt="Jharkhand" width={40} height={40} className="h-10 w-auto" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 hidden md:block">Case Search System</h1>
              </div>
              <div className="flex items-center gap-4">
                {user?.role === "SuperAdmin" && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm text-slate-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin"
                      className="text-sm text-slate-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      Admin
                    </Link>
                  </>
                )}

                {user?.role === "SuperAdmin" && (
                  <Link
                    href="/add"
                    className="text-sm text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="hidden sm:inline">Add Case</span>
                  </Link>
                )}

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-slate-900">{user?.email || "Loading..."}</div>
                    <div className="text-xs text-slate-500">{user?.role || ""}</div>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      window.location.href = "/login";
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                    title="Logout"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
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

            <div className="px-4 py-4 md:px-6 md:py-6 space-y-6">
              {/* Case Identification */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                  </svg>
                  Case Identification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Number</label>
                    <input value={filters.caseNo} onChange={(e) => setFilters({ ...filters, caseNo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" placeholder="e.g., 77/2024" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Police Station</label>
                    <input list="ps-list" value={filters.policeStation} onChange={(e) => setFilters({ ...filters, policeStation: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" placeholder="Search station" />
                    <datalist id="ps-list">
                      {POLICE_STATIONS.map((ps) => (
                        <option key={ps} value={ps} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Crime Head</label>
                    <select
                      value={filters.crimeHead}
                      onChange={(e) => setFilters({ ...filters, crimeHead: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    >
                      <option value="">All Crime Heads</option>
                      {crimeHeads.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Section</label>
                    <input value={filters.section} onChange={(e) => setFilters({ ...filters, section: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" placeholder="e.g., 420 IPC" />
                  </div>
                </div>
              </div>

              {/* Year Filters */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Year Filter
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Exact Year</label>
                    <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                      <option value="">All Years</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Year Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">From</label>
                        <select value={filters.yearFrom} onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm">
                          <option value="">Any</option>
                          {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">To</label>
                        <select value={filters.yearTo} onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm">
                          <option value="">Any</option>
                          {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Year Comparison</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Before</label>
                        <select value={filters.yearBefore} onChange={(e) => setFilters({ ...filters, yearBefore: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm">
                          <option value="">Any</option>
                          {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">After</label>
                        <select value={filters.yearAfter} onChange={(e) => setFilters({ ...filters, yearAfter: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm">
                          <option value="">Any</option>
                          {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Details */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Case Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Punishment Range</label>
                    <div className="flex gap-4 pt-2">
                      <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.punishment.includes("\u22647")}
                          onChange={(e) => {
                            const set = new Set(filters.punishment);
                            if (e.target.checked) set.add("\u22647"); else set.delete("\u22647");
                            setFilters({ ...filters, punishment: Array.from(set) as Array<"\u22647" | ">7"> });
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        ≤7 Years
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.punishment.includes(">7")}
                          onChange={(e) => {
                            const set = new Set(filters.punishment);
                            if (e.target.checked) set.add(">7"); else set.delete(">7");
                            setFilters({ ...filters, punishment: Array.from(set) as Array<"\u22647" | ">7"> });
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        {">7 Years"}
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Status</label>
                    <div className="flex flex-col gap-2 pt-2">
                      {(["Disposed", "Under investigation"] as CaseStatus[]).map((status) => (
                        <label key={status} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.caseStatus.includes(status)}
                            onChange={(e) => {
                              const set = new Set(filters.caseStatus);
                              if (e.target.checked) set.add(status); else set.delete(status);
                              setFilters({ ...filters, caseStatus: Array.from(set) });
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Decision Status (Accused)</label>
                    <select
                      value={filters.decisionPendingStatus}
                      onChange={(e) =>
                        setFilters({ ...filters, decisionPendingStatus: e.target.value as "" | DecisionPendingStatus })
                      }
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All statuses</option>
                      {DECISION_PENDING_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Decision Status</label>
                    <select
                      value={filters.caseDecisionStatus}
                      onChange={(e) =>
                        setFilters({ ...filters, caseDecisionStatus: e.target.value as "" | "True" | "False" | "Partial Pendency" | "Complete Pendency" })
                      }
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All statuses</option>
                      <option value="True">True</option>
                      <option value="False">False</option>
                      <option value="Partial Pendency">Partial Pendency</option>
                      <option value="Complete Pendency">Complete Pendency</option>
                    </select>
                  </div>
                  {filters.caseStatus.includes("Under investigation") && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Investigation Status</label>
                      <div className="flex flex-col gap-2 pt-2">
                        {(["Detected", "Undetected"] as InvestigationStatus[]).map((status) => (
                          <label key={status} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.investigationStatus.includes(status)}
                              onChange={(e) => {
                                const set = new Set(filters.investigationStatus);
                                if (e.target.checked) set.add(status); else set.delete(status);
                                setFilters({ ...filters, investigationStatus: Array.from(set) });
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            {status}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                    <div className="flex flex-col gap-2 pt-2">
                      {(["Under monitoring", "Normal"] as Priority[]).map((priority) => (
                        <label key={priority} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.priority.includes(priority)}
                            onChange={(e) => {
                              const set = new Set(filters.priority);
                              if (e.target.checked) set.add(priority); else set.delete(priority);
                              setFilters({ ...filters, priority: Array.from(set) });
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          {priority}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Property/Professional Crime</label>
                    <label className="inline-flex items-center gap-2 text-sm pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.isPropertyProfessionalCrime}
                        onChange={(e) => setFilters({ ...filters, isPropertyProfessionalCrime: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Identify property/professional crimes
                    </label>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-slate-700">Reason for Pendency</label>
                      <button
                        type="button"
                        onClick={() => setShowAddReasonModal(true)}
                        className="text-xs text-blue-700 hover:text-blue-800 font-medium hover:underline"
                        title="Add new reason (Admin)"
                      >
                        + Add
                      </button>
                    </div>
                    {reasonForPendencyOptions.length === 0 ? (
                      <p className="text-sm text-slate-500 py-2">Loading options...</p>
                    ) : (
                      <>
                        <select
                          multiple
                          value={filters.reasonForPendency}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setFilters({ ...filters, reasonForPendency: selected });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          size={4}
                        >
                          {reasonForPendencyOptions.map((reason) => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1.5">Hold Ctrl/Cmd to select multiple</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Accused Filters */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('accused')}
                  className="w-full p-5 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Accused Information
                  </h3>
                  <svg
                    className={`h-5 w-5 text-slate-600 transition-transform ${expandedSections.accused ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSections.accused && (
                  <div className="px-5 pb-5 space-y-6">
                    {/* Basic Accused Information */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">Basic Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Accused Name</label>
                          <input value={filters.accusedName} onChange={(e) => setFilters({ ...filters, accusedName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" placeholder="Enter name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Accused Status</label>
                          <select value={filters.accusedStatus} onChange={(e) => setFilters({ ...filters, accusedStatus: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                            <option value="">All Status</option>
                            <option>Arrested</option>
                            <option>Not arrested</option>
                            <option>Decision pending</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                          <input value={filters.accusedAddress} onChange={(e) => setFilters({ ...filters, accusedAddress: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" placeholder="Enter address" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                          <input value={filters.accusedMobileNumber} onChange={(e) => setFilters({ ...filters, accusedMobileNumber: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" placeholder="Enter mobile number" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Aadhaar Number</label>
                          <input value={filters.accusedAadhaarNumber} onChange={(e) => setFilters({ ...filters, accusedAadhaarNumber: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" placeholder="Enter Aadhaar number" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                          <select value={filters.accusedState} onChange={(e) => setFilters({ ...filters, accusedState: e.target.value, accusedDistrict: "" })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                            <option value="">All States</option>
                            {INDIAN_STATES.map((state) => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">District</label>
                          <select value={filters.accusedDistrict} onChange={(e) => setFilters({ ...filters, accusedDistrict: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" disabled={!filters.accusedState}>
                            <option value="">All Districts</option>
                            {filters.accusedState && DISTRICTS_BY_STATE[filters.accusedState]?.map((district) => (
                              <option key={district} value={district}>{district}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Accused Counts */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">Accused Counts</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Accused Count</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-slate-500 mb-1.5">Min</label>
                              <input type="number" min="0" value={filters.accusedCountMin} onChange={(e) => setFilters({ ...filters, accusedCountMin: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" placeholder="Min" />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1.5">Max</label>
                              <input type="number" min="0" value={filters.accusedCountMax} onChange={(e) => setFilters({ ...filters, accusedCountMax: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" placeholder="Max" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Arrested Count</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-slate-500 mb-1.5">Min</label>
                              <input type="number" min="0" value={filters.arrestedCountMin} onChange={(e) => setFilters({ ...filters, arrestedCountMin: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" placeholder="Min" />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1.5">Max</label>
                              <input type="number" min="0" value={filters.arrestedCountMax} onChange={(e) => setFilters({ ...filters, arrestedCountMax: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" placeholder="Max" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Unarrested Count</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-slate-500 mb-1.5">Min</label>
                              <input type="number" min="0" value={filters.unarrestedCountMin} onChange={(e) => setFilters({ ...filters, unarrestedCountMin: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" placeholder="Min" />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1.5">Max</label>
                              <input type="number" min="0" value={filters.unarrestedCountMax} onChange={(e) => setFilters({ ...filters, unarrestedCountMax: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" placeholder="Max" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notice 41A */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">Notice 41A</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.notice41AIssued}
                              onChange={(e) => setFilters({ ...filters, notice41AIssued: e.target.checked })}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            Notice 41A Issued
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notice Date From</label>
                          <input type="date" value={filters.notice41ADateFrom} onChange={(e) => setFilters({ ...filters, notice41ADateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notice Date To</label>
                          <input type="date" value={filters.notice41ADateTo} onChange={(e) => setFilters({ ...filters, notice41ADateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                        </div>
                      </div>
                    </div>

                    {/* Warrant */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">Warrant</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Warrant Prayed</label>
                            <select value={filters.warrantPrayed} onChange={(e) => setFilters({ ...filters, warrantPrayed: e.target.value as "" | "Yes" | "No" })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.warrantReceivedButNotExecuted}
                                onChange={(e) => setFilters({ ...filters, warrantReceivedButNotExecuted: e.target.checked })}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              Warrant Received but Not Executed
                            </label>
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.warrantIssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, warrantIssuedMonthsAgo: val })}
                              label="Warrant Issued More Than"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Prayer Date From</label>
                            <input type="date" value={filters.warrantPrayerDateFrom} onChange={(e) => setFilters({ ...filters, warrantPrayerDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Prayer Date To</label>
                            <input type="date" value={filters.warrantPrayerDateTo} onChange={(e) => setFilters({ ...filters, warrantPrayerDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Receipt Date From</label>
                            <input type="date" value={filters.warrantReceiptDateFrom} onChange={(e) => setFilters({ ...filters, warrantReceiptDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Receipt Date To</label>
                            <input type="date" value={filters.warrantReceiptDateTo} onChange={(e) => setFilters({ ...filters, warrantReceiptDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Execution Date From</label>
                            <input type="date" value={filters.warrantExecutionDateFrom} onChange={(e) => setFilters({ ...filters, warrantExecutionDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Execution Date To</label>
                            <input type="date" value={filters.warrantExecutionDateTo} onChange={(e) => setFilters({ ...filters, warrantExecutionDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proclamation */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">Proclamation</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Proclamation Prayed</label>
                            <select value={filters.proclamationPrayed} onChange={(e) => setFilters({ ...filters, proclamationPrayed: e.target.value as "" | "Yes" | "No" })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.proclamationReceivedButNotExecuted}
                                onChange={(e) => setFilters({ ...filters, proclamationReceivedButNotExecuted: e.target.checked })}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              Proclamation Received but Not Executed
                            </label>
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.proclamationIssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, proclamationIssuedMonthsAgo: val })}
                              label="Proclamation Issued More Than"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Prayer Date From</label>
                            <input type="date" value={filters.proclamationPrayerDateFrom} onChange={(e) => setFilters({ ...filters, proclamationPrayerDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Prayer Date To</label>
                            <input type="date" value={filters.proclamationPrayerDateTo} onChange={(e) => setFilters({ ...filters, proclamationPrayerDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Receipt Date From</label>
                            <input type="date" value={filters.proclamationReceiptDateFrom} onChange={(e) => setFilters({ ...filters, proclamationReceiptDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Receipt Date To</label>
                            <input type="date" value={filters.proclamationReceiptDateTo} onChange={(e) => setFilters({ ...filters, proclamationReceiptDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Execution Date From</label>
                            <input type="date" value={filters.proclamationExecutionDateFrom} onChange={(e) => setFilters({ ...filters, proclamationExecutionDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Execution Date To</label>
                            <input type="date" value={filters.proclamationExecutionDateTo} onChange={(e) => setFilters({ ...filters, proclamationExecutionDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attachment */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">Attachment</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Attachment Prayed</label>
                            <select value={filters.attachmentPrayed} onChange={(e) => setFilters({ ...filters, attachmentPrayed: e.target.value as "" | "Yes" | "No" })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.attachmentReceivedButNotExecuted}
                                onChange={(e) => setFilters({ ...filters, attachmentReceivedButNotExecuted: e.target.checked })}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              Attachment Received but Not Executed
                            </label>
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.attachmentIssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, attachmentIssuedMonthsAgo: val })}
                              label="Attachment Issued More Than"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Prayer Date From</label>
                            <input type="date" value={filters.attachmentPrayerDateFrom} onChange={(e) => setFilters({ ...filters, attachmentPrayerDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Prayer Date To</label>
                            <input type="date" value={filters.attachmentPrayerDateTo} onChange={(e) => setFilters({ ...filters, attachmentPrayerDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Receipt Date From</label>
                            <input type="date" value={filters.attachmentReceiptDateFrom} onChange={(e) => setFilters({ ...filters, attachmentReceiptDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Receipt Date To</label>
                            <input type="date" value={filters.attachmentReceiptDateTo} onChange={(e) => setFilters({ ...filters, attachmentReceiptDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Execution Date From</label>
                            <input type="date" value={filters.attachmentExecutionDateFrom} onChange={(e) => setFilters({ ...filters, attachmentExecutionDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Execution Date To</label>
                            <input type="date" value={filters.attachmentExecutionDateTo} onChange={(e) => setFilters({ ...filters, attachmentExecutionDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between py-2">
                <div className="flex-1 border-t border-slate-200"></div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="mx-4 px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
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
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="space-y-6">
                  {/* Date Filters */}
                  {/* Case Diary Section */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection('diary')}
                      className="w-full p-5 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        Case Diary
                      </h3>
                      <svg
                        className={`h-5 w-5 text-slate-600 transition-transform ${expandedSections.diary ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {expandedSections.diary && (
                      <div className="px-5 pb-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Diary Number</label>
                            <input
                              type="text"
                              value={filters.diaryNo}
                              onChange={(e) => setFilters({ ...filters, diaryNo: e.target.value })}
                              placeholder="Enter diary number"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Diary Date From</label>
                            <input
                              type="date"
                              value={filters.diaryDateFrom}
                              onChange={(e) => setFilters({ ...filters, diaryDateFrom: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Diary Date To</label>
                            <input
                              type="date"
                              value={filters.diaryDateTo}
                              onChange={(e) => setFilters({ ...filters, diaryDateTo: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date Filters */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection('dates')}
                      className="w-full p-5 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Date Filters
                      </h3>
                      <svg
                        className={`h-5 w-5 text-slate-600 transition-transform ${expandedSections.dates ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {expandedSections.dates && (
                      <div className="px-5 pb-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Date From</label>
                            <input type="date" value={filters.caseDateFrom} onChange={(e) => setFilters({ ...filters, caseDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Date To</label>
                            <input type="date" value={filters.caseDateTo} onChange={(e) => setFilters({ ...filters, caseDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Arrest Date From</label>
                            <input type="date" value={filters.arrestDateFrom} onChange={(e) => setFilters({ ...filters, arrestDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Arrest Date To</label>
                            <input type="date" value={filters.arrestDateTo} onChange={(e) => setFilters({ ...filters, arrestDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Report Filters */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection('reports')}
                      className="w-full p-5 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Report Filters
                      </h3>
                      <svg
                        className={`h-5 w-5 text-slate-600 transition-transform ${expandedSections.reports ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {expandedSections.reports && (
                      <div className="px-5 pb-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {/* R1 Report */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">R1 Report</label>
                            <select value={filters.reportR1} onChange={(e) => setFilters({ ...filters, reportR1: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">R1 Date From</label>
                            <input type="date" value={filters.reportR1DateFrom} onChange={(e) => setFilters({ ...filters, reportR1DateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">R1 Date To</label>
                            <input type="date" value={filters.reportR1DateTo} onChange={(e) => setFilters({ ...filters, reportR1DateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.reportR1IssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, reportR1IssuedMonthsAgo: val })}
                              label="R1 Issued More Than"
                            />
                          </div>

                          {/* Supervision Report */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Supervision Report</label>
                            <select value={filters.reportSupervision} onChange={(e) => setFilters({ ...filters, reportSupervision: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Supervision Date From</label>
                            <input type="date" value={filters.reportSupervisionDateFrom} onChange={(e) => setFilters({ ...filters, reportSupervisionDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Supervision Date To</label>
                            <input type="date" value={filters.reportSupervisionDateTo} onChange={(e) => setFilters({ ...filters, reportSupervisionDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>

                          {/* R2 Report */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">R2 Report</label>
                            <select value={filters.reportR2} onChange={(e) => setFilters({ ...filters, reportR2: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">R2 Date From</label>
                            <input type="date" value={filters.reportR2DateFrom} onChange={(e) => setFilters({ ...filters, reportR2DateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">R2 Date To</label>
                            <input type="date" value={filters.reportR2DateTo} onChange={(e) => setFilters({ ...filters, reportR2DateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.reportR2IssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, reportR2IssuedMonthsAgo: val })}
                              label="R2 Issued More Than"
                            />
                          </div>

                          {/* R3 Report */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">R3 Report</label>
                            <select value={filters.reportR3} onChange={(e) => setFilters({ ...filters, reportR3: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">R3 Date From</label>
                            <input type="date" value={filters.reportR3DateFrom} onChange={(e) => setFilters({ ...filters, reportR3DateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">R3 Date To</label>
                            <input type="date" value={filters.reportR3DateTo} onChange={(e) => setFilters({ ...filters, reportR3DateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.reportR3IssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, reportR3IssuedMonthsAgo: val })}
                              label="R3 Issued More Than"
                            />
                          </div>

                          {/* PR1 Report (issued by DSP) */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PR1 Report (DSP)</label>
                            <select value={filters.reportPR1} onChange={(e) => setFilters({ ...filters, reportPR1: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PR1 Date From</label>
                            <input type="date" value={filters.reportPR1DateFrom} onChange={(e) => setFilters({ ...filters, reportPR1DateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PR1 Date To</label>
                            <input type="date" value={filters.reportPR1DateTo} onChange={(e) => setFilters({ ...filters, reportPR1DateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.reportPR1IssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, reportPR1IssuedMonthsAgo: val })}
                              label="PR1 Issued More Than"
                            />
                          </div>

                          {/* PR2 Report (issued by DSP) */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PR2 Report (DSP)</label>
                            <select value={filters.reportPR2} onChange={(e) => setFilters({ ...filters, reportPR2: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PR2 Date From</label>
                            <input type="date" value={filters.reportPR2DateFrom} onChange={(e) => setFilters({ ...filters, reportPR2DateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PR2 Date To</label>
                            <input type="date" value={filters.reportPR2DateTo} onChange={(e) => setFilters({ ...filters, reportPR2DateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.reportPR2IssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, reportPR2IssuedMonthsAgo: val })}
                              label="PR2 Issued More Than"
                            />
                          </div>

                          {/* PR3 Report (issued by DSP) */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PR3 Report (DSP)</label>
                            <select value={filters.reportPR3} onChange={(e) => setFilters({ ...filters, reportPR3: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PR3 Date From</label>
                            <input type="date" value={filters.reportPR3DateFrom} onChange={(e) => setFilters({ ...filters, reportPR3DateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PR3 Date To</label>
                            <input type="date" value={filters.reportPR3DateTo} onChange={(e) => setFilters({ ...filters, reportPR3DateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.reportPR3IssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, reportPR3IssuedMonthsAgo: val })}
                              label="PR3 Issued More Than"
                            />
                          </div>

                          {/* FPR Report */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">FPR Report</label>
                            <select value={filters.reportFPR} onChange={(e) => setFilters({ ...filters, reportFPR: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">FPR Date From</label>
                            <input type="date" value={filters.reportFPRDateFrom} onChange={(e) => setFilters({ ...filters, reportFPRDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">FPR Date To</label>
                            <input type="date" value={filters.reportFPRDateTo} onChange={(e) => setFilters({ ...filters, reportFPRDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.reportFPRIssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, reportFPRIssuedMonthsAgo: val })}
                              label="FPR Issued More Than"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">FPR Without Charge Sheet</label>
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
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Final Order</label>
                            <select value={filters.reportFinalOrder} onChange={(e) => setFilters({ ...filters, reportFinalOrder: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Final Order Date From</label>
                            <input type="date" value={filters.reportFinalOrderDateFrom} onChange={(e) => setFilters({ ...filters, reportFinalOrderDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Final Order Date To</label>
                            <input type="date" value={filters.reportFinalOrderDateTo} onChange={(e) => setFilters({ ...filters, reportFinalOrderDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.reportFinalOrderIssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, reportFinalOrderIssuedMonthsAgo: val })}
                              label="Final Order Issued More Than"
                            />
                          </div>

                          {/* Final Chargesheet */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Final Chargesheet</label>
                            <select value={filters.reportFinalChargesheet} onChange={(e) => setFilters({ ...filters, reportFinalChargesheet: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Final Chargesheet Date From</label>
                            <input type="date" value={filters.reportFinalChargesheetDateFrom} onChange={(e) => setFilters({ ...filters, reportFinalChargesheetDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Final Chargesheet Date To</label>
                            <input type="date" value={filters.reportFinalChargesheetDateTo} onChange={(e) => setFilters({ ...filters, reportFinalChargesheetDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <TimeAgoFilter
                              value={filters.reportFinalChargesheetIssuedMonthsAgo}
                              onChange={(val) => setFilters({ ...filters, reportFinalChargesheetIssuedMonthsAgo: val })}
                              label="Final Chargesheet Issued More Than"
                            />
                          </div>

                          {/* Chargesheet submitted in Court */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Chargesheet submitted in Court</label>
                            <select value={filters.finalChargesheetSubmitted} onChange={(e) => setFilters({ ...filters, finalChargesheetSubmitted: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
                              <option value="">All</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Submission Date From</label>
                            <input type="date" value={filters.finalChargesheetSubmissionDateFrom} onChange={(e) => setFilters({ ...filters, finalChargesheetSubmissionDateFrom: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Submission Date To</label>
                            <input type="date" value={filters.finalChargesheetSubmissionDateTo} onChange={(e) => setFilters({ ...filters, finalChargesheetSubmissionDateTo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  <button onClick={() => {/* no-op demo search */ }} className="inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
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
            {dataLoading ? (
              <div className="p-8 text-center">
                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-slate-600">Loading cases...</p>
              </div>
            ) : (
              <>
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
                        <th className="px-4 py-3 text-left font-medium">Case Status / Accused Status</th>
                        <th className="px-4 py-3 text-left font-medium">Case Decision Status</th>
                        <th className="px-4 py-3 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filtered.slice((currentPage - 1) * filters.pageSize, currentPage * filters.pageSize).map((row) => {
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
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusBadgeColor(row.caseStatus)}`}>
                                    {row.caseStatus}
                                  </span>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${decisionPendingBadgeColor(row.decisionPendingStatus)}`}
                                  >
                                    {row.decisionPendingStatus}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {row.caseDecisionStatus ? (
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${row.caseDecisionStatus === "True" ? "bg-green-100 text-green-800 ring-green-600/20" :
                                    row.caseDecisionStatus === "False" ? "bg-red-100 text-red-800 ring-red-600/20" :
                                      row.caseDecisionStatus === "Partial Pendency" ? "bg-yellow-100 text-yellow-800 ring-yellow-600/20" :
                                        row.caseDecisionStatus === "Complete Pendency" ? "bg-orange-100 text-orange-800 ring-orange-600/20" :
                                          "bg-slate-100 text-slate-800 ring-slate-600/20"
                                    }`}>
                                    {row.caseDecisionStatus}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
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
                  <div className="text-slate-600">
                    Showing <span className="font-medium">{Math.min((currentPage - 1) * filters.pageSize + 1, filtered.length)}</span> to <span className="font-medium">{Math.min(currentPage * filters.pageSize, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>

                    {Array.from({ length: Math.min(5, Math.ceil(filtered.length / filters.pageSize)) }, (_, i) => {
                      // Logic to show a window of pages around current page
                      const totalPages = Math.ceil(filtered.length / filters.pageSize);
                      let startPage = Math.max(1, currentPage - 2);
                      const endPage = Math.min(totalPages, startPage + 4);

                      if (endPage - startPage < 4) {
                        startPage = Math.max(1, endPage - 4);
                      }

                      const pageNum = startPage + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1.5 border rounded-md ${currentPage === pageNum
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(filtered.length / filters.pageSize), p + 1))}
                      disabled={currentPage >= Math.ceil(filtered.length / filters.pageSize)}
                      className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Add Reason Modal */}
        {showAddReasonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Add New Reason for Pendency</h3>
                  <button
                    onClick={() => {
                      setShowAddReasonModal(false);
                      setNewReasonInput("");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reason Name</label>
                  <input
                    type="text"
                    value={newReasonInput}
                    onChange={(e) => setNewReasonInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="Enter reason for pendency"
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && newReasonInput.trim() && !reasonForPendencyOptions.includes(newReasonInput.trim())) {
                        try {
                          const response = await fetch('/api/reason-for-pendency', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reason: newReasonInput.trim(), createdBy: 'Admin' }),
                          });
                          const data = await response.json();
                          if (data.success) {
                            setReasonForPendencyOptions([...reasonForPendencyOptions, newReasonInput.trim()]);
                            setNewReasonInput("");
                            setShowAddReasonModal(false);
                          } else {
                            alert(data.error || 'Failed to add reason');
                          }
                        } catch (error: any) {
                          alert(error.message || 'An error occurred');
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowAddReasonModal(false);
                      setNewReasonInput("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (newReasonInput.trim() && !reasonForPendencyOptions.includes(newReasonInput.trim())) {
                        try {
                          const response = await fetch('/api/reason-for-pendency', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reason: newReasonInput.trim(), createdBy: 'Admin' }),
                          });
                          const data = await response.json();
                          if (data.success) {
                            setReasonForPendencyOptions([...reasonForPendencyOptions, newReasonInput.trim()]);
                            setNewReasonInput("");
                            setShowAddReasonModal(false);
                          } else {
                            alert(data.error || 'Failed to add reason');
                          }
                        } catch (error: any) {
                          alert(error.message || 'An error occurred');
                        }
                      }
                    }}
                    disabled={!newReasonInput.trim() || reasonForPendencyOptions.includes(newReasonInput.trim())}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-900 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    Add Reason
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
