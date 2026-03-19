import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Lazy-load the existing full dashboard
import ExpertDashboard from './ExpertDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'expert') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--voneng-bg)' }}>
        <div className="glass-card p-10 max-w-md text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h2 className="text-white font-bold text-2xl mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Expert Access Required
          </h2>
          <p className="text-slate-400 mb-6">
            The detailed technical dashboard is available to engineers and investors only. 
            Your current account is registered as a Farmer.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/advisor" className="btn-primary w-full text-center">
              Back to Farm Advisor
            </Link>
            <Link to="/signup" className="btn-secondary w-full text-center">
              Create an Expert Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ExpertDashboard />;
}
