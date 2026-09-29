import { INITIAL_APPLICATIONS, INITIAL_SCHEMES, INITIAL_RULES, INITIAL_NOTIFICATIONS } from './mockData';

const APPS_STORAGE_KEY = 'tribal_scholarships_data_v2';
const SCHEMES_STORAGE_KEY = 'tribal_scholarships_schemes_v2';
const RULES_STORAGE_KEY = 'tribal_scholarships_rules_v2';
const NOTIFS_STORAGE_KEY = 'tribal_scholarships_notifs_v2';

// Initialize localStorage if empty
const getStoredApplications = () => {
  const data = localStorage.getItem(APPS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
    return INITIAL_APPLICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_APPLICATIONS;
  }
};

const saveApplications = (apps) => {
  localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
};

const getStoredSchemes = () => {
  const data = localStorage.getItem(SCHEMES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(SCHEMES_STORAGE_KEY, JSON.stringify(INITIAL_SCHEMES));
    return INITIAL_SCHEMES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SCHEMES;
  }
};

const getStoredRules = () => {
  const data = localStorage.getItem(RULES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(INITIAL_RULES));
    return INITIAL_RULES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_RULES;
  }
};

const getStoredNotifications = () => {
  const data = localStorage.getItem(NOTIFS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

const saveNotifications = (notifs) => {
  localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs));
};

// Helper simulated latency
const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

let inMemorySubmittedApplication = null;

/**
 * Clean API Service Layer (Backend & AI integration ready)
 */
export const api = {
  // In-memory prototype session application state
  getSubmittedApplication() {
    return inMemorySubmittedApplication;
  },

  setSubmittedApplication(app) {
    inMemorySubmittedApplication = app;
  },

  async getActiveApplicantApplication(currentUserId) {
    if (inMemorySubmittedApplication) {
      return inMemorySubmittedApplication;
    }
    if (currentUserId && currentUserId !== 'APPLICANT-SESSION') {
      const apps = getStoredApplications();
      const app = apps.find((a) => a.id === currentUserId);
      if (app) return { ...app };
    }
    return null;
  },

  // Clear stored application data
  async resetToDefaultData() {
    localStorage.removeItem(APPS_STORAGE_KEY);
    localStorage.removeItem(SCHEMES_STORAGE_KEY);
    localStorage.removeItem(RULES_STORAGE_KEY);
    localStorage.removeItem(NOTIFS_STORAGE_KEY);
    inMemorySubmittedApplication = null;
    return true;
  },

  // Applications
  async getApplications() {
    await delay();
    return [...getStoredApplications()];
  },

  async getApplicationById(id) {
    await delay();
    const apps = getStoredApplications();
    const app = apps.find((a) => a.id === id);
    if (!app) return null;
    return { ...app };
  },

  async submitApplication(formData) {
    await delay(200);
    const apps = getStoredApplications();
    const newId = `${formData.scheme || 'NFST'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newApp = {
      id: newId,
      applicantName: formData.applicantName || 'Applicant',
      email: formData.email || '',
      phone: formData.phone || '',
      gender: formData.gender || 'Not specified',
      dob: formData.dob || '',
      category: 'ST',
      subTribe: formData.subTribe || '',
      state: formData.state || '',
      district: formData.district || '',
      scheme: formData.scheme || 'NFST',
      schemeName: formData.scheme === 'NOS' ? 'National Overseas Scholarship' : 'National Fellowship for Scheduled Tribe',
      courseType: formData.courseType || 'Ph.D.',
      discipline: formData.discipline || '',
      institution: formData.institution || '',
      nirfRank: formData.nirfRank || null,
      qsRank: formData.qsRank || null,
      qualifyingDegree: formData.qualifyingDegree || '',
      qualifyingPercentage: parseFloat(formData.qualifyingPercentage) || 0,
      annualFamilyIncome: parseFloat(formData.annualFamilyIncome) || 0,
      bankDetails: {
        bankName: formData.bankName || '',
        accountNumber: formData.accountNumber ? `••••••••${formData.accountNumber.slice(-4)}` : '',
        ifsc: formData.ifsc || '',
        aadhaarLinked: !!formData.aadhaarSeeded
      },
      status: 'UNDER_VERIFICATION',
      verificationStatus: 'REVIEW',
      eligibilityStatus: 'PENDING',
      screeningStatus: 'PENDING',
      finalDecision: 'PENDING',
      submittedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      documents: (formData.documents && formData.documents.length > 0) ? formData.documents : [],
      timeline: [
        { stage: 'Application Submitted', status: 'COMPLETED', date: new Date().toLocaleString(), note: 'Online application submitted.' },
        { stage: 'AI Document Verification', status: 'IN_PROGRESS', date: new Date().toLocaleString(), note: 'Awaiting OCR pipeline analysis.' },
        { stage: 'Eligibility Verification', status: 'PENDING', date: 'Pending', note: 'Scheme rules check.' },
        { stage: 'Administrative Scrutiny', status: 'PENDING', date: 'Pending', note: 'Officer desk review.' },
        { stage: 'Screening Committee', status: 'PENDING', date: 'Pending', note: 'Selection Committee evaluation.' },
        { stage: 'Selection & Award', status: 'PENDING', date: 'Pending', note: '-' },
        { stage: 'Disbursement', status: 'PENDING', date: 'Pending', note: '-' }
      ],
      deficiencies: [],
      officerRemarks: 'Submitted application queued for administrative scrutiny.'
    };

    apps.unshift(newApp);
    saveApplications(apps);
    inMemorySubmittedApplication = newApp;

    // Add notification for admin
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      forRole: 'admin',
      title: `New Application Received: ${newId}`,
      message: `${formData.applicantName} applied for ${newApp.schemeName}.`,
      date: new Date().toLocaleString(),
      type: 'primary',
      read: false,
      link: `/admin/applications/${newId}`
    });
    saveNotifications(notifs);

    return newApp;
  },

  async uploadDocument(appId, docData) {
    await delay(150);
    const apps = getStoredApplications();
    const appIndex = apps.findIndex((a) => a.id === appId);
    if (appIndex === -1) throw new Error('Application not found');

    const newDoc = {
      id: `doc-${Date.now()}`,
      type: docData.type || 'Supplementary Document',
      filename: docData.filename || 'uploaded_document.pdf',
      size: docData.size || '1.0 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'UNDER_REVIEW',
      confidence: 95.0,
      ocrResult: {
        extractedName: apps[appIndex].applicantName,
        discrepancy: 'Document queued for verification.'
      }
    };

    apps[appIndex].documents = apps[appIndex].documents || [];
    apps[appIndex].documents.push(newDoc);
    apps[appIndex].lastUpdatedAt = new Date().toISOString();
    saveApplications(apps);

    return newDoc;
  },

  async verifyDocument(appId, docId, officerDecision) {
    await delay(100);
    const apps = getStoredApplications();
    const app = apps.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    const doc = (app.documents || []).find((d) => d.id === docId);
    if (doc) {
      doc.status = officerDecision === 'PASS' ? 'VERIFIED' : officerDecision === 'FAIL' ? 'VERIFICATION_FAILED' : 'NEEDS_RESUBMISSION';
      doc.officerVerdict = officerDecision;
    }

    const allVerified = app.documents && app.documents.length > 0 && app.documents.every((d) => d.status === 'VERIFIED');
    if (allVerified) {
      app.verificationStatus = 'PASS';
    }

    app.lastUpdatedAt = new Date().toISOString();
    saveApplications(apps);
    return app;
  },

  async createDeficiency(appId, deficiencyData) {
    await delay(150);
    const apps = getStoredApplications();
    const app = apps.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    const newDeficiency = {
      id: `def-${Date.now()}`,
      documentId: deficiencyData.documentId || null,
      documentType: deficiencyData.documentType || 'Application Field',
      issue: deficiencyData.issue || 'Deficiency Identified',
      description: deficiencyData.description || 'Please provide updated documentation.',
      createdAt: new Date().toISOString(),
      status: 'OPEN',
      resubmittedDocument: null,
      resubmittedAt: null
    };

    app.deficiencies = app.deficiencies || [];
    app.deficiencies.push(newDeficiency);
    app.status = 'DEFICIENT';
    app.verificationStatus = 'REVIEW';
    app.lastUpdatedAt = new Date().toISOString();

    if (deficiencyData.documentId && app.documents) {
      const doc = app.documents.find((d) => d.id === deficiencyData.documentId);
      if (doc) doc.status = 'NEEDS_RESUBMISSION';
    }

    saveApplications(apps);

    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      forRole: 'applicant',
      applicantId: appId,
      title: `Deficiency Raised: ${deficiencyData.issue}`,
      message: deficiencyData.description,
      date: new Date().toLocaleString(),
      type: 'warning',
      read: false,
      link: '/applicant/deficiencies'
    });
    saveNotifications(notifs);

    return app;
  },

  async resolveDeficiency(appId, defId, replacementData) {
    await delay(150);
    const apps = getStoredApplications();
    const app = apps.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    const def = (app.deficiencies || []).find((d) => d.id === defId);
    if (def) {
      def.status = 'RESUBMITTED';
      def.resubmittedDocument = replacementData.filename || 'replacement_doc.pdf';
      def.resubmittedAt = new Date().toISOString();
      def.applicantResponse = replacementData.remarks || 'Uploaded corrected document.';
    }

    if (def && def.documentId && app.documents) {
      const doc = app.documents.find((d) => d.id === def.documentId);
      if (doc) {
        doc.status = 'UNDER_REVIEW';
        doc.filename = replacementData.filename || doc.filename;
      }
    }

    const openDefs = app.deficiencies.filter((d) => d.status === 'OPEN');
    if (openDefs.length === 0) {
      app.status = 'UNDER_VERIFICATION';
      app.verificationStatus = 'REVIEW';
    }

    app.lastUpdatedAt = new Date().toISOString();
    saveApplications(apps);

    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      forRole: 'admin',
      title: `Deficiency Resubmitted: ${app.id}`,
      message: `${app.applicantName} resubmitted document for ${def?.issue || 'deficiency'}.`,
      date: new Date().toLocaleString(),
      type: 'info',
      read: false,
      link: `/admin/applications/${app.id}`
    });
    saveNotifications(notifs);

    return app;
  },

  async updateApplicationStatus(id, newStatus, remarks = '') {
    await delay(100);
    const apps = getStoredApplications();
    const app = apps.find((a) => a.id === id);
    if (!app) throw new Error('Application not found');

    app.status = newStatus;
    if (remarks) app.officerRemarks = remarks;
    if (newStatus === 'APPROVED') {
      app.finalDecision = 'APPROVED';
      app.screeningStatus = 'RECOMMENDED';
      app.eligibilityStatus = 'ELIGIBLE';
      app.verificationStatus = 'PASS';
    } else if (newStatus === 'REJECTED') {
      app.finalDecision = 'REJECTED';
    } else if (newStatus === 'ELIGIBLE') {
      app.eligibilityStatus = 'ELIGIBLE';
    }

    app.lastUpdatedAt = new Date().toISOString();
    saveApplications(apps);

    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      forRole: 'applicant',
      applicantId: id,
      title: `Application Status Updated: ${newStatus}`,
      message: remarks || `Your application status has been moved to ${newStatus}.`,
      date: new Date().toLocaleString(),
      type: newStatus === 'APPROVED' ? 'success' : newStatus === 'REJECTED' ? 'danger' : 'info',
      read: false,
      link: '/applicant/status'
    });
    saveNotifications(notifs);

    return app;
  },

  async updateScreeningStatus(id, screeningStatus, remarks = '') {
    await delay(100);
    const apps = getStoredApplications();
    const app = apps.find((a) => a.id === id);
    if (!app) throw new Error('Application not found');

    app.screeningStatus = screeningStatus;
    if (screeningStatus === 'RECOMMENDED') {
      app.status = 'SCREENED';
    }
    if (remarks) app.officerRemarks = remarks;
    app.lastUpdatedAt = new Date().toISOString();
    saveApplications(apps);
    return app;
  },

  // Schemes & Rules
  async getSchemes() {
    await delay(50);
    return getStoredSchemes();
  },

  async getSchemeById(id) {
    await delay(50);
    const schemes = getStoredSchemes();
    return schemes.find((s) => s.id === id || s.code === id) || null;
  },

  async getRules() {
    await delay(50);
    return getStoredRules();
  },

  async updateRules(schemeCode, newRules) {
    await delay(100);
    const rules = getStoredRules();
    rules[schemeCode] = { ...rules[schemeCode], ...newRules };
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
    return rules;
  },

  // Notifications
  async getNotifications(role = 'applicant', applicantId = null) {
    await delay(50);
    const all = getStoredNotifications();
    if (role === 'admin') {
      return all.filter((n) => n.forRole === 'admin');
    }
    return all.filter((n) => n.forRole === 'applicant' && (!applicantId || n.applicantId === applicantId));
  }
};
