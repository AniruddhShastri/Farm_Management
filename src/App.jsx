import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AdvisorPage from './pages/AdvisorPage';
import DashboardPage from './pages/DashboardPage';
import { pageVariants } from './components/motion';

/* Wraps each routed page in a shared enter/exit transition. */
function PageShell({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

/* The ExpertDashboard has its own full-screen layout,
   so we exclude the global Navbar from that route only.
   Navbar lives outside AnimatePresence so it never remounts on navigation. */
function NavbarSlot() {
  const { pathname } = useLocation();
  if (pathname === '/dashboard') return null;
  return <Navbar />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageShell><HomePage /></PageShell>} />
        <Route path="/signup" element={<PageShell><SignupPage /></PageShell>} />
        <Route path="/login" element={<PageShell><LoginPage /></PageShell>} />
        <Route path="/advisor" element={<PageShell><AdvisorPage /></PageShell>} />
        <Route path="/dashboard" element={<PageShell><DashboardPage /></PageShell>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <NavbarSlot />
            <AnimatedRoutes />
          </BrowserRouter>
        </MotionConfig>
      </AuthProvider>
    </LanguageProvider>
  );
}
