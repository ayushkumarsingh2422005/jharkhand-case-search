"use client";
import { SuperAdminGuard } from "../../components/AuthGuard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CaseStatus = "Disposed" | "Under investigation";
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

const INJURY_TYPES = [
  "Minor",
  "Moderate",
  "Serious",
  "Grievous",
  "Fatal",
  "Other",
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

export default function AddCase() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [crimeHeads, setCrimeHeads] = useState<string[]>([]);
  const [reasonForPendencyOptions, setReasonForPendencyOptions] = useState<string[]>([]);

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
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

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
    publicPetitionFile: null as { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null,
    reasonForPendency: [] as string[],
    diary: [] as Array<{ diaryNo: string; diaryDate: string }>,
    reports: {
      spReports: [] as Array<{
        label: string;
        date: string;
        file: { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null;
      }>,
      dspReports: [] as Array<{
        label: string;
        date: string;
        file: { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null;
      }>,
      supervision: "",
      fpr: "",
      finalOrder: "",
      finalChargesheet: "",
      file: null as { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null,
    },
    chargeSheet: {
      submitted: false,
      submissionDate: "",
      file: null as { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null,
    },
    finalChargesheetSubmitted: false,
    finalChargesheetSubmissionDate: "",
    chargesheetDeadlineType: "60" as "60" | "90",
    prosecutionSanction: [] as Array<{
      type: string;
      submissionDate: string;
      receiptDate: string;
      file: { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null;
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
      file: { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null;
    }>,
    injuryReport: {
      report: false,
      injuryType: "",
      injuryDate: "",
      reportReceived: false,
      reportDate: "",
      file: null as { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null,
    },
    pmReport: {
      report: "" as "Yes" | "No" | "N/A" | "",
      pmDate: "",
      reportReceived: false,
      reportDate: "",
      file: null as { public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number } | null,
    },
    compensationProposal: {
      required: false,
      submitted: false,
      submissionDate: "",
    },
    accused: [] as Array<{
      name: string;
      status: AccusedStatus;
      address: string;
      mobileNumber: string;
      aadhaarNumber: string;
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
      accused: [
        ...prev.accused,
        {
          name: "",
          status: "Decision pending" as AccusedStatus,
          address: "",
          mobileNumber: "",
          aadhaarNumber: "",
          state: "",
          district: "",
        },
      ],
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

  const addSPReport = () => {
    setFormData(prev => ({
      ...prev,
      reports: {
        ...(prev.reports || {}),
        spReports: [
          ...(prev.reports?.spReports || []),
          {
            label: "",
            date: "",
            file: null,
          },
        ],
      },
    }));
  };

  const updateSPReport = (
    index: number,
    field: "label" | "date",
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      reports: {
        ...(prev.reports || {}),
        spReports: (prev.reports?.spReports || []).map((report, i) =>
          i === index ? { ...report, [field]: value } : report
        ),
      },
    }));
  };

  const removeSPReport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reports: {
        ...(prev.reports || {}),
        spReports: (prev.reports?.spReports || []).filter((_, i) => i !== index),
      },
    }));
  };

  const addDSPReport = () => {
    setFormData(prev => ({
      ...prev,
      reports: {
        ...(prev.reports || {}),
        dspReports: [
          ...(prev.reports?.dspReports || []),
          {
            label: "",
            date: "",
            file: null,
          },
        ],
      },
    }));
  };

  const updateDSPReport = (
    index: number,
    field: "label" | "date",
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      reports: {
        ...(prev.reports || {}),
        dspReports: (prev.reports?.dspReports || []).map((report, i) =>
          i === index ? { ...report, [field]: value } : report
        ),
      },
    }));
  };

  const removeDSPReport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reports: {
        ...(prev.reports || {}),
        dspReports: (prev.reports?.dspReports || []).filter((_, i) => i !== index),
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
      prosecutionSanction: [...prev.prosecutionSanction, { type: "", submissionDate: "", receiptDate: "", file: null }],
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
        file: null,
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

  // File upload handler
  const handleFileUpload = async (file: File, folder: string): Promise<{ public_id: string; secure_url: string; url: string; original_filename: string; format: string; bytes: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    const result = await response.json();
    return result.data;
  };

  // File upload handlers for each section
  const uploadReportsFile = async (file: File, inputElement?: HTMLInputElement) => {
    try {
      const fileData = await handleFileUpload(file, 'case-reports/all-reports');
      setFormData(prev => ({
        ...prev,
        reports: {
          ...prev.reports,
          file: fileData,
        },
      }));
      if (inputElement) inputElement.value = '';
    } catch (error: any) {
      setError(`Failed to upload reports file: ${error.message}`);
      if (inputElement) inputElement.value = '';
    }
  };

  const uploadSPReportFile = async (file: File, index: number, inputElement?: HTMLInputElement) => {
    try {
      const fileData = await handleFileUpload(file, 'case-reports/sp-reports');
      setFormData(prev => ({
        ...prev,
        reports: {
          ...prev.reports,
          spReports: prev.reports.spReports.map((report, i) =>
            i === index ? { ...report, file: fileData } : report
          ),
        },
      }));
      if (inputElement) inputElement.value = '';
    } catch (error: any) {
      setError(`Failed to upload SP report file: ${error.message}`);
      if (inputElement) inputElement.value = '';
    }
  };

  const uploadDSPReportFile = async (file: File, index: number, inputElement?: HTMLInputElement) => {
    try {
      const fileData = await handleFileUpload(file, 'case-reports/dsp-reports');
      setFormData(prev => ({
        ...prev,
        reports: {
          ...prev.reports,
          dspReports: prev.reports.dspReports.map((report, i) =>
            i === index ? { ...report, file: fileData } : report
          ),
        },
      }));
      if (inputElement) inputElement.value = '';
    } catch (error: any) {
      setError(`Failed to upload DSP report file: ${error.message}`);
      if (inputElement) inputElement.value = '';
    }
  };

  const uploadPublicPetitionFile = async (file: File, inputElement?: HTMLInputElement) => {
    try {
      const fileData = await handleFileUpload(file, 'case-reports/public-petition');
      setFormData(prev => ({
        ...prev,
        publicPetitionFile: fileData,
      }));
      if (inputElement) inputElement.value = '';
    } catch (error: any) {
      setError(`Failed to upload public petition file: ${error.message}`);
      if (inputElement) inputElement.value = '';
    }
  };

  const uploadChargesheetFile = async (file: File, inputElement?: HTMLInputElement) => {
    try {
      const fileData = await handleFileUpload(file, 'case-reports/chargesheet');
      setFormData(prev => ({
        ...prev,
        chargeSheet: {
          ...prev.chargeSheet,
          file: fileData,
        },
      }));
      if (inputElement) inputElement.value = '';
    } catch (error: any) {
      setError(`Failed to upload chargesheet file: ${error.message}`);
      if (inputElement) inputElement.value = '';
    }
  };

  const uploadProsecutionSanctionFile = async (file: File, index: number, inputElement?: HTMLInputElement) => {
    try {
      const fileData = await handleFileUpload(file, 'case-reports/prosecution-sanction');
      setFormData(prev => ({
        ...prev,
        prosecutionSanction: prev.prosecutionSanction.map((sanction, i) =>
          i === index ? { ...sanction, file: fileData } : sanction
        ),
      }));
      if (inputElement) inputElement.value = '';
    } catch (error: any) {
      setError(`Failed to upload prosecution sanction file: ${error.message}`);
      if (inputElement) inputElement.value = '';
    }
  };

  const uploadFSLFile = async (file: File, index: number, inputElement?: HTMLInputElement) => {
    try {
      const fileData = await handleFileUpload(file, 'case-reports/fsl');
      setFormData(prev => ({
        ...prev,
        fsl: prev.fsl.map((fslEntry, i) =>
          i === index ? { ...fslEntry, file: fileData } : fslEntry
        ),
      }));
      if (inputElement) inputElement.value = '';
    } catch (error: any) {
      setError(`Failed to upload FSL file: ${error.message}`);
      if (inputElement) inputElement.value = '';
    }
  };

  const uploadInjuryFile = async (file: File, inputElement?: HTMLInputElement) => {
    try {
      const fileData = await handleFileUpload(file, 'case-reports/injury');
      setFormData(prev => ({
        ...prev,
        injuryReport: {
          ...prev.injuryReport,
          file: fileData,
        },
      }));
      if (inputElement) inputElement.value = '';
    } catch (error: any) {
      setError(`Failed to upload injury report file: ${error.message}`);
      if (inputElement) inputElement.value = '';
    }
  };

  const uploadPMFile = async (file: File, inputElement?: HTMLInputElement) => {
    try {
      const fileData = await handleFileUpload(file, 'case-reports/pm');
      setFormData(prev => ({
        ...prev,
        pmReport: {
          ...prev.pmReport,
          file: fileData,
        },
      }));
      if (inputElement) inputElement.value = '';
    } catch (error: any) {
      setError(`Failed to upload PM report file: ${error.message}`);
      if (inputElement) inputElement.value = '';
    }
  };

  // File delete handlers
  const deleteFile = async (publicId: string) => {
    try {
      const response = await fetch(`/api/upload?public_id=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
    } catch (error: any) {
      setError(`Failed to delete file: ${error.message}`);
    }
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

      const filteredSPReports = (formData.reports?.spReports || [])
        .map(report => ({
          label: report.label?.trim() || "",
          date: report.date || "",
          file: report.file || null,
        }))
        .filter(report => report.label || report.date);

      const filteredDSPReports = (formData.reports?.dspReports || [])
        .map(report => ({
          label: report.label?.trim() || "",
          date: report.date || "",
          file: report.file || null,
        }))
        .filter(report => report.label || report.date);

      const cleanedData = cleanNestedDates({
        ...formData,
        investigationStatus: formData.investigationStatus || undefined,
        srNsr: formData.srNsr || undefined,
        diary: formData.diary.filter(entry => entry.diaryNo || entry.diaryDate),
        prosecutionSanction: formData.prosecutionSanction.filter(sanction => sanction.type),
        fsl: formData.fsl.filter(fslEntry => fslEntry.reportRequired || fslEntry.sampleToBeCollected || fslEntry.sampleCollected),
        reports: {
          ...(formData.reports || {}),
          spReports: filteredSPReports,
          dspReports: filteredDSPReports,
        },
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
    <SuperAdminGuard>
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
                <select
                  name="crimeHead"
                  value={formData.crimeHead}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  <option value="">Select Crime Head</option>
                  {crimeHeads.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Pendency</label>
                <div className="space-y-2 border border-slate-300 rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                  {reasonForPendencyOptions.length === 0 ? (
                    <p className="text-sm text-slate-500">Loading options...</p>
                  ) : (
                    reasonForPendencyOptions.map((reason) => (
                    <label key={reason} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.reasonForPendency.includes(reason)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              reasonForPendency: [...prev.reasonForPendency, reason],
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              reasonForPendency: prev.reasonForPendency.filter(r => r !== reason),
                            }));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {reason}
                    </label>
                    ))
                  )}
                </div>
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
                {formData.petition && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-700 mb-2">Upload Public Petition File (PDF or Image)</label>
                    {formData.publicPetitionFile ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-slate-700">{formData.publicPetitionFile.original_filename}</span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (formData.publicPetitionFile?.public_id) {
                              await deleteFile(formData.publicPetitionFile.public_id);
                            }
                            setFormData(prev => ({
                              ...prev,
                              publicPetitionFile: null,
                            }));
                          }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadPublicPetitionFile(file, e.target);
                        }}
                        className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    )}
                  </div>
                )}
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
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
                        <textarea
                          value={accused.address || ""}
                          onChange={(e) => updateAccused(index, "address", e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                          placeholder="Enter address"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          value={accused.mobileNumber || ""}
                          onChange={(e) => updateAccused(index, "mobileNumber", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                          placeholder="Enter mobile number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Aadhaar Number</label>
                        <input
                          type="text"
                          value={accused.aadhaarNumber || ""}
                          onChange={(e) => updateAccused(index, "aadhaarNumber", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                          placeholder="Enter Aadhaar number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                        <select
                          value={accused.state || ""}
                          onChange={(e) => {
                            updateAccused(index, "state", e.target.value);
                            updateAccused(index, "district", ""); // Reset district when state changes
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">District</label>
                        <select
                          value={accused.district || ""}
                          onChange={(e) => updateAccused(index, "district", e.target.value)}
                          disabled={!accused.state}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Select District</option>
                          {accused.state && DISTRICTS_BY_STATE[accused.state]?.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
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
            <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-5">
              {/* SP Reports Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Reports by SP</span>
                  <button
                    type="button"
                    onClick={addSPReport}
                    className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add SP Report
                  </button>
                </div>
                {(formData.reports.spReports || []).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-2">
                    No SP reports added. Click &quot;Add SP Report&quot; to begin.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.reports.spReports.map((report, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg bg-slate-50 p-3">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xs font-semibold text-slate-700">SP Report {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeSPReport(index)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Report Label</label>
                            <select
                              value={report.label}
                              onChange={(e) => updateSPReport(index, "label", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="">Select Report</option>
                              <option value="R1">R1</option>
                              <option value="R2">R2</option>
                              <option value="R3">R3</option>
                              <option value="R4">R4</option>
                              <option value="R5">R5</option>
                            </select>
                </div>
                <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Report Date</label>
                  <input
                    type="date"
                              value={report.date}
                              onChange={(e) => updateSPReport(index, "date", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                        </div>
                        {/* File Upload for SP Report */}
                        <div className="border-t border-slate-200 pt-3 mt-3">
                          <label className="block text-xs font-medium text-slate-700 mb-2">Upload Report File (PDF or Image)</label>
                          {report.file ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-slate-700">{report.file.original_filename}</span>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (report.file?.public_id) {
                                    await deleteFile(report.file.public_id);
                                  }
                                  setFormData(prev => ({
                                    ...prev,
                                    reports: {
                                      ...prev.reports,
                                      spReports: prev.reports.spReports.map((r, i) =>
                                        i === index ? { ...r, file: null } : r
                                      ),
                                    },
                                  }));
                                }}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                  <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadSPReportFile(file, index, e.target);
                              }}
                              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          )}
                </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Supervision (after SP Reports) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Supervision Date</label>
                  <input
                    type="date"
                    value={formData.reports.supervision}
                    onChange={(e) => updateReports("supervision", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* DSP Reports Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Reports by DSP</span>
                  <button
                    type="button"
                    onClick={addDSPReport}
                    className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add DSP Report
                  </button>
                </div>
                {(formData.reports.dspReports || []).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-2">
                    No DSP reports added. Click &quot;Add DSP Report&quot; to begin.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.reports.dspReports.map((report, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg bg-slate-50 p-3">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xs font-semibold text-slate-700">DSP Report {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeDSPReport(index)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Report Label</label>
                            <select
                              value={report.label}
                              onChange={(e) => updateDSPReport(index, "label", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="">Select Report</option>
                              <option value="PR1">PR1</option>
                              <option value="PR2">PR2</option>
                              <option value="PR3">PR3</option>
                              <option value="PR4">PR4</option>
                              <option value="PR5">PR5</option>
                            </select>
                </div>
                <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Report Date</label>
                  <input
                    type="date"
                              value={report.date}
                              onChange={(e) => updateDSPReport(index, "date", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                        </div>
                        {/* File Upload for DSP Report */}
                        <div className="border-t border-slate-200 pt-3 mt-3">
                          <label className="block text-xs font-medium text-slate-700 mb-2">Upload Report File (PDF or Image)</label>
                          {report.file ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-slate-700">{report.file.original_filename}</span>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (report.file?.public_id) {
                                    await deleteFile(report.file.public_id);
                                  }
                                  setFormData(prev => ({
                                    ...prev,
                                    reports: {
                                      ...prev.reports,
                                      dspReports: prev.reports.dspReports.map((r, i) =>
                                        i === index ? { ...r, file: null } : r
                                      ),
                                    },
                                  }));
                                }}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                  <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadDSPReportFile(file, index, e.target);
                              }}
                              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          )}
                </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Other Reports */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              {/* File Upload for All Reports */}
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-xs font-medium text-slate-700 mb-2">Upload Report File (PDF or Image)</label>
                {formData.reports.file ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-slate-700">{formData.reports.file.original_filename}</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (formData.reports.file?.public_id) {
                          await deleteFile(formData.reports.file.public_id);
                        }
                        setFormData(prev => ({
                          ...prev,
                          reports: { ...prev.reports, file: null },
                        }));
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadReportsFile(file, e.target);
                    }}
                    className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Chargesheet submitted in VO Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Chargesheet submitted in VO
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
                  Chargesheet submitted in VO
                </label>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Submission Date (VO)</label>
                  <input
                    type="date"
                    value={formData.chargeSheet.submissionDate}
                    onChange={(e) => updateChargeSheet("submissionDate", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                {/* File Upload for Chargesheet */}
                <div className="border-t border-slate-200 pt-3">
                  <label className="block text-xs font-medium text-slate-700 mb-2">Upload Chargesheet File (PDF or Image)</label>
                  {formData.chargeSheet.file ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-slate-700">{formData.chargeSheet.file.original_filename}</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (formData.chargeSheet.file?.public_id) {
                            await deleteFile(formData.chargeSheet.file.public_id);
                          }
                          setFormData(prev => ({
                            ...prev,
                            chargeSheet: { ...prev.chargeSheet, file: null },
                          }));
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadChargesheetFile(file, e.target);
                      }}
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Chargesheet Deadline Type *</label>
                  <select
                    name="chargesheetDeadlineType"
                    value={formData.chargesheetDeadlineType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Chargesheet must be filed within this period from arrest date</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="finalChargesheetSubmitted"
                    checked={formData.finalChargesheetSubmitted}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Chargesheet submitted in Court
                </label>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Submission Date (Court)</label>
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
                    {/* File Upload for Prosecution Sanction */}
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <label className="block text-xs font-medium text-slate-700 mb-2">Upload Prosecution Sanction File (PDF or Image)</label>
                      {sanction.file ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-slate-700">{sanction.file.original_filename}</span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (sanction.file?.public_id) {
                                await deleteFile(sanction.file.public_id);
                              }
                              updateProsecutionSanction(index, "file", null);
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadProsecutionSanctionFile(file, index, e.target);
                          }}
                          className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      )}
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
                        {/* File Upload for FSL */}
                        <div className="border-t border-slate-200 pt-3 mt-3">
                          <label className="block text-xs font-medium text-slate-700 mb-2">Upload FSL File (PDF or Image)</label>
                          {fslEntry.file ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-slate-700">{fslEntry.file.original_filename}</span>
                      </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (fslEntry.file?.public_id) {
                                    await deleteFile(fslEntry.file.public_id);
                                  }
                                  updateFSL(index, "file", null);
                                }}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadFSLFile(file, index, e.target);
                              }}
                              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          )}
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
                  Report Required
                </label>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Injury Type</label>
                  <select
                    value={formData.injuryReport.injuryType}
                    onChange={(e) => updateInjuryReport("injuryType", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Select injury type</option>
                    {INJURY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
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
                {/* File Upload for Injury Report */}
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <label className="block text-xs font-medium text-slate-700 mb-2">Upload Injury Report File (PDF or Image)</label>
                  {formData.injuryReport.file ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-slate-700">{formData.injuryReport.file.original_filename}</span>
              </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (formData.injuryReport.file?.public_id) {
                            await deleteFile(formData.injuryReport.file.public_id);
                          }
                          setFormData(prev => ({
                            ...prev,
                            injuryReport: { ...prev.injuryReport, file: null },
                          }));
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadInjuryFile(file, e.target);
                      }}
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  )}
                </div>
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
                {/* File Upload for PM Report */}
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <label className="block text-xs font-medium text-slate-700 mb-2">Upload PM Report File (PDF or Image)</label>
                  {formData.pmReport.file ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-slate-700">{formData.pmReport.file.original_filename}</span>
              </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (formData.pmReport.file?.public_id) {
                            await deleteFile(formData.pmReport.file.public_id);
                          }
                          setFormData(prev => ({
                            ...prev,
                            pmReport: { ...prev.pmReport, file: null },
                          }));
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPMFile(file, e.target);
                      }}
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  )}
                </div>
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
    </SuperAdminGuard>
  );
}

