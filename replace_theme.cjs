const fs = require('fs');
const path = require('path');

const srcPaths = [
  './src/pages/ExpertDashboard.jsx',
  './src/components/KPICards.jsx',
  './src/components/Charts.jsx',
  './src/components/Sidebar.jsx',
  './src/components/WeatherDisplay.jsx',
  './src/components/LocationMap.jsx',
  './src/components/Assumptions.jsx',
  './src/components/RecipeCheckWarning.jsx',
  './src/components/DigestateCard.jsx',
  './src/components/RevenueStack.jsx',
  './src/components/ParasiticLoadNote.jsx'
];

const replacements = [
  // Backgrounds
  { from: /background:\s*'#f8fafc'/g, to: "background: 'var(--voneng-bg)'" },
  { from: /bg-white\/80/g, to: 'bg-[#030a06]/80' },
  { from: /bg-white\/95/g, to: 'bg-[#030a06]/95' },
  { from: /bg-white\/40/g, to: 'bg-white/5' },
  { from: /bg-white/g, to: 'bg-[#0a1a0f]' },
  { from: /bg-slate-50\/50/g, to: 'bg-white/5' },
  { from: /bg-slate-50/g, to: 'bg-white/5' },
  { from: /bg-[#f3f7f4]/g, to: 'bg-[#0a1a0f]' },
  { from: /bg-emerald-50\/30/g, to: 'bg-green-400/5' },
  { from: /bg-emerald-50/g, to: 'bg-green-400/10' },
  { from: /bg-amber-50\/80/g, to: 'bg-yellow-400/10' },
  { from: /bg-amber-50\/20/g, to: 'bg-yellow-400/5' },
  { from: /bg-amber-50/g, to: 'bg-yellow-400/10' },
  
  // Gradients
  { from: /from-emerald-100\/30/g, to: 'from-green-400/10' },
  { from: /from-amber-100\/20/g, to: 'from-yellow-400/10' },

  // Text colors
  { from: /text-slate-900/g, to: 'text-white' },
  { from: /text-slate-800/g, to: 'text-white' },
  { from: /text-amber-900/g, to: 'text-yellow-400' },
  { from: /text-amber-800\/90/g, to: 'text-yellow-200/80' },
  { from: /text-amber-700/g, to: 'text-yellow-400' },
  { from: /text-emerald-700/g, to: 'text-green-400' },
  { from: /text-emerald-600/g, to: 'text-green-400' },
  { from: /text-slate-500/g, to: 'text-slate-400' },
  { from: /text-\[#2d5a4c\]/g, to: 'text-white' },
  
  // Borders
  { from: /border-slate-100\/50/g, to: 'border-white/5' },
  { from: /border-slate-100/g, to: 'border-white/10' },
  { from: /border-emerald-100\/50/g, to: 'border-green-400/10' },
  { from: /border-emerald-100\/40/g, to: 'border-green-400/10' },
  { from: /border-emerald-100/g, to: 'border-green-400/20' },
  { from: /border-emerald-200/g, to: 'border-green-400/20' },
  { from: /border-amber-200\/60/g, to: 'border-yellow-400/20' },
  { from: /border-amber-100\/50/g, to: 'border-yellow-400/10' },
  { from: /border-amber-100/g, to: 'border-yellow-400/20' },
  { from: /border-white\/60/g, to: 'border-white/10' },
  { from: /border-white\/50/g, to: 'border-white/10' },
  { from: /border-white\/40/g, to: 'border-white/10' },
  { from: /border-white/g, to: 'border-white/10' },
  
  // Misc
  { from: /shadow-slate-200/g, to: 'shadow-green-400/20' },
  { from: /bg-slate-900 text-white/g, to: 'bg-green-400 text-white hover:bg-green-500' },
  { from: /placeholder-\[#a5c0b1\]/g, to: 'placeholder-slate-500' },
  { from: /decoration-amber-300/g, to: 'decoration-yellow-400' },
  { from: /decoration-emerald-200/g, to: 'decoration-green-400/50' },
  
  // Specific fixes
  { from: /bg-emerald-900\/5/g, to: 'bg-green-400/5' },
  { from: /bg-emerald-400\/5/g, to: 'bg-green-400/5' },
  { from: /hover:bg-emerald-400\/10/g, to: 'hover:bg-green-400/10' },
];

srcPaths.forEach(p => {
  const absolutePath = path.join(__dirname, p);
  if (fs.existsSync(absolutePath)) {
    let content = fs.readFileSync(absolutePath, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`Updated ${p}`);
  } else {
    console.log(`Not found: ${p}`);
  }
});
