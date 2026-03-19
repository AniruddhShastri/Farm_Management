import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

/* ── Step indicator ── */
function StepDot({ n, current }) {
  const done = current > n;
  const active = current === n;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
        style={{
          background: done ? '#16a34a' : active ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.05)',
          border: active ? '2px solid #22c55e' : done ? '2px solid #16a34a' : '2px solid rgba(255,255,255,0.1)',
          color: done || active ? '#4ade80' : '#64748b',
        }}
      >
        {done ? '✓' : n}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { sendOTP, verifyOTP, signup, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'farmer' });
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);
    const result = await loginWithGoogle(form.role); 
    setGoogleLoading(false);
    if (!result.success) return setError(result.error);
    navigate(form.role === 'farmer' ? '/advisor' : '/dashboard'); 
  }

  const ROLES = [
    { value: 'farmer', label: t('signup_role_farmer'), desc: t('signup_role_farmer_desc') },
    { value: 'expert', label: t('signup_role_expert'), desc: t('signup_role_expert_desc') },
  ];

  function set(field) {
    return (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  }

  /* ── Step 1: details form ── */
  function handleStep1(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!form.email.includes('@')) return setError('Please enter a valid email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setStep(2);
  }

  /* ── Step 2: send OTP ── */
  function handleSendOTP() {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const code = sendOTP(form.email);
      setDevOtp(code);
      setLoading(false);
      setStep(3);
    }, 800);
  }

  /* ── Step 3: verify OTP and create account ── */
  function handleVerify(e) {
    e.preventDefault();
    setError('');
    const result = verifyOTP(form.email, otp);
    if (!result.success) return setError(result.error);
    const created = signup({ name: form.name, email: form.email, password: form.password, role: form.role });
    if (!created.success) return setError(created.error);
    navigate(form.role === 'farmer' ? '/advisor' : '/dashboard');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{ background: 'var(--voneng-bg)' }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(22,163,74,0.08) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-green-400 font-bold text-2xl" style={{ fontFamily: 'Syne, sans-serif' }}>
            VONeng
          </Link>
          <p className="text-slate-500 text-sm mt-2">{t('signup_create_account')}</p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map(n => (
            <React.Fragment key={n}>
              <StepDot n={n} current={step} />
              {n < 3 && <div className="h-px w-12" style={{ background: step > n ? '#16a34a' : 'rgba(255,255,255,0.1)' }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="glass-card p-8">
          {/* ── STEP 1: Account details ── */}
          {step === 1 && (
            <form onSubmit={handleStep1}>
              <h2 className="text-white font-bold text-2xl mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
                {t('signup_create_account')}
              </h2>

              {/* Role selector */}
              <div className="mb-6">
                <label className="text-slate-400 text-sm font-medium mb-3 block">{t('signup_iam')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(({ value, label, desc }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setForm(p => ({ ...p, role: value }))}
                      className="p-4 rounded-xl text-left transition-all duration-200"
                      style={{
                        background: form.role === value ? 'rgba(22,163,74,0.15)' : 'rgba(255,255,255,0.03)',
                        border: form.role === value ? '1.5px solid rgba(34,197,94,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="text-sm font-semibold text-white mb-1">{label}</div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

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

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-slate-400 text-sm font-medium mb-2 block">{t('signup_full_name')}</label>
                  <input className="input-field" placeholder="John Smith" value={form.name} onChange={set('name')} />
                </div>
                <div>
                  <label className="text-slate-400 text-sm font-medium mb-2 block">{t('signup_email')}</label>
                  <input className="input-field" type="email" placeholder="john@farm.com" value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className="text-slate-400 text-sm font-medium mb-2 block">{t('signup_password')}</label>
                  <input className="input-field" type="password" placeholder={t('signup_password_hint')} value={form.password} onChange={set('password')} />
                </div>
                <div>
                  <label className="text-slate-400 text-sm font-medium mb-2 block">{t('signup_confirm_password')}</label>
                  <input className="input-field" type="password" placeholder={t('signup_confirm_hint')} value={form.confirm} onChange={set('confirm')} />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mt-4 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>{error}</p>}

              <button type="submit" className="btn-primary w-full mt-6">
                {t('signup_continue')}
              </button>
            </form>
          )}

          {/* ── STEP 2: Review and send OTP ── */}
          {step === 2 && (
            <div>
              <h2 className="text-white font-bold text-2xl mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                {t('signup_verify_email')}
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {t('signup_code_sent_to')}{' '}
                <span className="text-green-400 font-semibold">{form.email}</span>
              </p>
              <div className="glass-card p-4 mb-6">
                <div className="text-slate-400 text-sm">{t('signup_account_type')}</div>
                <div className="text-white font-semibold capitalize">
                  {form.role === 'expert' ? t('signup_role_expert') : t('signup_role_farmer')}
                </div>
                <div className="text-slate-400 text-sm mt-2">{t('signup_full_name')}</div>
                <div className="text-white font-semibold">{form.name}</div>
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('signup_sending')}
                  </>
                ) : t('signup_send_code')}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-center text-slate-500 text-sm mt-4 hover:text-slate-300 transition-colors">
                {t('signup_go_back')}
              </button>
            </div>
          )}

          {/* ── STEP 3: Enter OTP ── */}
          {step === 3 && (
            <form onSubmit={handleVerify}>
              <h2 className="text-white font-bold text-2xl mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                {t('signup_enter_code')}
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {t('signup_code_sent')}{' '}
                <span className="text-green-400 font-semibold">{form.email}</span>
              </p>

              {/* Dev mode OTP display */}
              {devOtp && (
                <div className="mb-4 p-3 rounded-lg text-xs font-mono" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', color: '#fbbf24' }}>
                  Dev mode: your OTP is <strong>{devOtp}</strong>
                  <div className="text-yellow-600 mt-1">This banner only appears in development</div>
                </div>
              )}

              <div className="mb-6">
                <label className="text-slate-400 text-sm font-medium mb-2 block">{t('signup_verification_code')}</label>
                <input
                  className="input-field text-center text-2xl tracking-widest font-bold"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {error && <p className="text-red-400 text-sm mb-4 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>{error}</p>}

              <button type="submit" className="btn-primary w-full">
                {t('signup_verify_create')}
              </button>
              <button
                type="button"
                onClick={() => { setStep(2); setOtp(''); setError(''); }}
                className="w-full text-center text-slate-500 text-sm mt-4 hover:text-slate-300 transition-colors"
              >
                {t('signup_resend')}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          {t('signup_already_account')}{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            {t('signup_sign_in')}
          </Link>
        </p>
      </div>
    </div>
  );
}
