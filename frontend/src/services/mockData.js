/**
 * Scheme definitions and configurable rule thresholds for Adivya
 * Smart India Hackathon 2026 • Problem Statement ID: 26239
 * 
 * NOTE: Production-ready clean state. No hardcoded sample applications or fake demo records.
 */

export const INITIAL_SCHEMES = [
  {
    id: 'NFST',
    code: 'NFST',
    name: 'National Fellowship for Scheduled Tribe (NFST)',
    shortDesc: 'Financial assistance to ST students for pursuing M.Phil and Ph.D. research programmes in Indian Universities and Institutions.',
    level: 'Higher Education (Ph.D. / M.Phil)',
    scope: 'Domestic (India)',
    annualSlots: 750,
    applicationWindow: 'Active (Cycle 2026-27)',
    deadline: '2026-10-31',
    financialBenefits: 'JRF: ₹37,000/month | SRF: ₹42,000/month + Contingency Grant ₹20,500/year',
    qualifyingCriteria: {
      minMarks: '55% in Master Degree',
      maxIncome: '₹6,00,000 / year',
      maxAge: '36 years (Men) / 41 years (Women/PwD)',
      category: 'Scheduled Tribe (ST) only'
    },
    requiredDocuments: [
      'Aadhaar / Photo Identity',
      'ST Community Certificate',
      'Valid Family Income Certificate',
      'Master Degree Marksheet & Degree',
      'Ph.D. Admission / Registration Proof',
      'Bank Account Passbook (Aadhaar linked)'
    ]
  },
  {
    id: 'NOS',
    code: 'NOS',
    name: 'National Overseas Scholarship (NOS)',
    shortDesc: 'Financial support for meritorious ST candidates to pursue Master’s level courses and Ph.D. in premier world universities abroad.',
    level: 'Overseas Higher Education (Master / Ph.D.)',
    scope: 'International (Top 500 QS/Times Ranked)',
    annualSlots: 20,
    applicationWindow: 'Active (Cycle 2026-27)',
    deadline: '2026-11-15',
    financialBenefits: 'Full Tuition Fees + Annual Maintenance (USA: $15,400 / UK: £9,900) + Air Passage',
    qualifyingCriteria: {
      minMarks: '60% in Bachelor / Master Degree',
      maxIncome: '₹8,00,000 / year',
      maxAge: '35 years on 1st April of selection year',
      category: 'Scheduled Tribe (ST) only'
    },
    requiredDocuments: [
      'Aadhaar / Valid Passport',
      'ST Community Certificate',
      'Annual Income Certificate',
      'Bachelor / Master Transcripts',
      'Unconditional Offer Letter from Top 500 University',
      'IELTS / TOEFL / GRE Scorecard',
      'Bank Account Statement'
    ]
  }
];

export const INITIAL_RULES = {
  NFST: {
    minPostGradPercentage: 55,
    maxFamilyIncome: 600000,
    maxAgeMale: 36,
    maxAgeFemale: 41,
    mandatoryStCertVerification: true,
    requireResearchSynopsis: true
  },
  NOS: {
    minGradPercentage: 60,
    maxFamilyIncome: 800000,
    maxAge: 35,
    mandatoryPassport: true,
    maxRankQsWorld: 500,
    mandatoryUnconditionalOffer: true
  }
};

// Clean initial empty datasets - no hardcoded demo or sample applications
export const INITIAL_APPLICATIONS = [];

export const INITIAL_NOTIFICATIONS = [];
