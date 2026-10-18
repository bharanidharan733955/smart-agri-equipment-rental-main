const fs = require('fs');
const path = require('path');

const directory = './frontend/src';

const replacements = [
  { regex: /['"]rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)['"]/g, replacement: "'var(--color-border)'" },
  { regex: /['"]rgba\(0,\s*0,\s*0,\s*0\.[0-9]+\)['"]/g, replacement: "'rgba(0,0,0,0.5)'" },
  { regex: /['"]rgba\(8,\s*14,\s*28,\s*0\.[0-9]+\)['"]/g, replacement: "'var(--color-surface)'" },
  { regex: /color:\s*['"]#cbd5e1['"]/gi, replacement: "color: 'var(--color-muted)'" },
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
      
      // Also replace inline border logic
      const borderRegex = /border:\s*['"]1px solid rgba\([^\)]+\)['"]/g;
      if (borderRegex.test(content)) {
        content = content.replace(borderRegex, "border: '1px solid var(--color-border)'");
        modified = true;
      }
      
      const borderBottomRegex = /borderBottom:\s*['"]1px solid rgba\([^\)]+\)['"]/g;
      if (borderBottomRegex.test(content)) {
        content = content.replace(borderBottomRegex, "borderBottom: '1px solid var(--color-border)'");
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated borders and rgba: ${filePath}`);
      }
    }
  }
}

processDirectory(directory);
console.log('Done cleaning borders and rgba.');
