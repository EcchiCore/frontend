import fs from 'fs';
import path from 'path';

// Regex to detect Thai characters
const THAI_REGEX = /[\u0E00-\u0E7F]/;

function scanDirectory(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      // Exclude files in src/messages or src/i18n just in case
      if (!filePath.includes('/messages/') && !filePath.includes('/i18n/')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const dirsToScan = [
  path.join(process.cwd(), 'src', 'app'),
  path.join(process.cwd(), 'src', 'components')
];

let foundWarnings = false;

console.log('🔍 Scanning for hardcoded Thai text (i18n readiness check)...');

for (const dir of dirsToScan) {
  const files = scanDirectory(dir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    let hasThai = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Basic check to ignore simple comments
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
      
      if (THAI_REGEX.test(line)) {
        if (!hasThai) {
           console.warn(`\n⚠️  [Warning] Hardcoded text found in: ${path.relative(process.cwd(), file)}`);
           hasThai = true;
           foundWarnings = true;
        }
        console.warn(`   Line ${i + 1}: ${trimmed}`);
      }
    }
  }
}

if (foundWarnings) {
  console.log('\n💡 Tip: Consider moving these hardcoded texts to your i18n JSON files to fully support multiple languages.');
  console.log('✅ This is just a warning. The build will proceed normally.\n');
} else {
  console.log('✅ No hardcoded Thai text found. Good job!\n');
}

// ALWAYS exit with 0 so it doesn't break the build
process.exit(0);
