import React, { useState, useRef, useEffect } from 'react';
import { tools, executeFunction, SYSTEM_PROMPT } from '../utils/advisorAI';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

const GEMINI_MODEL = 'gemini-2.5-flash';

/* ── Per-language welcome messages ── */
const WELCOME = {
  en: `Hi! I'm your VONeng Farm Energy Advisor.\n\nTell me about your farm: where it is, what animals you have, what crops you grow. I'll calculate how much you could save on energy and fertilizer with a VONeng system. 🌱`,
  es: `¡Hola! Soy tu Asesor de Energía Agrícola VONeng.\n\nCuéntame sobre tu granja: dónde está, qué animales tienes, qué cultivos produces. Calcularé cuánto podrías ahorrar en energía y fertilizantes. 🌱`,
  hi: `नमस्ते! मैं आपका VONeng कृषि ऊर्जा सलाहकार हूँ।\n\nअपने खेत के बारे में बताएं: यह कहाँ है, आपके पास कौन से पशु हैं, आप कौन सी फसलें उगाते हैं। मैं गणना करूँगा कि आप VONeng सिस्टम से कितनी बचत कर सकते हैं। 🌱`,
  fr: `Bonjour ! Je suis votre Conseiller Énergétique Agricole VONeng.\n\nParlez-moi de votre ferme: où elle se trouve, quels animaux vous avez, quelles cultures vous produisez. Je calculerai combien vous pourriez économiser. 🌱`,
};

const SUGGESTIONS_BY_LANG = {
  en: ['🐄 25 cows near Madrid, 10ha wheat', '🌾 Wheat in winter, sunflower in summer', '🏠 My barn roof is 400 square metres'],
  es: ['🐄 25 vacas cerca de Madrid, 10ha trigo', '🌾 Trigo en invierno, girasol en verano', '🏠 Mi tejado tiene unos 400 m²'],
  hi: ['🐄 मेरे पास 25 गायें, 10 हेक्टेयर गेहूं', '🌾 सर्दियों में गेहूं, गर्मियों में सूरजमुखी', '🏠 मेरी छत लगभग 400 वर्ग मीटर है'],
  fr: ['🐄 25 vaches près de Madrid, 10ha blé', '🌾 Blé en hiver, tournesol en été', '🏠 Mon toit fait environ 400 m²'],
};

const PLACEHOLDER_BY_LANG = {
  en: 'Tell me about your farm…',
  es: 'Cuéntame sobre tu granja…',
  hi: 'अपने खेत के बारे में बताएं…',
  fr: 'Parlez-moi de votre ferme…',
};

const LANG_QUESTION = '🌍 Welcome to VONeng Farm Advisor!\n\nIn which language would you like to chat?\nBienvenido: ¿En qué idioma prefiere?\nस्वागत है: किस भाषा में?\nBienvenue: Dans quelle langue ?';

/* ──────────────────────────────────────────────────────────
   RULE-BASED FALLBACK ENGINE
────────────────────────────────────────────────────────── */
let fallbackState = {
  location: null, cows: 0, pigs: 0, chickens: 0,
  cropWheatHa: 0, cropCornHa: 0, cropSunflowerHa: 0,
  cropBarleyHa: 0, cropOtherHa: 0, cycles: 1, roofM2: 0,
  stage: 'greeting',
};

function resetFallback() {
  fallbackState = {
    location: null, cows: 0, pigs: 0, chickens: 0,
    cropWheatHa: 0, cropCornHa: 0, cropSunflowerHa: 0,
    cropBarleyHa: 0, cropOtherHa: 0, cycles: 1, roofM2: 0,
    stage: 'greeting',
  };
}

function fmt(n) { return Math.round(n).toLocaleString('en-EU'); }
function extractNumbers(text) {
  return (text.match(/\d+(?:[.,]\d+)*/g) || []).map(m => parseFloat(m.replace(',', '.')));
}

function parseMessage(text) {
  const lower = text.toLowerCase();
  const nums = extractNumbers(text);
  const updates = {};

  const locations = {
    'madrid': 'Madrid, Spain', 'spain': 'Madrid, Spain', 'españa': 'Madrid, Spain',
    'berlin': 'Berlin, Germany', 'germany': 'Berlin, Germany',
    'paris': 'Paris, France', 'france': 'Paris, France',
    'rome': 'Rome, Italy', 'italy': 'Rome, Italy',
    'amsterdam': 'Amsterdam, Netherlands', 'netherlands': 'Amsterdam, Netherlands',
    'warsaw': 'Warsaw, Poland', 'poland': 'Warsaw, Poland',
    'lisbon': 'Lisbon, Portugal', 'portugal': 'Lisbon, Portugal',
    'athens': 'Athens, Greece', 'greece': 'Athens, Greece',
    'oslo': 'Oslo, Norway', 'norway': 'Oslo, Norway',
    'stockholm': 'Stockholm, Sweden', 'sweden': 'Stockholm, Sweden',
    'vienna': 'Vienna, Austria', 'austria': 'Vienna, Austria',
    'brussels': 'Brussels, Belgium', 'belgium': 'Brussels, Belgium',
    'london': 'London, UK', 'uk': 'London, UK',
    'barcelona': 'Barcelona, Spain',
    'munich': 'Munich, Germany', 'münchen': 'Munich, Germany',
    'milan': 'Milan, Italy',
  };
  for (const [kw, loc] of Object.entries(locations)) {
    if (lower.includes(kw)) { updates.location = loc; break; }
  }

  if (lower.includes('cow') || lower.includes('vache') || lower.includes('vaca') || lower.includes('गाय')) {
    const n = nums.find(n => n > 0 && n < 5000);
    if (n) updates.cows = n;
  }
  if (lower.includes('pig') || lower.includes('porc') || lower.includes('cerdo') || lower.includes('सूअर')) {
    const n = nums.find(n => n > 0 && n < 50000);
    if (n) updates.pigs = n;
  }
  if (lower.includes('chicken') || lower.includes('poule') || lower.includes('pollo') || lower.includes('hen') || lower.includes('मुर्गी')) {
    const n = nums.find(n => n > 0 && n < 500000);
    if (n) updates.chickens = n;
  }
  if (lower.includes('wheat') || lower.includes('blé') || lower.includes('trigo') || lower.includes('गेहूं')) {
    const n = nums.find(n => n > 0 && n < 100000);
    if (n) updates.cropWheatHa = n;
  }
  if (lower.includes('corn') || lower.includes('maize') || lower.includes('maïs') || lower.includes('maíz')) {
    const n = nums.find(n => n > 0 && n < 100000);
    if (n) updates.cropCornHa = n;
  }
  if (lower.includes('sunflower') || lower.includes('tournesol') || lower.includes('girasol') || lower.includes('सूरजमुखी')) {
    const n = nums.find(n => n > 0 && n < 100000);
    if (n) updates.cropSunflowerHa = n;
  }
  if ((lower.includes('winter') && lower.includes('summer')) || lower.includes('two cycle') || lower.includes('2 cycle')) {
    updates.cycles = 2;
  }
  if (lower.includes('roof') || lower.includes('barn') || lower.includes('tejado') || lower.includes('छत') || lower.includes('toit')) {
    const n = nums.find(n => n >= 10 && n <= 100000);
    if (n) updates.roofM2 = n;
  }
  if (!Object.keys(updates).some(k => k.startsWith('crop')) && lower.includes('hectare')) {
    const n = nums.find(n => n > 0 && n < 100000);
    if (n) updates.cropWheatHa = n;
  }

  // If no location was matched but the user provided text and we don't have a location yet...
  if (!updates.location && !fallbackState.location) {
    const textLetters = text.replace(/[\d\.,]/g, '').trim();
    if (textLetters.length >= 2) {
      const remainingWords = textLetters.split(/\s+/).filter(w => !lower.match(/(cow|vache|vaca|गाय|pig|porc|cerdo|सूअर|chicken|poule|pollo|hen|मुर्गी)/));
      if (remainingWords.length > 0) {
        updates.location = textLetters; // Fallback to accepting their text as the location
      }
    }
  }

  return updates;
}

async function generateFallbackResponse(userText, lang = 'en') {
  const updates = parseMessage(userText);
  Object.assign(fallbackState, updates);
  const s = fallbackState;
  const hasAnimals = s.cows > 0 || s.pigs > 0 || s.chickens > 0;
  const totalHa = s.cropWheatHa + s.cropCornHa + s.cropSunflowerHa + s.cropBarleyHa + s.cropOtherHa;
  const hasData = s.location && (hasAnimals || totalHa > 0);

  const tGotIt = { en: 'Got it!', es: '¡Entendido!', hi: 'समझ गया!', fr: 'Compris !' };
  const tNeedLoc = { en: '📍 Where is your farm? (country or nearest city)', es: '📍 ¿Dónde está tu granja? (país o ciudad)', hi: '📍 आपका खेत कहाँ है? (देश या शहर)', fr: '📍 Où se trouve votre ferme ?' };
  const tNeedAnim = { en: '🐄 How many animals do you have? (cows, pigs, chickens)', es: '🐄 ¿Cuántos animales tienes? (vacas, cerdos, pollos)', hi: '🐄 आपके पास कितने जानवर हैं? (गायें, सूअर, मुर्गियां)', fr: '🐄 Combien d\'animaux avez-vous ?' };
  const tNeedCrops = { en: '🌾 What crops do you grow, and how many hectares?', es: '🌾 ¿Qué cultivas y cuántas hectáreas?', hi: '🌾 आप कौन सी फसलें उगाते हैं और कितने हेक्टेयर में?', fr: '🌾 Quelles cultures produisez-vous ?' };
  const tJustMore = { en: 'Just a couple more details:', es: 'Solo unos detalles más:', hi: 'बस कुछ और विवरण:', fr: 'Encore quelques détails :' };
  const tCalculate = { en: 'To calculate your savings, I need:', es: 'Para calcular tus ahorros, necesito:', hi: 'आपकी बचत की गणना करने के लिए, मुझे चाहिए:', fr: 'Pour calculer vos économies, j\'ai besoin de :' };
  
  const labelCows = { en: 'cows', es: 'vacas', hi: 'गायें', fr: 'vaches' };
  const labelPigs = { en: 'pigs', es: 'cerdos', hi: 'सूअर', fr: 'porcs' };
  const labelChickens = { en: 'chickens', es: 'pollos', hi: 'मुर्गियां', fr: 'poulets' };
  const labelCrops = { en: 'ha crops', es: 'ha cultivos', hi: 'हेक्टेयर फसल', fr: 'ha cultures' };

  if (hasData) {
    fallbackState.stage = 'results';
    const genericClimate = {
      solar_irradiance_kwh_m2_day: 4.0, // generous average
      annual_rainfall_mm: 650,
      winter_temperature_min_c: 5,
      electricity_price_eur_per_kwh: 0.22,
      grid_co2_kg_per_kwh: 0.200,
    };

    const baseline = await executeFunction('calculate_farm_baseline', {
      location: s.location, num_cows: s.cows, num_pigs: s.pigs, num_chickens: s.chickens,
      crop_wheat_ha: s.cropWheatHa, crop_corn_ha: s.cropCornHa,
      crop_sunflower_ha: s.cropSunflowerHa, crop_barley_ha: s.cropBarleyHa,
      num_crop_cycles: s.cycles,
    });
    const voneng = await executeFunction('calculate_with_voneng', {
      location: s.location, num_cows: s.cows, num_pigs: s.pigs, num_chickens: s.chickens,
      roof_area_m2: s.roofM2 || 300, crop_wheat_ha: s.cropWheatHa, crop_corn_ha: s.cropCornHa,
      crop_sunflower_ha: s.cropSunflowerHa, crop_barley_ha: s.cropBarleyHa,
      num_crop_cycles: s.cycles,
    });

    if (baseline.error || voneng.error) {
      const errTexts = {
        en: `I had trouble finding data for "${s.location}". Could you try a nearby city?`,
        es: `No pude encontrar datos para "${s.location}". ¿Podrías intentar con una ciudad cercana?`,
        hi: `मुझे "${s.location}" के लिए डेटा नहीं मिला। क्या आप कोई नजदीकी शहर बता सकते हैं?`,
        fr: `Je n'ai pas trouvé de données pour "${s.location}". Pourriez-vous essayer une ville proche ?`
      };
      return errTexts[lang] || errTexts.en;
    }

    const tToday = { en: '💸 YOUR FARM TODAY', es: '💸 TU GRANJA HOY', hi: '💸 आपका खेत आज', fr: '💸 VOTRE FERME AUJOURD\'HUI' };
    const tElecCost = { en: 'Electricity cost', es: 'Costo eléctrico', hi: 'बिजली खर्च', fr: 'Coût électrique' };
    const tFertCost = { en: 'Chemical fertilizer', es: 'Fertilizante químico', hi: 'रासायनिक उर्वरक', fr: 'Engrais chimique' };
    const tWithVon = { en: '🟢 WITH VONENG', es: '🟢 CON VONENG', hi: '🟢 VONENG के साथ', fr: '🟢 AVEC VONENG' };
    const tElecSav = { en: 'Electricity savings', es: 'Ahorro eléctrico', hi: 'बिजली की बचत', fr: 'Éco. d\'électricité' };
    const tFertSav = { en: 'Fertilizer savings', es: 'Ahorro fertilizante', hi: 'उर्वरक की बचत', fr: 'Éco. d\'engrais' };

    return `📍 ${s.location}
${hasAnimals ? `🐾 ${[s.cows>0?`${s.cows} ${labelCows[lang]}`:'', s.pigs>0?`${s.pigs} ${labelPigs[lang]}`:'', s.chickens>0?`${s.chickens} ${labelChickens[lang]}`:''].filter(Boolean).join(', ')}` : ''}

${tToday[lang]}
   ${tElecCost[lang]}: €${fmt(baseline.annual_electricity_cost_eur)}
   ${tFertCost[lang]}: €${fmt(baseline.annual_fertilizer_cost_eur)}

${tWithVon[lang]}
   ${tElecSav[lang]}: €${fmt(voneng.electricity_savings_eur)}
   ${tFertSav[lang]}: €${fmt(voneng.fertilizer_savings_eur_digestate)}
   ────────────────────────
   💰 Total: €${fmt(voneng.total_annual_value_eur)}`;
  }

  fallbackState.stage = 'collecting';
  const missing = [];
  if (!s.location) missing.push(tNeedLoc[lang] || tNeedLoc.en);
  if (!hasAnimals) missing.push(tNeedAnim[lang] || tNeedAnim.en);
  if (totalHa === 0) missing.push(tNeedCrops[lang] || tNeedCrops.en);

  const alreadyKnow = [
    s.location ? `📍 ${s.location}` : '',
    hasAnimals ? `🐾 ${[s.cows>0?`${s.cows} ${labelCows[lang]}`:'', s.pigs>0?`${s.pigs} ${labelPigs[lang]}`:'', s.chickens>0?`${s.chickens} ${labelChickens[lang]}`:''].filter(Boolean).join(', ')}` : '',
    totalHa > 0 ? `🌾 ${totalHa} ${labelCrops[lang]}` : '',
  ].filter(Boolean);

  const prefix = alreadyKnow.length > 0
    ? `${tGotIt[lang] || tGotIt.en}\n${alreadyKnow.join('\n')}\n\n${tJustMore[lang] || tJustMore.en}\n`
    : `${tCalculate[lang] || tCalculate.en}\n`;

  return prefix + missing.slice(0, 2).join('\n');
}

/* ── Typing indicator ── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full bg-green-400"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}

/* ── Message bubble ── */
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2 mt-1"
          style={{ background: 'rgba(22,163,74,0.25)', border: '1px solid rgba(34,197,94,0.4)' }}>
          🤖
        </div>
      )}
      <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={{
          background: isUser ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'rgba(15,35,24,0.9)',
          border: isUser ? 'none' : '1px solid rgba(34,197,94,0.15)',
          color: isUser ? 'white' : '#e2e8f0',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'Inter, sans-serif',
        }}>
        {message.text}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN CHAT PANEL
══════════════════════════════════════════════════════════ */
export default function AIChatPanel({ apiKey, isOpen, onClose, initialContext }) {
  const { setLang: setGlobalLang, t } = useLanguage();
  const [chatLang, setChatLang] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Show language picker when panel opens for the first time */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', text: LANG_QUESTION, isLangPicker: true }]);
    }
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function selectLanguage(code) {
    setChatLang(code);
    setGlobalLang(code);
    resetFallback();
    setMessages([
      { role: 'assistant', text: LANG_QUESTION, isLangPicker: true },
      { role: 'assistant', text: WELCOME[code] || WELCOME.en },
    ]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function sendMessage(text) {
    if (!text.trim() || !chatLang) return;
    setMessages(prev => [...prev, { role: 'user', text: text.trim() }]);
    setInput('');
    setLoading(true);

    if (usingFallback || !apiKey) {
      await new Promise(r => setTimeout(r, 600));
      const fbResponse = await generateFallbackResponse(text.trim(), chatLang);
      setMessages(prev => [...prev, { role: 'assistant', text: fbResponse }]);
      setLoading(false);
      return;
    }

    const newHistory = [...chatHistory, { role: 'user', parts: [{ text: text.trim() }] }];
    try {
      let currentHistory = newHistory;
      let finalText = '';
      let maxRounds = 5;
      while (maxRounds-- > 0) {
        const res = await callGemini(currentHistory, chatLang);
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error?.message || `API error ${res.status}`);
        }
        const data = await res.json();
        const candidate = data.candidates?.[0];
        if (!candidate) throw new Error('No response from Gemini');
        const parts = candidate.content?.parts || [];
        const functionCalls = parts.filter(p => p.functionCall);
        const textParts = parts.filter(p => p.text).map(p => p.text).join('');
        if (functionCalls.length === 0) {
          finalText = textParts;
          currentHistory = [...currentHistory, { role: 'model', parts: [{ text: textParts }] }];
          break;
        }
        const funcResults = await Promise.all(functionCalls.map(async p => ({
          name: p.functionCall.name,
          response: await executeFunction(p.functionCall.name, p.functionCall.args || {}),
        })));
        currentHistory = [
          ...currentHistory,
          { role: 'model', parts },
          { role: 'user', parts: funcResults.map(fr => ({ functionResponse: { name: fr.name, response: { content: fr.response } } })) },
        ];
        if (textParts) finalText = textParts;
      }
      setChatHistory([...newHistory, { role: 'model', parts: [{ text: finalText }] }]);
      setMessages(prev => [...prev, { role: 'assistant', text: finalText || '(No response)' }]);
    } catch (err) {
      console.warn('Gemini unavailable, switching to fallback:', err.message);
      setUsingFallback(true);
      await new Promise(r => setTimeout(r, 500));
      const fbResponse = await generateFallbackResponse(text.trim(), chatLang);
      setMessages(prev => [...prev, { role: 'assistant', text: fbResponse }]);
    } finally {
      setLoading(false);
    }
  }

  async function callGemini(history, language) {
    const langInfo = LANGUAGES.find(l => l.code === language);
    const langPrefix = language && language !== 'en' && langInfo
      ? `CRITICAL LANGUAGE RULE — YOU MUST FOLLOW THIS ABOVE ALL ELSE:\nThe farmer has selected ${langInfo.label} (language code: ${language}) as their language.\nYOU MUST WRITE EVERY SINGLE WORD OF YOUR RESPONSE IN ${langInfo.label.toUpperCase()} ONLY.\nDO NOT write any English text. DO NOT switch languages mid-response.\nEven numbers, units, and technical terms must appear with ${langInfo.label} context.\nThis rule applies to EVERY message in this conversation, without exception.\n\n`
      : '';

    const contextStr = initialContext 
      ? `\n\nUSER'S CURRENT FORM DATA:\n${JSON.stringify(initialContext, null, 2)}\nUse this context if the user asks about their farm (e.g., "my crops" or "my cows") without explicitly specifying quantities. Note that some values may be empty if the user hasn't filled them out yet.` 
      : '';

    return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: langPrefix + SYSTEM_PROMPT + contextStr }] },
        contents: history,
        tools: tools,
        generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
      }),
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  function clearChat() {
    resetFallback();
    setChatHistory([]);
    setChatLang(null);
    setUsingFallback(false);
    setMessages([{ role: 'assistant', text: LANG_QUESTION, isLangPicker: true }]);
  }

  const suggestions = SUGGESTIONS_BY_LANG[chatLang] || SUGGESTIONS_BY_LANG.en;
  const placeholder = PLACEHOLDER_BY_LANG[chatLang] || PLACEHOLDER_BY_LANG.en;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      <div className="fixed z-50 flex flex-col" style={{
        bottom: '1.5rem', right: '1.5rem',
        width: 'min(500px, calc(100vw - 3rem))',
        height: 'min(700px, calc(100vh - 3rem))',
        background: 'rgba(8,20,12,0.97)',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: '24px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,197,94,0.1)',
        animation: 'slideUp 0.3s ease',
      }}>
        <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(34,197,94,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(34,197,94,0.35)' }}>
              🤖
            </div>
            <div>
              <div className="text-white font-bold text-sm">VONeng AI Advisor</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" style={{ animation: 'pulse 2s infinite' }} />
                <span className="text-green-500 text-xs font-medium">
                  {usingFallback ? t('chat_calculator_mode') : t('chat_online')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {chatLang && <span className="text-lg">{LANGUAGES.find(l => l.code === chatLang)?.flag}</span>}
            <button onClick={clearChat} className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-white/5" title="Start over">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,197,94,0.2) transparent' }}>
          {messages.map((m, i) => (
            <div key={i}>
              <MessageBubble message={m} />
              {m.isLangPicker && (
                <div className="flex flex-wrap gap-2 ml-9 mb-4 mt-1">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => selectLanguage(l.code)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-105"
                      style={{
                        background: chatLang === l.code ? 'rgba(22,163,74,0.3)' : 'rgba(22,163,74,0.1)',
                        border: chatLang === l.code ? '1.5px solid rgba(34,197,94,0.6)' : '1.5px solid rgba(34,197,94,0.2)',
                        color: chatLang === l.code ? '#4ade80' : '#86efac',
                      }}>
                      <span className="text-lg leading-none">{l.flag}</span>
                      <span>{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="px-4 py-1 rounded-2xl" style={{ background: 'rgba(15,35,24,0.9)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '18px 18px 18px 4px' }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggestion chips ── */}
        {chatLang && messages.length <= 3 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => sendMessage(s)} disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-40"
                style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* ── Input ── */}
        <div className="px-4 pb-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(34,197,94,0.08)', paddingTop: '12px' }}>
          <div className="flex items-end gap-2 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(15,35,24,0.6)', border: `1.5px solid ${chatLang ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.08)'}` }}>
            <textarea ref={inputRef} rows={1} value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              onKeyDown={handleKeyDown}
              placeholder={chatLang ? placeholder : 'Choose a language above first…'}
              disabled={loading || !chatLang}
              className="flex-1 bg-transparent text-slate-200 text-sm resize-none outline-none placeholder-slate-600 leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif', maxHeight: '120px', minHeight: '24px' }} />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim() || !chatLang}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
              style={{ background: (input.trim() && chatLang) ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'rgba(255,255,255,0.05)' }}>
              {loading
                ? <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                : <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              }
            </button>
          </div>
          <p className="text-slate-700 text-xs text-center mt-2">{t('chat_powered')}</p>
        </div>
      </div>
    </>
  );
}
