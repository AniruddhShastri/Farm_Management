import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AIChatPanel from '../components/AIChatPanel';
import locationData from '../../locationData.json';
import {
  getBiogasEnergy,
  getBiogasAnnualM3,
  getCappedBiogasAnnualM3,
  getSolarEnergy,
  getCarbonImpact,
  getCO2Avoided,
  getFinancials,
  getEnergyRequirement,
  getDigestateLiters,
  getDigestateSavingsEur,
  getMethaneSavingsCo2e,
} from '../utils/calculator';

const locationOptions = Object.keys(locationData.locations);

const CROP_LABELS = {
  wheat: 'Wheat', barley: 'Barley', corn: 'Corn', oats: 'Oats',
  rye: 'Rye', potatoes: 'Potatoes', rapeseed: 'Rapeseed', sugar_beet: 'Sugar Beet',
  sunflower: 'Sunflower', olives: 'Olives', grapes: 'Grapes', tomatoes: 'Tomatoes',
  rice: 'Rice', soy: 'Soy', onions: 'Onions', cotton: 'Cotton', grass: 'Grass',
};

/* ── Small helpers ── */
function ResultBlock({ icon, title, color, children }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: `rgba(${color},0.06)`, border: `1px solid rgba(${color},0.2)` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`font-semibold text-sm ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function Question({ number, question, children }) {
  return (
    <div className="flex gap-4">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-1"
        style={{ background: 'rgba(22,163,74,0.2)', border: '1.5px solid rgba(34,197,94,0.4)', color: '#4ade80' }}
      >
        {number}
      </div>
      <div className="flex-1">
        <label className="text-white font-semibold text-sm mb-3 block">{question}</label>
        {children}
      </div>
    </div>
  );
}

/* ── Contact form field wrapper ── */
function Field({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-slate-400 text-sm font-medium mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ── Contact form component ── */
function ContactForm({ user }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    country: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  function set(field) {
    return (e) => {
      setForm(p => ({ ...p, [field]: e.target.value }));
      if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
    };
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email (e.g. user@example.com).';
    const digits = form.phone.replace(/[\s\-\+\(\)]/g, '');
    if (!/^\d{7,15}$/.test(digits)) errs.phone = 'Enter a valid phone number (7–15 digits, numbers only).';
    if (!form.message.trim()) errs.message = 'Please write a message.';
    return errs;
  }

  function buildMessage() {
    return [
      `Hi VONeng Team!`,
      ``,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      form.address ? `Address: ${form.address}` : null,
      form.country ? `Country: ${form.country}` : null,
      ``,
      `Message:`,
      form.message,
    ].filter(l => l !== null).join('\n');
  }

  function handleWhatsApp() {
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);
    setErrors({});
    window.open(`https://wa.me/34647039675?text=${encodeURIComponent(buildMessage())}`, '_blank');
  }

  function handleEmail() {
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);
    setErrors({});
    const subject = encodeURIComponent(`VONeng Farm Inquiry – ${form.name}`);
    window.open(
      `mailto:Aniruddh.shastri.751@gmail.com?subject=${subject}&body=${encodeURIComponent(buildMessage())}`,
      '_blank'
    );
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *" error={errors.name}>
          <input className="input-field" value={form.name} onChange={set('name')} placeholder="John Smith" />
        </Field>
        <Field label="Email Address *" error={errors.email}>
          <input className="input-field" type="email" value={form.email} onChange={set('email')} placeholder="john@farm.com" />
        </Field>
        <Field label="Phone Number *" error={errors.phone}>
          <input className="input-field" value={form.phone} onChange={set('phone')} placeholder="+34 600 000 000" />
        </Field>
        <Field label="Country" error={errors.country}>
          <input className="input-field" value={form.country} onChange={set('country')} placeholder="Spain" />
        </Field>
      </div>

      <Field label="Farm Address (optional)" error={errors.address}>
        <input className="input-field" value={form.address} onChange={set('address')} placeholder="Street, City, Region" />
      </Field>

      <Field label="Message *" error={errors.message}>
        <textarea
          className="input-field"
          rows={4}
          value={form.message}
          onChange={set('message')}
          placeholder="Tell us about your farm — number of animals, crops, goals, and what you're looking for..."
          style={{ resize: 'vertical' }}
        />
      </Field>

      <p className="text-slate-600 text-xs">* Required fields</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="btn-primary flex items-center justify-center gap-2 py-3"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>
        <button
          type="button"
          onClick={handleEmail}
          className="btn-secondary flex items-center justify-center gap-2 py-3"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Send Email
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function AdvisorPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const contactRef = useRef(null);
  const apiKey = true; // API key is handled server-side via /api/gemini

  const [location, setLocation] = useState('Madrid, Spain');
  const [cows, setCows] = useState('');
  const [pigs, setPigs] = useState('');
  const [chickens, setChickens] = useState('');
  const [crops, setCrops] = useState({});
  const [roofArea, setRoofArea] = useState('');
  const [solarArea, setSolarArea] = useState('');
  const [results, setResults] = useState(null);
  const [inputError, setInputError] = useState('');

  const locationInfo = locationData.locations[location];
  const availableCrops = locationInfo?.crops || [];

  // At least one real input must be provided before calculating
  const hasAnyInput =
    parseInt(cows) > 0 ||
    parseInt(pigs) > 0 ||
    parseInt(chickens) > 0 ||
    parseFloat(roofArea) > 0 ||
    parseFloat(solarArea) > 0 ||
    Object.values(crops).some(d => parseFloat(d.ha) > 0);

  // Auto-reveal contact section when user returns from signup/login
  useEffect(() => {
    if (user && sessionStorage.getItem('voneng_show_contact') === 'true') {
      sessionStorage.removeItem('voneng_show_contact');
      setShowContact(true);
      setTimeout(() => contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  }, [user]);

  function scrollToContact() {
    setShowContact(true);
    setTimeout(() => contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  function handleContactRedirect() {
    sessionStorage.setItem('voneng_show_contact', 'true');
    navigate('/signup');
  }

  function handleCropHa(crop, val) {
    setCrops(p => ({ ...p, [crop]: { ...(p[crop] || { cycles: 1 }), ha: val } }));
    setInputError('');
  }
  function handleCropCycles(crop, val) {
    setCrops(prev => {
      const next = { ...prev, [crop]: { ...(prev[crop] || { ha: '' }), cycles: val } };
      const totalCycles = Object.values(next).reduce((sum, d) => sum + (parseInt(d.cycles) || 1), 0);
      if (totalCycles > 3) return prev;
      return next;
    });
  }

  function calculate(e) {
    e.preventDefault();
    if (!hasAnyInput) {
      setInputError('Please enter at least one value — animals, crops, or solar/roof area — before calculating.');
      return;
    }
    setInputError('');
    setLoading(true);
    setTimeout(() => {
      const numCows = parseInt(cows) || 0;
      const numPigs = parseInt(pigs) || 0;
      const numChickens = parseInt(chickens) || 0;
      // No default fallback — if user entered nothing, solar generation is 0
      const solarM2 = parseFloat(solarArea) || parseFloat(roofArea) * 0.7 || 0;
      const roofM2 = parseFloat(roofArea) || 0;

      const loc = locationData.locations[location];
      const solarIrr = loc?.solar_irradiance_kwh_m2_day || 4.5;
      const winterTemp = loc?.winter_temperature_min_c ?? 5;
      const rainfall = loc?.annual_rainfall_mm || 600;

      const cropFlat = {};
      const cropEffective = {};
      let totalHa = 0;
      Object.entries(crops).forEach(([crop, data]) => {
        const ha = parseFloat(data.ha) || 0;
        const cycles = parseInt(data.cycles) || 1;
        if (ha > 0) {
          cropFlat[crop] = ha;
          cropEffective[crop] = ha * cycles;
          totalHa += ha;
        }
      });

      const solarGen = solarM2 * solarIrr * 0.20 * 365;
      const biogasGen = getBiogasEnergy(numCows, numPigs, numChickens, winterTemp);
      const totalGen = solarGen + biogasGen;
      const energyReq = getEnergyRequirement(numCows, numPigs, numChickens, cropFlat);

      const elecPrice = loc?.electricity_price_eur || 0.20;
      const elecSavings = Math.min(totalGen, energyReq) * elecPrice;

      const gridCO2 = loc?.grid_co2_kg_per_kwh || 0.25;
      const co2Avoided = (Math.min(totalGen, energyReq) * gridCO2) / 1000;

      const carbonImpact = getCarbonImpact(cropEffective);
      const annualBiogasM3 = getCappedBiogasAnnualM3(numCows, numPigs, numChickens);
      const methaneSaved = getMethaneSavingsCo2e(annualBiogasM3, 'open_lagoon');
      const totalCarbonOffset = co2Avoided + carbonImpact + methaneSaved;

      const digestateLiters = getDigestateLiters(annualBiogasM3);
      const digestateSavings = getDigestateSavingsEur(annualBiogasM3);

      const waterHarvest = roofM2 > 0 ? roofM2 * (rainfall / 1000) * 0.85 * 1000 : 0;
      const carbonCredits = totalCarbonOffset * 65;
      const baselineElec = energyReq * elecPrice;
      const fertCost = totalHa * 300;

      const r = {
        location, numCows, numPigs, numChickens,
        solarGen: Math.round(solarGen),
        biogasGen: Math.round(biogasGen),
        totalGen: Math.round(totalGen),
        energyReq: Math.round(energyReq),
        elecSavings: Math.round(elecSavings),
        baselineElec: Math.round(baselineElec),
        fertCost: Math.round(fertCost),
        digestateSavings: Math.round(digestateSavings),
        digestateLiters: Math.round(digestateLiters),
        waterHarvest: Math.round(waterHarvest),
        co2Avoided: co2Avoided.toFixed(1),
        carbonImpact: carbonImpact.toFixed(1),
        methaneSaved: methaneSaved.toFixed(1),
        totalCarbonOffset: totalCarbonOffset.toFixed(1),
        carbonCredits: Math.round(carbonCredits),
        totalAnnualValue: Math.round(elecSavings + digestateSavings + carbonCredits),
        totalAnnualBaseline: Math.round(baselineElec + fertCost),
      };
      setResults(r);
      setStep('results');
      setLoading(false);
    }, 900);
  }

  return (
    <div className="min-h-screen pt-20 pb-20 px-4" style={{ background: 'var(--voneng-bg)' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 10%, rgba(22,163,74,0.08) 0%, transparent 70%)' }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="tag mb-4 mx-auto w-fit">{t('advisor_badge')}</div>
          <h1 className="font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.2, overflow: 'visible', paddingBottom: '0.1em' }}>
            {t('advisor_title_1')} <span className="gradient-text">{t('advisor_title_2')}</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {t('advisor_subtitle')}
          </p>
          {!user && (
            <p className="text-slate-600 text-sm mt-3">
              {t('advisor_no_account')}{' '}
              <Link to="/signup" className="text-green-500 hover:text-green-400 transition-colors">
                {t('advisor_sign_up')}
              </Link>{' '}
              {t('advisor_sign_up_text')}
            </p>
          )}
        </div>

        {/* ══════════ FORM ══════════ */}
        {step === 'form' && (
          <form onSubmit={calculate} className="glass-card p-8 flex flex-col gap-8">

            <Question number="1" question={t('advisor_q1')}>
              <select
                className="input-field"
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                {locationOptions.map(l => (
                  <option key={l} value={l} style={{ background: '#0a1a0f' }}>{l}</option>
                ))}
              </select>
              {locationInfo && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {[
                    { label: '☀️ Solar', val: `${locationInfo.solar_irradiance_kwh_m2_day} kWh/m²/day` },
                    { label: '🌧 Rain', val: `${locationInfo.annual_rainfall_mm} mm/yr` },
                    { label: '🌡 Winter', val: `${locationInfo.winter_temperature_min_c}°C min` },
                  ].map(({ label, val }) => (
                    <span key={label} className="tag text-xs">{label} {val}</span>
                  ))}
                </div>
              )}
            </Question>

            <Question number="2" question={t('advisor_q2')}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: `🐄 ${t('advisor_cows')}`, val: cows, set: setCows },
                  { label: `🐷 ${t('advisor_pigs')}`, val: pigs, set: setPigs },
                  { label: `🐔 ${t('advisor_chickens')}`, val: chickens, set: setChickens },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="text-slate-500 text-xs mb-1 block">{label}</label>
                    <input
                      className="input-field text-center"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={val}
                      onChange={e => set(e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </Question>

            <Question number="3" question={t('advisor_q3')}>
              {(() => {
                const usedCycles = Object.values(crops).reduce((sum, d) => sum + (parseInt(d.cycles) || 1), 0);
                const remaining = 3 - usedCycles;
                return (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Crop cycle budget:</span>
                    {[1,2,3].map(i => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ background: i <= usedCycles ? '#22c55e' : 'rgba(255,255,255,0.1)' }} />
                    ))}
                    <span className="text-xs font-semibold" style={{ color: remaining === 0 ? '#f87171' : '#4ade80' }}>
                      {remaining} cycle{remaining !== 1 ? 's' : ''} remaining
                    </span>
                  </div>
                );
              })()}
              <div className="flex flex-col gap-3">
                {availableCrops.map(crop => (
                  <div key={crop} className="grid grid-cols-3 gap-3 items-center">
                    <span className="text-slate-300 text-sm font-medium">{CROP_LABELS[crop] || crop}</span>
                    <div>
                      <label className="text-slate-600 text-xs mb-1 block">{t('advisor_hectares')}</label>
                      <input
                        className="input-field text-center"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="0"
                        value={crops[crop]?.ha || ''}
                        onChange={e => handleCropHa(crop, e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 text-xs mb-1 block">{t('advisor_cycles')}</label>
                      <select
                        className="input-field"
                        value={crops[crop]?.cycles || 1}
                        onChange={e => handleCropCycles(crop, parseInt(e.target.value))}
                      >
                        <option value={1}>1 cycle</option>
                        <option value={2}>2 cycles</option>
                        <option value={3}>3 cycles</option>
                      </select>
                    </div>
                  </div>
                ))}
                {availableCrops.length === 0 && (
                  <p className="text-slate-600 text-sm">Select a location first to see available crops.</p>
                )}
              </div>
            </Question>

            <Question number="4" question={t('advisor_q4')}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">🏠 {t('advisor_roof')} (m²)</label>
                  <input className="input-field text-center" type="number" min="0" placeholder="e.g. 400" value={roofArea} onChange={e => setRoofArea(e.target.value)} />
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">⚡ Open solar area (m²)</label>
                  <input className="input-field text-center" type="number" min="0" placeholder="e.g. 200" value={solarArea} onChange={e => setSolarArea(e.target.value)} />
                </div>
              </div>
              <p className="text-slate-600 text-xs mt-2">{t('advisor_roof_hint')}</p>
            </Question>

            {inputError && (
              <p className="text-red-400 text-sm p-3 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {inputError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !hasAnyInput}
              className="btn-primary w-full text-base py-4 flex items-center justify-center gap-3 transition-opacity"
              style={{ opacity: hasAnyInput ? 1 : 0.45, cursor: hasAnyInput ? 'pointer' : 'not-allowed' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('advisor_calculating')}
                </>
              ) : `🌿 ${t('advisor_calculate')}`}
            </button>
          </form>
        )}

        {/* ══════════ RESULTS ══════════ */}
        {step === 'results' && results && (
          <div className="flex flex-col gap-6">
            {/* Summary banner */}
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(22,163,74,0.2), rgba(16,185,129,0.1))',
                border: '1px solid rgba(34,197,94,0.35)',
              }}
            >
              <div className="text-slate-400 text-sm mb-2">With VONeng, your farm could generate</div>
              <div className="gradient-text font-bold" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontFamily: 'Syne, sans-serif' }}>
                €{results.totalAnnualValue.toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm mt-1">in annual savings and revenue</div>
              <div className="flex flex-wrap justify-center gap-4 mt-5">
                <span className="tag">🌍 {results.totalCarbonOffset} tons CO₂ offset/year</span>
                {results.numCows + results.numPigs + results.numChickens > 0 && (
                  <span className="tag">⚡ {Math.round((results.totalGen / Math.max(results.energyReq, 1)) * 100)}% energy independence</span>
                )}
              </div>
            </div>

            <ResultBlock icon="💸" title="Your Farm Today" color="239,68,68">
              <Row label="Annual electricity cost" value={`€${results.baselineElec.toLocaleString()}/yr`} />
              <Row label="Chemical fertilizer cost" value={`€${results.fertCost.toLocaleString()}/yr`} />
              <div className="flex items-center justify-between pt-3 mt-1">
                <span className="text-slate-300 font-semibold text-sm">Total annual outgoing</span>
                <span className="text-red-400 font-bold text-lg">€{results.totalAnnualBaseline.toLocaleString()}/yr</span>
              </div>
            </ResultBlock>

            <ResultBlock icon="🟢" title="With VONeng" color="34,197,94">
              {results.elecSavings > 0 && (
                <Row label="Electricity savings" value={`€${results.elecSavings.toLocaleString()}/yr`} highlight />
              )}
              {results.digestateSavings > 0 && (
                <Row label="Free fertilizer (digestate)" value={`€${results.digestateSavings.toLocaleString()}/yr`} highlight />
              )}
              {results.carbonCredits > 0 && (
                <Row label="Carbon credit potential" value={`€${results.carbonCredits.toLocaleString()}/yr`} highlight />
              )}
              <div className="flex items-center justify-between pt-3 mt-1">
                <span className="text-slate-300 font-semibold text-sm">Total annual value</span>
                <span className="text-green-400 font-bold text-lg">€{results.totalAnnualValue.toLocaleString()}/yr</span>
              </div>
              {results.digestateLiters > 0 && (
                <div className="mt-4 p-3 rounded-xl text-xs text-slate-400" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
                  🌱 Your biogas digester will produce <strong className="text-green-400">{results.digestateLiters.toLocaleString()} liters</strong> of bio fertilizer (digestate) per year. Replacing chemical fertilizer on your fields at no cost.
                </div>
              )}
            </ResultBlock>

            <ResultBlock icon="🌍" title="Environmental Impact" color="16,185,129">
              <Row label="CO₂ avoided (clean energy)" value={`${results.co2Avoided} tons/yr`} highlight />
              {parseFloat(results.carbonImpact) > 0 && (
                <Row label="CO₂ sequestered (biochar)" value={`${results.carbonImpact} tons/yr`} highlight />
              )}
              {parseFloat(results.methaneSaved) > 0 && (
                <Row label="Methane emissions avoided" value={`${results.methaneSaved} tons CO₂e/yr`} highlight />
              )}
              <div className="flex items-center justify-between pt-3 mt-1">
                <span className="text-slate-300 font-semibold text-sm">Total carbon offset</span>
                <span className="text-emerald-400 font-bold text-lg">{results.totalCarbonOffset} tons CO₂e/yr</span>
              </div>
            </ResultBlock>

            {/* ── CTA block: conditional on auth state ── */}
            <div className="glass-card p-8 text-center">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="text-white font-bold text-xl mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                Interested? Let's Talk.
              </h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                Share your details with our team and we'll prepare a personalised proposal
                for your farm — including financing options.
              </p>
              {user ? (
                <button
                  onClick={scrollToContact}
                  className="btn-primary inline-block text-base px-8 py-3"
                >
                  Contact Us
                </button>
              ) : (
                <button
                  onClick={handleContactRedirect}
                  className="btn-primary inline-block text-base px-8 py-3"
                >
                  Create an Account to Continue
                </button>
              )}
            </div>

            {/* Reset + Expert mode */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => { setStep('form'); setResults(null); }}
                className="btn-secondary text-sm px-6 py-3"
              >
                Recalculate
              </button>
              {user?.role === 'expert' && (
                <Link to="/dashboard" className="btn-primary text-sm px-6 py-3">
                  Open Expert Dashboard
                </Link>
              )}
              {!user && (
                <Link to="/login" className="btn-secondary text-sm px-6 py-3">
                  Sign in for Expert View
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Expert access note for guests ── */}
        {!user && (
          <div className="mt-10 glass-card p-6 text-center">
            <div className="text-slate-500 text-sm">
              <strong className="text-slate-300">Engineers and Investors:</strong>{' '}
              <Link to="/signup" className="text-green-500 hover:text-green-400 transition-colors">
                Create an expert account
              </Link>{' '}
              to access the full technical dashboard with charts, feedstock analysis, revenue stack, and all 18 controls.
            </div>
          </div>
        )}

        {/* ── Contact section — visible to authenticated users ── */}
        {user && showContact && (
          <div
            ref={contactRef}
            className="mt-8 glass-card p-8"
            style={{ scrollMarginTop: '100px' }}
          >
            <div className="text-center mb-6">
              <div className="text-3xl mb-3">📬</div>
              <h3 className="text-white font-bold text-2xl mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                Get in Touch
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Fill in your details and reach us via WhatsApp or Email. We'll prepare a personalised proposal for your farm.
              </p>
            </div>
            <ContactForm user={user} />
          </div>
        )}
      </div>

      {/* ── Floating AI Chat Button ── */}
      <button
        onClick={() => setAiOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-900/50"
        style={{
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          boxShadow: '0 8px 32px rgba(22,163,74,0.4)',
          animation: 'pulseGlow 3s ease-in-out infinite',
        }}
      >
        <style>{`
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 8px 32px rgba(22,163,74,0.4); }
            50% { box-shadow: 0 8px 48px rgba(22,163,74,0.7); }
          }
        `}</style>
        <span className="text-xl">🤖</span>
        <span className="text-white font-semibold text-sm">Ask the AI Advisor</span>
        {!apiKey && (
          <span className="text-yellow-300 text-xs font-bold">· Setup needed</span>
        )}
      </button>

      <AIChatPanel
        apiKey={apiKey}
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        initialContext={{ location, cows, pigs, chickens, roofArea, solarArea, crops }}
      />
    </div>
  );
}
