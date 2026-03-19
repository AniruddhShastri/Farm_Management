const fs = require('fs');
const path = require('path');

const absolutePath = path.join(__dirname, './src/components/Sidebar.jsx');
let content = fs.readFileSync(absolutePath, 'utf8');

const replacements = [
  { from: /bg-\[#fbfcfa\]/g, to: 'bg-[#030a06]' },
  { from: /bg-\[#f3f7f4\]/g, to: 'bg-white/5' },
  { from: /bg-\[#e8f3ee\]/g, to: 'bg-green-400/10' },
  { from: /text-\[#10b981\]/g, to: 'text-green-400' },
  { from: /text-\[#4a7c66\]/g, to: 'text-green-400' },
  { from: /text-\[#a5c0b1\]/g, to: 'text-slate-400' },
  { from: /shadow-\[25px_0_60px_-15px_rgba\(45,90,76,0\.12\)\]/g, to: 'shadow-[25px_0_60px_-15px_rgba(34,197,94,0.12)]' },
  { from: /text-[#2d5a4c]/g, to: 'text-white' }, // Just in case
];

replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

fs.writeFileSync(absolutePath, content, 'utf8');
console.log('Sidebar updated');
