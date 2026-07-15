import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExpertDashboard from './ExpertDashboard';

export default function DashboardPage() {
  const { user, loading, updateRole } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState('');

  async function handleSwitchToExpert() {
    setSwitchError('');
    setSwitching(true);
    const result = await updateRole('expert');
    setSwitching(false);
    if (!result.success) setSwitchError(result.error);
    // On success, user.role updates → this component re-renders into the dashboard
  }

  // Wait for Firebase session to restore before deciding access
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--voneng-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-mist text-sm">Verifying access...</p>
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
          <h2 className="text-white font-bold text-2xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Expert Access Required
          </h2>
          <p className="text-mist mb-6">
            The detailed technical dashboard is available to engineers and investors only.
            Your current account is registered as a Farmer.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSwitchToExpert}
              disabled={switching}
              className="btn-accent w-full text-center"
            >
              {switching ? 'Switching…' : '🔬 Switch to Expert Account'}
            </button>
            <Link to="/advisor" className="btn-primary w-full text-center">
              Back to Farm Advisor
            </Link>
          </div>
          {switchError && (
            <p className="text-red-400 text-sm mt-4 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
              {switchError}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <ExpertDashboard />;
}
