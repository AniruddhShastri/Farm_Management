import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Counter,
  Reveal,
  StaggerGroup,
  StaggerItem,
  fadeUp,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
} from '../components/motion';

/* ─── Stats — 100 ha test-farm model (labels are translated inline) ─── */
const stats = [
  { value: 57796, suffix: '', prefix: '€', labelKey: 'stat_savings' },
  { value: 100, suffix: '%', prefix: '~', labelKey: 'stat_energy' },
  { value: 156, suffix: ' t', prefix: '', labelKey: 'stat_co2' },
  { value: 7, suffix: ' yr', prefix: '~', labelKey: 'stat_payback' },
];

/* ─── System spec highlights (100 ha model) ─── */
const systemSpecs = ['50 kWp Solar', '120 m³ Digester', '150 kWh BESS', '~95,400 kWh/yr'];
const financials = ['CAPEX €265,000', 'NPV €276k @ 6%', 'IRR 17%', '~7-yr payback'];

/* ─── One animated stat (own component: hooks can't live in .map) ─── */
function StatItem({ value, prefix, suffix, label }) {
  return (
    <StaggerItem className="text-center">
      <div className="gradient-text font-bold mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
        <Counter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="text-mist text-sm leading-snug">{label}</div>
    </StaggerItem>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { scrollY } = useScroll();
  const gridY = useTransform(scrollY, [0, 600], [0, 80]);
  const cueOpacity = useTransform(scrollY, [0, 120], [1, 0]);

  // Hide "Create Expert Account" if the authenticated user is already an expert
  const isExpert = !loading && user?.role === 'expert';

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
    { name: 'Aniruddh Shastri',            role: 'CEO',                      photo: '/team/Aniruddh.jpeg',  linkedin: 'https://www.linkedin.com/in/shastrianiruddh/' },
    { name: 'Juan Camilo Quiroga Manrique', role: 'Supply Chain Lead',        photo: '/team/Juan.jpeg',      linkedin: 'https://www.linkedin.com/in/juan-camilo-quiroga-manrique-9b1aab1b4/' },
    { name: 'Karthik Roshan Bharathraj',    role: 'Electrical Systems Lead',  photo: '/team/Karthik.jpeg',   linkedin: 'https://www.linkedin.com/in/karthikroshanbharathraj151850230/' },
    { name: 'Leonardo Vicentini Bonatto',   role: 'Finance Lead',             photo: '/team/Leornado.jpeg',  linkedin: 'https://www.linkedin.com/in/leonardobonatto/' },
    { name: 'Tejan Sunil Shinde',           role: 'Mechanical Systems Lead',  photo: '/team/Tejan.jpeg',     linkedin: 'https://www.linkedin.com/in/tejanshinde/' },
  ];

  const roadmap = [
    {
      phase: '01', name: 'Engineering\n& Research', color: '#22c55e',
      hw: ['CAD models for MVP', 'Thermal management', 'IoT sensor selection'],
      sw: ['Data architecture mapping', 'CSRD compliance frameworks'],
    },
    {
      phase: '02', name: 'MVP Assembly\n& Testing', color: '#16a34a',
      hw: ['First functional prototype', 'System-wide stress testing'],
      sw: ['MVP dashboard build', 'Cloud-to-edge data comms'],
    },
    {
      phase: '03', name: 'Pilot\nDeployment', color: '#15803d',
      hw: ['Full-scale container assembly', 'Real-world farm operations'],
      sw: ['Edge computing optimisation', 'Initial CSRD report extraction'],
    },
    {
      phase: '04', name: 'Corporate\nIntegration', color: '#166534',
      hw: ['Fleet of 3–5 units', 'Global safety certifications'],
      sw: ['Corporate ESG Portal launch', 'Verified Scope 3 data'],
    },
    {
      phase: '05', name: 'Commercial\nScaling', color: '#14532d',
      hw: ['Contract manufacturing', 'Mass-production logistics'],
      sw: ['Predictive analytics platform', 'Full commercial rollout'],
    },
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
        <motion.div
          aria-hidden
          className="absolute pointer-events-none opacity-10"
          style={{
            inset: '-100px 0 0 0',
            y: gridY,
            backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

        {/* Floating ambient orbs */}
        <motion.div
          aria-hidden
          className="absolute pointer-events-none rounded-full"
          style={{ width: 420, height: 420, top: '8%', left: '-6%', background: 'rgba(34,197,94,0.16)', filter: 'blur(120px)' }}
          animate={{ y: [0, 36, 0], x: [0, 22, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute pointer-events-none rounded-full"
          style={{ width: 360, height: 360, bottom: '4%', right: '-4%', background: 'rgba(217,164,65,0.10)', filter: 'blur(120px)' }}
          animate={{ y: [0, -30, 0], x: [0, -18, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center"
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="tag mb-8 mx-auto w-fit">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block pulse-dot" />
            {t('hero_badge')}
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-bold mb-8"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 6vw, 5.2rem)', lineHeight: 1.18, letterSpacing: '-0.01em', paddingBottom: '0.1em', overflow: 'visible' }}>
            {t('hero_title_1')}{' '}
            <span className="gradient-text">{t('hero_title_2')}</span>
            <br />
            {t('hero_title_3')}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-mist max-w-2xl mx-auto mb-12 leading-relaxed" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
            {t('hero_subtitle')}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/advisor" className="btn-primary text-base px-8 py-4">
              {t('hero_cta_primary')}
            </Link>
            <a href="#solution" className="btn-secondary text-base px-8 py-4">
              {t('hero_cta_secondary')}
            </a>
          </motion.div>

          <motion.div variants={staggerContainer(0.08)} className="flex flex-wrap justify-center gap-4 mt-16">
            {[
              { val: '~100%', labelKey: 'hero_stat_2_label' },
              { val: '€57,796', labelKey: 'hero_stat_1_label' },
              { val: '156 t', labelKey: 'hero_stat_3_label' },
            ].map(({ val, labelKey }) => (
              <motion.div key={labelKey} variants={scaleIn} className="glass-card px-6 py-3 flex items-center gap-3" style={{ borderRadius: 'var(--radius-pill)' }}>
                <span className="stat-number text-green-400 font-bold text-lg">{val}</span>
                <span className="text-mist text-sm">{t(labelKey)}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.p variants={fadeUp} className="text-mist-dim text-xs mt-6 tracking-wide">
            {t('hero_model_badge')}
          </motion.p>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: cueOpacity }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-mist-dim text-xs">Scroll</span>
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR — 100 ha test-farm model
      ═══════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="divider-fade" />
        <div className="max-w-7xl mx-auto px-6 pt-16">
          <StaggerGroup stagger={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, suffix, prefix, labelKey }) => (
              <StatItem key={labelKey} value={value} prefix={prefix} suffix={suffix} label={t(labelKey)} />
            ))}
          </StaggerGroup>
          <Reveal className="text-center mt-10">
            <span className="tag tag-accent">{t('stats_model_caption')}</span>
          </Reveal>
        </div>
        <div className="divider-fade mt-16" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT / VISION / MISSION
      ═══════════════════════════════════════════════════════ */}
      <section id="about" className="py-28 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <Reveal variants={slideInLeft}>
            <div className="tag mb-6">{t('mission_badge')}</div>
            <h2 className="font-bold mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {t('about_title_1')}{' '}
              <span className="gradient-text">{t('about_title_2')}</span>
            </h2>
            <p className="text-mist leading-relaxed text-lg mb-6">{t('about_p1')}</p>
            <p className="text-mist leading-relaxed text-lg">{t('about_p2')}</p>
          </Reveal>

          <StaggerGroup stagger={0.12} className="grid grid-cols-1 gap-4">
            {visionMission.map(({ titleKey, icon, textKey }) => (
              <StaggerItem key={titleKey} variants={slideInRight}>
                <motion.div whileHover={{ y: -4 }} className="glass-card p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: 'var(--voneng-accent-soft)', border: '1px solid var(--voneng-accent-border)' }}>
                      {icon}
                    </span>
                    <h3 className="text-white font-bold text-lg">{t(titleKey)}</h3>
                  </div>
                  <p className="text-mist leading-relaxed">{t(textKey)}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PROBLEM
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28" style={{ background: 'rgba(11,27,17,0.5)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <div className="tag mb-6 mx-auto w-fit" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }}>
              {t('section_problem')}
            </div>
            <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', letterSpacing: '-0.02em' }}>
              {t('problem_title_1')}
              <span style={{ color: '#f87171' }}> {t('problem_title_2')}</span>
            </h2>
            <p className="text-mist max-w-2xl mx-auto text-lg">{t('problem_subtitle')}</p>
          </Reveal>
          <StaggerGroup stagger={0.09} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map(({ icon, titleKey, descKey }) => (
              <StaggerItem key={titleKey}>
                <motion.div whileHover={{ y: -6 }} className="glass-card p-6 h-full"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                  <div className="text-4xl mb-4">{icon}</div>
                  <h3 className="text-white font-bold text-lg mb-3">{t(titleKey)}</h3>
                  <p className="text-mist text-sm leading-relaxed">{t(descKey)}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SOLUTION
      ═══════════════════════════════════════════════════════ */}
      <section id="solution" className="py-28 max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="tag mb-6 mx-auto w-fit">{t('section_solution')}</div>
          <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', letterSpacing: '-0.02em' }}>
            {t('solution_title')}
          </h2>
          <p className="text-mist max-w-2xl mx-auto text-lg">{t('solution_subtitle')}</p>
        </Reveal>

        {/* Product Visual */}
        <Reveal variants={scaleIn} className="mb-8 relative rounded-3xl overflow-hidden shadow-2xl group" style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
          <motion.img
            src="/team/Product Visuals.png" alt="VONeng Container System"
            className="w-full object-cover max-h-[480px]" style={{ objectPosition: 'center' }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between pointer-events-none">
            <div>
              <div className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">The VONeng System</div>
              <p className="text-white font-bold text-lg leading-snug">Complete energy independence<br />in a single shipping container</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {['Solar PV', 'Biogas Digester', 'Micro-CHP', 'BESS', 'Smart Controls'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(22,163,74,0.25)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80' }}>{tag}</span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* System spec strip — 100 ha model */}
        <StaggerGroup stagger={0.07} className="flex flex-wrap justify-center gap-3 mb-14">
          {systemSpecs.map(spec => (
            <StaggerItem key={spec} variants={scaleIn} as="span"
              className="stat-number px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: 'var(--voneng-accent-soft)', border: '1px solid var(--voneng-accent-border)', color: 'var(--voneng-accent)' }}>
              {spec}
            </StaggerItem>
          ))}
        </StaggerGroup>

        <StaggerGroup stagger={0.1} className="grid md:grid-cols-2 gap-6">
          {solutionSteps.map(({ step, titleKey, descKey, icon }) => (
            <StaggerItem key={step}>
              <motion.div whileHover={{ y: -5 }} className="glass-card p-8 flex gap-6 h-full"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  {icon}
                </div>
                <div>
                  <div className="stat-number text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--voneng-accent)' }}>STEP {step}</div>
                  <h3 className="text-white font-bold text-xl mb-3">{t(titleKey)}</h3>
                  <p className="text-mist leading-relaxed">{t(descKey)}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-16 text-center">
          <div className="glass-card p-10 max-w-3xl mx-auto glow-border">
            <h3 className="font-bold text-2xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              {t('sol_cta_title')}
            </h3>
            <p className="text-mist mb-6">{t('sol_cta_desc')}</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
              {financials.map(item => (
                <span key={item} className="stat-number text-sm" style={{ color: 'var(--voneng-muted)' }}>
                  {item}
                </span>
              ))}
            </div>
            <Link to="/advisor" className="btn-primary text-base px-10 py-4 inline-block">
              {t('hero_cta_primary')}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ROADMAP
      ═══════════════════════════════════════════════════════ */}
      <section id="roadmap" className="py-28 overflow-hidden" style={{ background: 'rgba(11,27,17,0.5)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <div className="tag mb-6 mx-auto w-fit">Product Roadmap</div>
            <h2 className="font-bold text-3xl mb-3" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Deployment &amp; Development Roadmap
            </h2>
          </Reveal>

          {/* Timeline */}
          <div className="relative">
            {/* Connector line grows across the phase circles on desktop */}
            <motion.div
              aria-hidden
              className="hidden lg:block absolute left-[10%] right-[10%] h-[2px] origin-left"
              style={{ top: 27, background: 'linear-gradient(90deg, #22c55e, #14532d)' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <StaggerGroup stagger={0.12} className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4">
              {roadmap.map(({ phase, name, color, hw, sw }) => (
                <StaggerItem key={phase} variants={scaleIn} className="flex flex-col items-center relative">
                  {/* Phase circle */}
                  <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-5 flex-shrink-0 shadow-lg"
                    style={{ background: `radial-gradient(circle, ${color}40, ${color}20)`, border: `2px solid ${color}`, backgroundColor: 'var(--voneng-bg)' }}>
                    <span className="stat-number font-black text-lg" style={{ color }}>{phase}</span>
                  </div>

                  {/* Card */}
                  <motion.div whileHover={{ y: -4 }} className="w-full glass-card rounded-2xl p-4 flex flex-col gap-3 flex-1"
                    style={{ borderColor: `${color}25` }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                    <h3 className="font-black text-white text-sm leading-tight whitespace-pre-line">{name}</h3>

                    {/* Hardware */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">🔧</span>
                        <span className="text-[10px] font-black text-mist-dim uppercase tracking-widest">Hardware</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {hw.map(item => (
                          <div key={item} className="px-2 py-1 rounded-lg text-[10px] font-semibold text-green-300 leading-snug"
                            style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Software */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">💻</span>
                        <span className="text-[10px] font-black text-mist-dim uppercase tracking-widest">Software</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {sw.map(item => (
                          <div key={item} className="px-2 py-1 rounded-lg text-[10px] font-semibold text-blue-300 leading-snug"
                            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(99,179,237,0.15)' }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerGroup>

            {/* Legend */}
            <Reveal className="flex justify-center gap-6 mt-10">
              <div className="flex items-center gap-2 text-xs text-mist-dim">
                <span className="w-3 h-3 rounded" style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(34,197,94,0.3)' }} />
                🔧 Hardware milestones
              </div>
              <div className="flex items-center gap-2 text-xs text-mist-dim">
                <span className="w-3 h-3 rounded" style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(99,179,237,0.3)' }} />
                💻 Software milestones
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TEAM
      ═══════════════════════════════════════════════════════ */}
      <section id="team" className="py-28 max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="tag mb-6 mx-auto w-fit">{t('section_team')}</div>
          <h2 className="font-bold text-4xl mb-4" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            {t('team_title')}
          </h2>
          <p className="text-mist max-w-xl mx-auto text-lg">{t('team_subtitle')}</p>
        </Reveal>
        <StaggerGroup stagger={0.08} className="flex flex-wrap justify-center gap-6">
          {team.map(({ name, role, photo, linkedin }) => (
            <StaggerItem key={name}>
              <motion.div whileHover={{ y: -6 }} className="team-card glass-card p-6 text-center flex flex-col items-center h-full"
                style={{ width: 'clamp(160px, 18vw, 200px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="team-photo w-24 h-24 rounded-full overflow-hidden mx-auto mb-5 border-2 border-green-500/30 shadow-lg transition-colors duration-300">
                  <img
                    src={photo}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = 'rgba(22,163,74,0.15)';
                      e.target.parentNode.innerHTML = `<span style="font-size:1.5rem;font-weight:700;color:#22c55e;line-height:6rem">${name.split(' ').map(w=>w[0]).join('').slice(0,2)}</span>`;
                    }}
                  />
                </div>
                <h3 className="text-white font-bold text-sm mb-1 leading-snug">{name}</h3>
                <div className="text-green-500 text-xs font-semibold mb-3">{role}</div>
                <a href={linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                  style={{ background: 'rgba(10,102,194,0.15)', border: '1px solid rgba(10,102,194,0.35)', color: '#7eb3f5' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER CTA
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28" style={{ background: 'rgba(11,27,17,0.6)' }}>
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-bold mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.02em' }}>
            {t('footer_cta_title_1')} <span className="gradient-text">{t('footer_cta_title_2')}</span>
          </h2>
          <p className="text-mist text-lg mb-10 max-w-2xl mx-auto">{t('footer_cta_body')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/advisor" className="btn-primary text-base px-10 py-4">{t('footer_cta_button')}</Link>
            {!isExpert && (
              <Link to="/signup" className="btn-secondary text-base px-10 py-4">{t('footer_create_account')}</Link>
            )}
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t" style={{ borderColor: 'var(--voneng-border)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-mist-dim text-sm">© 2025 VONeng. {t('footer_rights')}</span>
          <div className="flex gap-6 text-sm text-mist-dim">
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
