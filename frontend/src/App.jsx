import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InterviewPage from './pages/InterviewPage';
import InterviewRoomPage from './pages/InterviewRoomPage';
import ResumePage from './pages/ResumePage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Protected — wrapped in DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        {/* Full-screen pages — no DashboardLayout */}
        <Route path="/interview/:id" element={<InterviewRoomPage />} />

        {/* Dashboard layout pages */}
        <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Admin Only */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
