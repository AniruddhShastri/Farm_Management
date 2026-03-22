import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExpertDashboard from './ExpertDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Wait for Firebase session to restore before deciding access
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--voneng-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-500 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

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
