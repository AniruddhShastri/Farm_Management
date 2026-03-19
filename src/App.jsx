import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AdvisorPage from './pages/AdvisorPage';
import DashboardPage from './pages/DashboardPage';

/* The ExpertDashboard has its own full-screen layout,
   so we exclude the global Navbar from that route only. */
function Layout({ children, hideNav }) {
  return (
    <>
      {!hideNav && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/advisor" element={<Layout><AdvisorPage /></Layout>} />
            <Route path="/dashboard" element={<Layout hideNav><DashboardPage /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
