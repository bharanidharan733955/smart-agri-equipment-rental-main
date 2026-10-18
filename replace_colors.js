const fs = require('fs');
const path = require('path');

const directory = './frontend/src';

const replacements = [
  { regex: /backgroundColor:\s*['"]#0b1324['"]/g, replacement: "backgroundColor: 'var(--color-background)'" },
  { regex: /backgroundColor:\s*['"]#0c162c['"]/g, replacement: "backgroundColor: 'var(--color-surface)'" },
  { regex: /backgroundColor:\s*['"]#131d35['"]/g, replacement: "backgroundColor: 'var(--color-surface)'" },
  { regex: /backgroundColor:\s*['"]#0f172a['"]/g, replacement: "backgroundColor: 'var(--color-surface)'" },
  { regex: /backgroundColor:\s*['"]rgba\(11,\s*19,\s*36,\s*0\.9\)['"]/g, replacement: "backgroundColor: 'var(--color-surface)'" },
  { regex: /backgroundColor:\s*['"]rgba\(11, 19, 36, 0\.98\)['"]/g, replacement: "backgroundColor: 'var(--color-surface)'" },
  
  { regex: /color:\s*['"]#ffffff['"]/gi, replacement: "color: 'var(--color-text)'" },
  { regex: /color:\s*['"]#fff['"]/gi, replacement: "color: 'var(--color-text)'" },
  { regex: /color:\s*['"]#94a3b8['"]/gi, replacement: "color: 'var(--color-muted)'" },
  { regex: /color:\s*['"]#64748b['"]/gi, replacement: "color: 'var(--color-muted)'" },
  
  { regex: /borderBottom:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.0[68]\)['"]/g, replacement: "borderBottom: '1px solid var(--color-border)'" },
  { regex: /borderRight:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.0[68]\)['"]/g, replacement: "borderRight: '1px solid var(--color-border)'" },
  { regex: /border:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.0[67]\)['"]/g, replacement: "border: '1px solid var(--color-border)'" },
  
  { regex: /#10b981/gi, replacement: "var(--color-primary)" },
  { regex: /rgba\(16,\s*185,\s*129/gi, replacement: "rgba(21, 128, 61" }, // Map old green to new primary
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
console.log('Color replacements complete.');
