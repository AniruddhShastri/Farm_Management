import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const { login, loginWithGoogle, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);
    const result = await loginWithGoogle(); // Default role is farmer, but context provides DB logic
    setGoogleLoading(false);
    if (!result.success) {
      return setError(result.error);
    }
    // Simple redirect based on role (using local mock or real db output)
    navigate('/dashboard'); 
  }

  function set(field) {
    return (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Please enter your email and password.');
    setLoading(true);
    setTimeout(() => {
      const result = login(form.email, form.password);
      setLoading(false);
      if (!result.success) return setError(result.error);
      const users = JSON.parse(localStorage.getItem('voneng_users') || '[]');
      const found = users.find(u => u.email === form.email);
      navigate(found?.role === 'expert' ? '/dashboard' : '/advisor');
    }, 600);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{ background: 'var(--voneng-bg)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(22,163,74,0.08) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="text-green-400 font-bold text-2xl" style={{ fontFamily: 'Syne, sans-serif' }}>
            VONeng
          </Link>
          <p className="text-slate-500 text-sm mt-2">{t('login_subtitle2')}</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-white font-bold text-2xl mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            {t('login_title')}
          </h2>

          <div className="flex flex-col gap-4 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: 'white', color: '#1f2937', fontWeight: 'bold' }}
            >
              {googleLoading ? (
                <svg className="animate-spin w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              )}
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-700/50"></div>
              <div className="text-slate-500 text-sm font-medium">OR EMAIL</div>
              <div className="flex-1 h-px bg-slate-700/50"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-slate-400 text-sm font-medium mb-2 block">{t('login_email')}</label>
              <input
                className="input-field"
                type="email"
                placeholder="john@farm.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm font-medium mb-2 block">{t('login_password')}</label>
              <input
                className="input-field"
                type="password"
                placeholder={t('login_password')}
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('login_signing_in')}
                </>
              ) : t('login_button')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/advisor"
                className="p-4 rounded-xl text-center transition-all duration-200 hover:border-green-700"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-2xl mb-1">👨‍🌾</div>
                <div className="text-xs text-slate-400 font-medium">{t('login_farmer_advisor')}</div>
                <div className="text-xs text-slate-600 mt-1">{t('login_no_login')}</div>
              </Link>
              <div
                className="p-4 rounded-xl text-center"
                style={{ background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <div className="text-2xl mb-1">🔬</div>
                <div className="text-xs text-green-400 font-medium">{t('login_expert_dash')}</div>
                <div className="text-xs text-slate-600 mt-1">{t('login_requires_login')}</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          {t('login_no_account2')}{' '}
          <Link to="/signup" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            {t('login_sign_up2')}
          </Link>
        </p>
      </div>
    </div>
  );
}
