const fs = require('fs');
const path = require('path');

const directory = './frontend/src';

const replacements = [
  { regex: /color:\s*['"]#cbd5e1['"]/gi, replacement: "color: 'var(--color-muted)'" },
  { regex: /['"]rgba\(255,\s*255,\s*255,\s*0\.05\)['"]/g, replacement: "'transparent'" },
  { regex: /borderBottom:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.1\)['"]/g, replacement: "borderBottom: '1px solid var(--color-border)'" },
  { regex: /border:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.1\)['"]/g, replacement: "border: '1px solid var(--color-border)'" },
  
  { regex: /color:\s*['"]#ef4444['"]/gi, replacement: "color: 'var(--color-danger)'" },
  { regex: /backgroundColor:\s*['"]#ef4444['"]/gi, replacement: "backgroundColor: 'var(--color-danger)'" },
  { regex: /['"]rgba\(239,\s*68,\s*68,\s*0\.1[25]?\)['"]/g, replacement: "'var(--color-danger-bg)'" },
  
  { regex: /color:\s*['"]#f59e0b['"]/gi, replacement: "color: 'var(--color-warning)'" },
  { regex: /backgroundColor:\s*['"]#f59e0b['"]/gi, replacement: "backgroundColor: 'var(--color-warning)'" },
  { regex: /['"]rgba\(245,\s*158,\s*11,\s*0\.1[25]?\)['"]/g, replacement: "'var(--color-warning-bg)'" },
  
  { regex: /['"]rgba\(21,\s*128,\s*61,\s*0\.1[25]?\)['"]/g, replacement: "'var(--color-success-bg)'" },
  
  { regex: /color:\s*['"]#0ea5e9['"]/gi, replacement: "color: 'var(--color-info)'" },
  { regex: /backgroundColor:\s*['"]#0ea5e9['"]/gi, replacement: "backgroundColor: 'var(--color-info)'" },
  { regex: /['"]rgba\(14,\s*165,\s*233,\s*0\.1[25]?\)['"]/g, replacement: "'var(--color-info-bg)'" },
  
  { regex: /color:\s*['"]#38bdf8['"]/gi, replacement: "color: 'var(--color-info)'" },
  { regex: /backgroundColor:\s*['"]#38bdf8['"]/gi, replacement: "backgroundColor: 'var(--color-info)'" },
  { regex: /['"]rgba\(56,\s*189,\s*248,\s*0\.1[25]?\)['"]/g, replacement: "'var(--color-info-bg)'" },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      replacements.forEach(({ regex, replacement }) => {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

processDirectory(directory);
console.log('More color replacements complete.');
