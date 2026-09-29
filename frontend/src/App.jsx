import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { ApplicantLayout } from './layouts/ApplicantLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/home/HomePage';
import { AboutPage } from './pages/home/AboutPage';
import { SchemesPage } from './pages/home/SchemesPage';
import { HowItWorksPage } from './pages/home/HowItWorksPage';

// Applicant Pages
import { ApplicantLogin } from './applicant/pages/ApplicantLogin';
import { ApplicantRegister } from './applicant/pages/ApplicantRegister';
import { ApplicantDashboard } from './applicant/pages/ApplicantDashboard';
import { ApplicantSchemes } from './applicant/pages/ApplicantSchemes';
import { ApplicationForm } from './applicant/pages/ApplicationForm';
import { ApplicantDocuments } from './applicant/pages/ApplicantDocuments';
import { AIassistedVerification } from './applicant/pages/AIassistedVerification';
import { ApplicantDeficiencies } from './applicant/pages/ApplicantDeficiencies';
import { ApplicationStatus } from './applicant/pages/ApplicationStatus';
import { ApplicantNotifications } from './applicant/pages/ApplicantNotifications';
import { ApplicantProfile } from './applicant/pages/ApplicantProfile';

// Admin Pages
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminApplications } from './admin/pages/AdminApplications';
import { ApplicationDetail } from './admin/pages/ApplicationDetail';
import { AdminVerification } from './admin/pages/AdminVerification';
import { AdminEligibility } from './admin/pages/AdminEligibility';
import { AdminScreening } from './admin/pages/AdminScreening';
import { AdminCommunication } from './admin/pages/AdminCommunication';
import { AdminReports } from './admin/pages/AdminReports';
import { AdminSchemes } from './admin/pages/AdminSchemes';
import { AdminRules } from './admin/pages/AdminRules';
import { AdminSettings } from './admin/pages/AdminSettings';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 1. PUBLIC EXPERIENCE */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          
          {/* Public Auth Portals */}
          <Route path="/applicant/login" element={<ApplicantLogin />} />
          <Route path="/applicant/register" element={<ApplicantRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* 2. APPLICANT PORTAL EXPERIENCE */}
        <Route path="/applicant" element={<ApplicantLayout />}>
          <Route index element={<Navigate to="/applicant/dashboard" replace />} />
          <Route path="dashboard" element={<ApplicantDashboard />} />
          <Route path="schemes" element={<ApplicantSchemes />} />
          <Route path="application" element={<ApplicationForm />} />
          <Route path="documents" element={<ApplicantDocuments />} />
          <Route path="verification" element={<AIassistedVerification />} />
          <Route path="deficiencies" element={<ApplicantDeficiencies />} />
          <Route path="status" element={<ApplicationStatus />} />
          <Route path="notifications" element={<ApplicantNotifications />} />
          <Route path="profile" element={<ApplicantProfile />} />
        </Route>

        {/* 3. ADMIN SCRUTINY PORTAL EXPERIENCE */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="eligibility" element={<AdminEligibility />} />
          <Route path="screening" element={<AdminScreening />} />
          <Route path="communication" element={<AdminCommunication />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="schemes" element={<AdminSchemes />} />
          <Route path="rules" element={<AdminRules />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
