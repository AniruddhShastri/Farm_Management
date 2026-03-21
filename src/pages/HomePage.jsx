import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

/* ─── Animated counter hook ─── */
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* ─── Intersection observer hook ─── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Stats (numbers only — labels are translated inline) ─── */
const stats = [
  { value: 237, suffix: ' t', prefix: '', labelKey: 'stat_co2' },
  { value: 100, suffix: '%', prefix: '', labelKey: 'stat_energy' },
  { value: 16700, suffix: '', prefix: '€', labelKey: 'stat_savings' },
  { value: 20, suffix: '+', prefix: '', labelKey: 'stat_locations' },
];

export default function HomePage() {
  const { t } = useLanguage();
  const [statsRef, statsInView] = useInView();

  /* ─── All translated content arrays (inside component so t() is available) ─── */
  const problems = [
    { icon: '⚡', titleKey: 'prob1_title', descKey: 'prob1_desc' },
    { icon: '🏭', titleKey: 'prob2_title', descKey: 'prob2_desc' },
    { icon: '🧪', titleKey: 'prob3_title', descKey: 'prob3_desc' },
    { icon: '📊', titleKey: 'prob4_title', descKey: 'prob4_desc' },
  ];

  const solutionSteps = [
    { step: '01', icon: '📦', titleKey: 'sol1_title', descKey: 'sol1_desc' },
    { step: '02', icon: '♻️', titleKey: 'sol2_title', descKey: 'sol2_desc' },
    { step: '03', icon: '☀️', titleKey: 'sol3_title', descKey: 'sol3_desc' },
    { step: '04', icon: '🤖', titleKey: 'sol4_title', descKey: 'sol4_desc' },
  ];

  const team = [
    { name: 'Aniruddh Shastri',            role: 'CEO',                      photo: '/team/Aniruddh.jpeg' },
    { name: 'Juan Camilo Quiroga Manrique', role: 'Supply Chain Lead',        photo: '/team/Juan.jpeg' },
    { name: 'Karthik Roshan Bharathraj',    role: 'Electrical Systems Lead',  photo: '/team/Karthik.jpeg' },
    { name: 'Leonardo Vicentini Bonatto',   role: 'Finance Lead',             photo: '/team/Leornado.jpeg' },
    { name: 'Tejan Sunil Shinde',           role: 'Mechanical Systems Lead',  photo: '/team/Tejan.jpeg' },
  ];

  const achievements = [
    { labelKey: 'ach1', year: '2024', icon: '🔬' },
    { labelKey: 'ach2', year: '2024', icon: '🌾' },
    { labelKey: 'ach3', year: '2025', icon: '🇪🇺' },
    { labelKey: 'ach4', year: '2025', icon: '🤖' },
  ];

  const visionMission = [
    { titleKey: 'vision_title', icon: '🌍', textKey: 'vision_text' },
    { titleKey: 'mission_title', icon: '🎯', textKey: 'mission_text' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--voneng-bg)' }}>

      {/* ═══════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(22,163,74,0.12) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
          <div className="tag mb-8 mx-auto w-fit">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block pulse-dot" />
            {t('hero_badge')}
          </div>

          <h1 className="font-bold mb-8"
            style={{ fontFamily: 'Syne, Inter, sans-serif', fontSize: 'clamp(2.8rem, 6vw, 5.2rem)', lineHeight: 1.18, letterSpacing: '-0.01em', paddingBottom: '0.1em', overflow: 'visible' }}>
            {t('hero_title_1')}{' '}
            <span className="gradient-text">{t('hero_title_2')}</span>
            <br />
            {t('hero_title_3')}
          </h1>


          <p className="text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/advisor" className="btn-primary text-base px-8 py-4">
              {t('hero_cta_primary')}
            </Link>
            <a href="#solution" className="btn-secondary text-base px-8 py-4">
              {t('hero_cta_secondary')}
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-16">
            {[
              { val: '100%', labelKey: 'hero_stat_2_label' },
              { val: '€16,700', labelKey: 'hero_stat_1_label' },
              { val: '237t', labelKey: 'hero_stat_3_label' },
            ].map(({ val, labelKey }) => (
              <div key={labelKey} className="glass-card px-6 py-3 flex items-center gap-3" style={{ borderRadius: '100px' }}>
                <span className="text-green-400 font-bold text-lg">{val}</span>
                <span className="text-slate-400 text-sm">{t(labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-slate-600 text-xs">Scroll</span>
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-16 border-y" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, suffix, prefix, labelKey }) => {
              const count = useCounter(value, 1800, statsInView);
              return (
                <div key={labelKey} className="text-center">
                  <div className="gradient-text font-bold mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Syne, sans-serif' }}>
                    {prefix}{statsInView ? count.toLocaleString() : 0}{suffix}
                  </div>
                  <div className="text-slate-500 text-sm leading-snug">{t(labelKey)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT / VISION / MISSION
      ═══════════════════════════════════════════════════════ */}
      <section id="about" className="py-28 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="tag mb-6">{t('mission_badge')}</div>
            <h2 className="font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {t('about_title_1')}{' '}
              <span className="gradient-text">{t('about_title_2')}</span>
            </h2>
            <p className="text-slate-400 leading-relaxed text-lg mb-6">{t('about_p1')}</p>
            <p className="text-slate-400 leading-relaxed text-lg">{t('about_p2')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {visionMission.map(({ titleKey, icon, textKey }) => (
              <div key={titleKey} className="glass-card-hover p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="text-white font-bold text-lg">{t(titleKey)}</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">{t(textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PROBLEM
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28" style={{ background: 'rgba(10,26,15,0.5)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="tag mb-6 mx-auto w-fit" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }}>
              {t('section_problem')}
            </div>
            <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', letterSpacing: '-0.02em' }}>
              {t('problem_title_1')}
              <span style={{ color: '#f87171' }}> {t('problem_title_2')}</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">{t('problem_subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map(({ icon, titleKey, descKey }) => (
              <div key={titleKey} className="glass-card-hover p-6">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-white font-bold text-lg mb-3">{t(titleKey)}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SOLUTION
      ═══════════════════════════════════════════════════════ */}
      <section id="solution" className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="tag mb-6 mx-auto w-fit">{t('section_solution')}</div>
          <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', letterSpacing: '-0.02em' }}>
            {t('solution_title')}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">{t('solution_subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {solutionSteps.map(({ step, titleKey, descKey, icon }) => (
            <div key={step} className="glass-card-hover p-8 flex gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}>
                {icon}
              </div>
              <div>
                <div className="text-green-600 text-xs font-bold tracking-widest mb-2">STEP {step}</div>
                <h3 className="text-white font-bold text-xl mb-3">{t(titleKey)}</h3>
                <p className="text-slate-400 leading-relaxed">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="glass-card p-10 max-w-3xl mx-auto glow-border">
            <h3 className="font-bold text-2xl mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              {t('sol_cta_title')}
            </h3>
            <p className="text-slate-400 mb-8">{t('sol_cta_desc')}</p>
            <Link to="/advisor" className="btn-primary text-base px-10 py-4 inline-block">
              {t('hero_cta_primary')}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ACHIEVEMENTS
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: 'rgba(10,26,15,0.5)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="tag mb-6 mx-auto w-fit">{t('milestones_badge')}</div>
            <h2 className="font-bold text-3xl" style={{ fontFamily: 'Syne, sans-serif' }}>
              {t('milestones_title')}
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {achievements.map(({ labelKey, year, icon }) => (
              <div key={labelKey} className="glass-card-hover px-6 py-4 flex items-center gap-4">
                <span className="text-2xl">{icon}</span>
                <div>
                  <div className="text-white font-semibold text-sm">{t(labelKey)}</div>
                  <div className="text-green-500 text-xs font-bold">{year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TEAM
      ═══════════════════════════════════════════════════════ */}
      <section id="team" className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="tag mb-6 mx-auto w-fit">{t('section_team')}</div>
          <h2 className="font-bold text-4xl mb-4" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
            {t('team_title')}
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">{t('team_subtitle')}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {team.map(({ name, role, photo }) => (
            <div key={name} className="glass-card-hover p-6 text-center flex flex-col items-center"
              style={{ width: 'clamp(160px, 18vw, 200px)' }}>
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-5 border-2 border-green-500/30 shadow-lg">
                <img
                  src={photo}
                  alt={name}
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(100%)', WebkitFilter: 'grayscale(100%)' }}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentNode.style.background = 'rgba(22,163,74,0.15)';
                    e.target.parentNode.innerHTML = `<span style="font-size:1.5rem;font-weight:700;color:#22c55e;line-height:6rem">${name.split(' ').map(w=>w[0]).join('').slice(0,2)}</span>`;
                  }}
                />
              </div>
              <h3 className="text-white font-bold text-sm mb-1 leading-snug">{name}</h3>
              <div className="text-green-500 text-xs font-semibold">{role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER CTA
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28" style={{ background: 'rgba(10,26,15,0.6)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.02em' }}>
            {t('footer_cta_title_1')} <span className="gradient-text">{t('footer_cta_title_2')}</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">{t('footer_cta_body')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/advisor" className="btn-primary text-base px-10 py-4">{t('footer_cta_button')}</Link>
            <Link to="/signup" className="btn-secondary text-base px-10 py-4">{t('footer_create_account')}</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-slate-600 text-sm">© 2025 VONeng. {t('footer_rights')}</span>
          <div className="flex gap-6 text-sm text-slate-600">
            <a href="#about" className="hover:text-green-400 transition-colors">{t('nav_about')}</a>
            <a href="#solution" className="hover:text-green-400 transition-colors">{t('nav_solution')}</a>
            <Link to="/advisor" className="hover:text-green-400 transition-colors">{t('nav_advisor')}</Link>
            <Link to="/login" className="hover:text-green-400 transition-colors">{t('footer_expert_access')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
