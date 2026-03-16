require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Scheme = require("../models/Scheme");

const schemes = [
  {
    name: "PM-Kisan Samman Nidhi",
    nameHindi: "पीएम-किसान सम्मान निधि",
    nameKannada: "ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
    description:
      "Direct income support of ₹6,000 per year to small and marginal farmer families across India, paid in three equal installments.",
    category: "agriculture",
    eligibility: {
      ageMin: 18,
      ageMax: 120,
      incomeMax: 500000,
      occupations: ["farmer", "agricultural_worker", "all"],
    },
    benefits: "₹6,000/year in 3 installments of ₹2,000 each directly to bank account",
    applicationFee: 0,
    applicationUrl: "https://pmkisan.gov.in/",
    verifiedSource: "https://pmkisan.gov.in/",
    nearestCenter: "Nearest Common Service Centre (CSC) or Gram Panchayat Office",
    nextSteps: [
      "Visit your nearest CSC or Gram Panchayat office",
      "Carry Aadhaar Card, Land Records, and Bank Passbook",
      "Fill the PM-Kisan registration form",
      "Verification will be done by state government officials",
    ],
  },
  {
    name: "PM Awas Yojana – Gramin",
    nameHindi: "पीएम आवास योजना – ग्रामीण",
    nameKannada: "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ – ಗ್ರಾಮೀಣ",
    description:
      "Financial assistance for construction of pucca houses for rural families who are homeless or living in kutcha/dilapidated houses.",
    category: "housing",
    eligibility: {
      ageMin: 18,
      ageMax: 120,
      incomeMax: 300000,
      occupations: ["all"],
    },
    benefits: "₹1,20,000 in plain areas and ₹1,30,000 in hilly/IAP areas for house construction",
    applicationFee: 0,
    applicationUrl: "https://pmayg.nic.in/",
    verifiedSource: "https://pmayg.nic.in/",
    nearestCenter: "Block Development Office or Gram Panchayat",
    nextSteps: [
      "Check if your name is in the SECC-2011 beneficiary list",
      "Visit your Gram Panchayat office with Aadhaar and income certificate",
      "Submit the application through the Gram Panchayat",
      "House construction must begin within 12 months of sanction",
    ],
  },
  {
    name: "Ayushman Bharat – PM-JAY",
    nameHindi: "आयुष्मान भारत – पीएम-जय",
    nameKannada: "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ – ಪಿಎಂ-ಜೈ",
    description:
      "Health insurance cover of ₹5 lakh per family per year for secondary and tertiary hospitalization to reduce catastrophic health expenditure.",
    category: "health",
    eligibility: {
      ageMin: 0,
      ageMax: 120,
      incomeMax: 250000,
      occupations: ["all"],
    },
    benefits: "₹5 lakh health coverage per family per year at empanelled hospitals",
    applicationFee: 0,
    applicationUrl: "https://pmjay.gov.in/",
    verifiedSource: "https://pmjay.gov.in/",
    nearestCenter: "Nearest Ayushman Bharat empanelled hospital or CSC",
    nextSteps: [
      "Check eligibility at mera.pmjay.gov.in using your mobile number or ration card",
      "Visit the nearest empanelled hospital's Ayushman Mitra desk",
      "Carry Aadhaar Card and any government ID",
      "Get your Ayushman card generated on the spot (free)",
    ],
  },
  {
    name: "Sukanya Samriddhi Yojana",
    nameHindi: "सुकन्या समृद्धि योजना",
    nameKannada: "ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ",
    description:
      "A small savings scheme for the girl child offering high interest rates and tax benefits to secure their future education and marriage expenses.",
    category: "finance",
    eligibility: {
      ageMin: 0,
      ageMax: 10,
      incomeMax: 10000000,
      occupations: ["all"],
    },
    benefits: "8.2% interest rate (2026), tax-free maturity, minimum ₹250/year deposit",
    applicationFee: 0,
    applicationUrl: "https://www.india.gov.in/sukanya-samriddhi-yojna",
    verifiedSource: "https://www.india.gov.in/sukanya-samriddhi-yojna",
    nearestCenter: "Any Post Office or authorised bank branch",
    nextSteps: [
      "Visit any Post Office or Bank (SBI, PNB, BOI, etc.)",
      "Carry girl child's birth certificate and parent's Aadhaar + PAN",
      "Fill the account opening form",
      "Deposit minimum ₹250 to activate",
    ],
  },
  {
    name: "MGNREGA",
    nameHindi: "मनरेगा",
    nameKannada: "ಮನರೇಗಾ",
    description:
      "Guarantees 100 days of wage employment per year to every rural household whose adult members volunteer to do unskilled manual work.",
    category: "welfare",
    eligibility: {
      ageMin: 18,
      ageMax: 65,
      incomeMax: 500000,
      occupations: ["all"],
    },
    benefits: "100 days guaranteed employment at state minimum wage rate",
    applicationFee: 0,
    applicationUrl: "https://nrega.nic.in/",
    verifiedSource: "https://nrega.nic.in/",
    nearestCenter: "Gram Panchayat Office",
    nextSteps: [
      "Apply for a Job Card at your Gram Panchayat",
      "Carry recent passport-size photograph and Aadhaar",
      "Job Card will be issued within 15 days",
      "Apply for work by submitting a written application to the Gram Panchayat",
    ],
  },
  {
    name: "PM Mudra Yojana",
    nameHindi: "पीएम मुद्रा योजना",
    nameKannada: "ಪಿಎಂ ಮುದ್ರಾ ಯೋಜನೆ",
    description:
      "Provides micro-loans up to ₹10 lakh to small/micro enterprises and individuals for starting or expanding businesses.",
    category: "finance",
    eligibility: {
      ageMin: 18,
      ageMax: 65,
      incomeMax: 1000000,
      occupations: ["self_employed", "shopkeeper", "artisan", "vendor", "all"],
    },
    benefits: "Collateral-free loans: Shishu (₹50K), Kishore (₹5L), Tarun (₹10L)",
    applicationFee: 0,
    applicationUrl: "https://www.mudra.org.in/",
    verifiedSource: "https://www.mudra.org.in/",
    nearestCenter: "Any Bank branch, NBFC, or Micro Finance Institution",
    nextSteps: [
      "Prepare a brief business plan or activity description",
      "Visit nearest bank branch with Aadhaar, PAN, and address proof",
      "Fill the Mudra loan application form",
      "No collateral needed for loans up to ₹10 lakh",
    ],
  },
  {
    name: "National Pension Scheme (NPS) – Atal Pension Yojana",
    nameHindi: "अटल पेंशन योजना",
    nameKannada: "ಅಟಲ್ ಪಿಂಚಣಿ ಯೋಜನೆ",
    description:
      "Guaranteed pension scheme for unorganised sector workers providing fixed pension of ₹1,000 to ₹5,000 per month after age 60.",
    category: "welfare",
    eligibility: {
      ageMin: 18,
      ageMax: 40,
      incomeMax: 500000,
      occupations: ["all"],
    },
    benefits: "Guaranteed monthly pension ₹1,000 to ₹5,000 after age 60, tax benefits under 80CCD",
    applicationFee: 0,
    applicationUrl: "https://www.npscra.nsdl.co.in/",
    verifiedSource: "https://www.npscra.nsdl.co.in/",
    nearestCenter: "Any Bank where you hold a savings account",
    nextSteps: [
      "Visit your bank branch (savings account required)",
      "Carry Aadhaar and mobile number linked to bank",
      "Choose your monthly pension amount (₹1,000 – ₹5,000)",
      "Auto-debit will be set up from your savings account",
    ],
  },
];

const seedSchemes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for seeding");

    await Scheme.deleteMany({});
    console.log("🗑️  Cleared existing schemes");

    const inserted = await Scheme.insertMany(schemes);
    console.log(`✅ Seeded ${inserted.length} government schemes`);

    await mongoose.disconnect();
    console.log("👋 Done. MongoDB disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedSchemes();
