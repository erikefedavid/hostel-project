const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src/app');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replacements mapping
  const replacements = [
    { from: /\btext-white\b/g, to: 'text-slate-900' },
    { from: /\btext-slate-100\b/g, to: 'text-slate-900' },
    { from: /\btext-slate-200\b/g, to: 'text-slate-800' },
    { from: /\btext-slate-300\b/g, to: 'text-slate-700' },
    { from: /\btext-slate-400\b/g, to: 'text-slate-600' },
    { from: /\bbg-white\/5\b/g, to: 'bg-slate-900/5' },
    { from: /\bbg-white\/10\b/g, to: 'bg-slate-900/10' },
    { from: /\bbg-white\/20\b/g, to: 'bg-slate-900/20' },
    { from: /\bborder-white\/5\b/g, to: 'border-slate-200' },
    { from: /\bborder-white\/10\b/g, to: 'border-slate-300' },
    { from: /\bborder-white\/20\b/g, to: 'border-slate-300' },
    { from: /\bbg-lcu-dark\b/g, to: 'bg-white' },
    { from: /\bbg-slate-900\b/g, to: 'bg-slate-50' },
    { from: /\bbg-slate-800\b/g, to: 'bg-slate-100' },
    { from: /\bborder-slate-700\b/g, to: 'border-slate-300' },
    { from: /\btext-amber-400\b/g, to: 'text-amber-700' },
    { from: /\btext-emerald-400\b/g, to: 'text-emerald-700' },
    { from: /\btext-emerald-200\b/g, to: 'text-emerald-800' },
    { from: /\btext-amber-200\b/g, to: 'text-amber-800' },
    { from: /\btext-red-400\b/g, to: 'text-red-600' },
    { from: /\btext-red-200\b/g, to: 'text-red-800' }
  ];

  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
}

walkDir(directoryPath);
console.log("Refactor complete.");
