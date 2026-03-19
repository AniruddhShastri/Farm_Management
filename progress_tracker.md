# VONeng Project — Proposal Execution Tracker

> **Reference Doc:** [voneng_ai_advisor_proposal.md](./voneng_ai_advisor_proposal.md)  
> **Last Updated:** 2026-03-19  
> **Status:** MVP Complete. Phase 4–6 partially done. Polishing in progress.

---

## Executive Summary Progress

| Proposal Goal | Status | Notes |
|---|---|---|
| **Two Mode Dashboard** (Farmer View + Expert View) | ✅ Done | Farmer View is `/advisor`. Expert View is `/dashboard` with full sidebar. |
| **AI Farm Advisor** (Gemini chatbot) | ✅ Done | `AIChatPanel.jsx` with function calling, fallback engine, language picker. |
| **Full Company Website** | ✅ Done | Homepage, About, Solution, Team sections live. Login/Signup complete. |
| **Multilingual Support** (EN/ES/HI/FR) | ✅ Done | `LanguageContext`, `translations.js`, Navbar switcher, AI chat sync all working. |
| **Lead Capture** (email + OTP + Google) | ⚠️ Partial | Mock OTP and Google Mock built. Waiting for API Keys. |
| **Scientific Accuracy Fixes** | ✅ Done | All 3 fixes applied (CO₂ per country, electricity prices per country, solar × 0.20 efficiency). |
| **Regulatory Awareness** | ⚠️ Partial | `regulatoryData.json` exists. AI `get_grid_regulations` tool defined. UI not yet dynamically integrated into financial calculations. |

---

## Phase-by-Phase Execution

### Phase 0 — Calculator Fixes ✅ COMPLETE

| Fix | Status | Implementation |
|---|---|---|
| Grid CO₂ intensity per country | ✅ Done | `loc.grid_co2_kg_per_kwh` in `locationData.json` used in `AdvisorPage.jsx` |
| Electricity prices per country | ✅ Done | `loc.electricity_price_eur` from locationData, used in financial calculations |
| Solar panel efficiency × 0.20 | ✅ Done | `solarM2 × solarIrr × 0.20 × 365` in calculator |

---

### Phase 1 — Farmer View UI ✅ COMPLETE

| Feature | Status | File |
|---|---|---|
| 5-question simple form | ✅ Done | `AdvisorPage.jsx` — location, animals, crops, cycles, roof area |
| 4 result blocks (Today / VONeng / Carbon / CTA) | ✅ Done | `AdvisorPage.jsx` — `ResultBlock` components |
| Crop cycles constraint (max 3/year total) | ✅ Done | `handleCropCycles` with global cycle budget, visual indicator |
| Rainwater harvested removed from results | ✅ Done | Removed from "With VONeng" block |
| Link to Expert View | ✅ Done | `/dashboard` route for `role === 'expert'` |

---

### Phase 2 — AI Chat Panel ✅ COMPLETE

| Feature | Status | File |
|---|---|---|
| Gemini API with function calling | ✅ Done | `AIChatPanel.jsx` + `advisorAI.js` |
| `lookup_location` tool | ✅ Done | Returns solar irradiance, rainfall, CO₂, electricity price |
| `calculate_farm_baseline` tool | ✅ Done | Full cost + emissions baseline |
| `calculate_with_voneng` tool | ✅ Done | Savings, carbon offset, energy independence |
| `get_grid_regulations` tool | ✅ Done | Queries `regulatoryData.json` |
| Rule-based fallback engine | ✅ Done | Works without API key, parses natural language |
| Language picker (in-chat) | ✅ Done | 4 language bubbles, syncs to global site language |
| Language persistence per message | ✅ Done | Strong system prompt prefix with language mandate |
| Suggestion chips per language | ✅ Done | `SUGGESTIONS_BY_LANG` for EN/ES/HI/FR |
| Clear chat / reset | ✅ Done | Trash icon resets history and language |

---

### Phase 3 — Company Website ✅ COMPLETE

| Page/Section | Status | Notes |
|---|---|---|
| Homepage — Hero | ✅ Done | Animated headline, CTA buttons, animated stats bar |
| Homepage — Stats bar | ✅ Done | Animated counters on scroll-enter |
| Homepage — About/Vision/Mission | ✅ Done | Two-column layout with glass cards |
| Homepage — Problem (4 cards) | ✅ Done | Energy, Fertilizer, Carbon, Fragmented |
| Homepage — Solution (4 steps) | ✅ Done | Container → Biogas → Solar → AI |
| Homepage — Milestones | ✅ Done | 4 achievement chips with year labels |
| Homepage — Team | ✅ Done | 3 team cards with avatar initials |
| Homepage — Footer CTA | ✅ Done | Full-width gradient section with 2 CTAs |
| Auth — Signup (3-step OTP flow) | ✅ Done | Role selection, email verification, OTP entry |
| Auth — Login | ✅ Done | Email + password with redirect by role |
| Navbar — Language switcher | ✅ Done | Flag + native name dropdown |
| Navbar — Links (About, Solution, Team, Advisor) | ✅ Done | Smooth scroll + router links |
| Product page | ❌ Not started | Proposal mentions dedicated `/product` page |
| Blog / Resources page | ❌ Not started | Proposal mentions `/blog` |
| Contact page | ❌ Not started | Will be part of lead capture Phase 4 |

---

### Phase 4 — Lead Capture ⚠️ PARTIAL

| Feature | Status | Notes |
|---|---|---|
| Signup form (name, email, password) | ✅ Done | Step 1 in `SignupPage.jsx` |
| Google Sign-In (Firebase) | ✅ Done | UI & Context added, falls back to Mock without `.env` keys |
| Firestore Database (Save Lead) | ✅ Done | `users` collection setup in `firebase.js` |
| Mock OTP email flow | ✅ Done | Dev OTP displayed on screen (for testing) |
| AbstractAPI email validation | ❌ Not started | API integration not wired |
| AbstractAPI phone validation | ❌ Not started | Phone field not in signup form yet |
| Twilio Verify SMS OTP | ❌ Not started | Real SMS not wired |
| Lead saved to backend / email to sales | ❌ Not started | No backend persistence yet |

---

### Phase 5 — Multilingual ✅ COMPLETE

| Feature | Status | Notes |
|---|---|---|
| Language context + localStorage persist | ✅ Done | `LanguageContext.jsx` |
| Browser language auto-detect | ✅ Done | `navigator.language` on first load |
| `translations.js` — EN | ✅ Done | ~100 keys covering all pages |
| `translations.js` — ES (Español) | ✅ Done | Full translation |
| `translations.js` — HI (हिंदी) | ✅ Done | Full Devanagari translation |
| `translations.js` — FR (Français) | ✅ Done | Full translation |
| Navbar language switcher | ✅ Done | `LanguageSwitcher` in `Navbar.jsx` |
| `HomePage.jsx` — all keys translated | ✅ Done | Fixed in latest session |
| `AdvisorPage.jsx` — all keys translated | ✅ Done | |
| `SignupPage.jsx` — all keys translated | ✅ Done | Fixed in latest session |
| `LoginPage.jsx` — all keys translated | ✅ Done | Fixed in latest session |
| AI chat → global language sync | ✅ Done | `selectLanguage()` calls `setGlobalLang()` |
| Hindi top-clipping fix (Devanagari) | ✅ Done | `data-lang="hi"` CSS overrides with `line-height: 1.85` |
| Descender clipping fix (g, y, p) | ✅ Done | `gradient-text` padded, global `line-height: 1.6`, `h1–h6` overflow: visible |
| Noto Sans Devanagari font | ⚠️ Optional | Inter renders Hindi acceptably; Noto Devanagari would be higher fidelity |
| Hindi number format (lakh system) | ❌ Not done | Numbers still show in Western format |

---

### Phase 6 — Regulatory Data ⚠️ PARTIAL

| Feature | Status | Notes |
|---|---|---|
| `regulatoryData.json` created | ✅ Done | 8 countries with export schemes, FiT rates, key rules |
| `get_grid_regulations` AI tool | ✅ Done | Queries the JSON by country name |
| Dynamic FiT revenue in financial calc | ❌ Not done | `regulatoryData.json` not yet integrated into `AdvisorPage.jsx` ROI calc |
| Per-country solar feed-in tariff display | ❌ Not done | Would require UI addition to results blocks |

---

### Phase 7 — Polish ⚠️ In Progress

| Feature | Status | Notes |
|---|---|---|
| Responsive layout | ✅ Mostly done | Tailwind responsive classes throughout |
| Font clipping fixes | ✅ Done | Global `line-height`, heading overflow, gradient-text padding (verified across EN/ES/FR/HI) |
| Hyphen/Dash removal | ✅ Done | All em-dashes and hyphens stripped from content strings across all languages |
| SEO meta tags | ⚠️ Partial | Title set in `index.html`; individual page meta not yet set |
| Error handling (Gemini API) | ✅ Done | Falls back to rule-based engine gracefully |
| Location input — Google Maps Autocomplete | ❌ Not started | Currently a static dropdown of 20 cities |
| Crop cycle visual budget indicator | ✅ Done | Dot progress bar + "X cycles remaining" text |

---

## Key Remaining Work (Priority Order)

| # | Task | Effort | Impact |
|---|---|---|---|
| 1 | **Google Maps / location autocomplete** | Medium | High — proposal explicitly lists this |
| 2 | **Real Twilio + AbstractAPI lead capture** | Medium | High — needed for sales pipeline |
| 3 | **Regulatory data in financial calc** | Small | Medium — improves accuracy |
| 4 | **Product page** (`/product`) | Large | Medium — company credibility |
| 5 | **Blog shell** (`/blog`) | Medium | Low |
| 6 | **Hindi number format** (lakh system) | Small | Low |
| 7 | **Noto Sans Devanagari font** | Small | Low |
| 8 | **Per-page SEO meta tags** | Small | Medium |

---

## What Is NOT Started (From Proposal)

| Feature | Proposal Section | Reason Not Started |
|---|---|---|
| Location API (Google Maps Autocomplete) | §3, Appendix A | Requires API key setup + billing |
| Real SMS OTP (Twilio Verify) | §9 | Requires Twilio account + backend |
| AbstractAPI email/phone validation | §9 | Requires API key + backend |
| Product page | §5 | Not yet prioritised |
| Blog / Resources | §5 | Not yet prioritised |
| Corporate Data Hub / Scope 3 | §4 (exclusion) | Out of scope by design |
| Container Brain hardware control | §4 (exclusion) | Out of scope by design |
| Investment / payback section | §3 (exclusion) | Excluded intentionally — strategy TBD |
