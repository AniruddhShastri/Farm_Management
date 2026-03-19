import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import logo from '../assets/logo.png';

/* ── Language Switcher Dropdown ── */
function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-green-900/20"
        style={{ border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:block">{current.nativeName}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 min-w-[160px]"
          style={{
            background: 'rgba(8,20,12,0.98)',
            border: '1px solid rgba(34,197,94,0.2)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            animation: 'dropIn 0.15s ease',
          }}
        >
          <style>{`
            @keyframes dropIn {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 text-left"
              style={{
                background: l.code === lang ? 'rgba(22,163,74,0.15)' : 'transparent',
                color: l.code === lang ? '#4ade80' : '#94a3b8',
                fontFamily: l.code === 'hi' ? "'Noto Sans Devanagari', sans-serif" : 'Inter, sans-serif',
              }}
              onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="text-lg leading-none">{l.flag}</span>
              <span>{l.nativeName}</span>
              {l.code === lang && (
                <svg className="w-3.5 h-3.5 ml-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Navbar ── */
export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const navLinks = [
    { labelKey: 'nav_about', href: '/#about' },
    { labelKey: 'nav_solution', href: '/#solution' },
    { labelKey: 'nav_team', href: '/#team' },
    { labelKey: 'nav_advisor', href: '/advisor' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(3, 10, 6, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(34,197,94,0.12)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="VONeng" className="h-8 w-auto" />
          <span className="text-white font-bold text-xl tracking-tight group-hover:text-green-400 transition-colors">
            VONeng
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a
              key={link.labelKey}
              href={link.href}
              className="text-slate-400 hover:text-green-400 text-sm font-medium transition-colors duration-200"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </div>

        {/* Right side: Language Switcher + Auth */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-green-400 font-medium hover:text-green-300 transition-colors">
                {user.name}
              </Link>
              <button onClick={logout} className="btn-secondary text-sm py-2 px-5">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-400 hover:text-white font-medium transition-colors">
                {t('nav_signin')}
              </Link>
              <Link to="/signup" className="btn-primary text-sm py-2.5 px-6">
                {t('nav_get_started')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <LanguageSwitcher />
          <button
            className="text-slate-400 hover:text-green-400 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-card mx-4 mb-4 p-6 rounded-2xl">
          <div className="flex flex-col gap-4">
            {navLinks.map(link => (
              <a
                key={link.labelKey}
                href={link.href}
                className="text-slate-300 hover:text-green-400 font-medium transition-colors"
              >
                {t(link.labelKey)}
              </a>
            ))}
            <div className="border-t border-green-900/50 pt-4 flex flex-col gap-3">
              {user ? (
                <button onClick={logout} className="btn-primary text-center">Sign Out</button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-center">{t('nav_signin')}</Link>
                  <Link to="/signup" className="btn-primary text-center">{t('nav_get_started')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
