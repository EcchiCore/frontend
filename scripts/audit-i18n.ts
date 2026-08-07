import fs from 'fs';
import path from 'path';
import { franc } from 'franc';
import { loadModule } from 'cld3-asm';

// Load CLD3 WASM module asynchronously
const cldFactory = await loadModule();

const messagesDir = path.join(process.cwd(), 'src', 'messages');
const baseLocale = 'en';
const targetLocales = ['th', 'es'];

// Mapping CLD3 & Franc language codes to expected ISO codes
const expectedCodes: Record<string, string[]> = {
  th: ['th', 'tha', 'Thai'],
  // Short Spanish phrases often get classified as related Romance/Iberian languages (Galician, Portuguese, Catalan, Italian, Venetian) by Franc/CLD3
  es: ['es', 'spa', 'Spanish', 'glg', 'por', 'cat', 'ita', 'ast', 'ext', 'vec', 'epo', 'fuv', 'src', 'toi'],
  en: ['en', 'eng', 'English']
};

function cleanTextForDetection(text: string): string {
  // Strip variables like {name}, {count}, HTML tags, URLs, numbers, technical brands
  return text
    .replace(/\{[^}]+\}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\b(ChanomHub|Chanom|ChanoX2|ChanoLite|NST|Stripe|Discord|Patreon|Google|AppImage|Linux|Windows|macOS|Android|iOS|RPG|Unity|Godot|Unreal|Ren'Py|APK|ZIP|TTF|OTF|WOFF2?|RSS|GPU|CPU|RAM|GB|MB|ID|URL|API|VIP)\b/gi, '')
    .replace(/[0-9\s%+฿.#\-\/\\_:\(\)\[\]"'`!?★🚨✅ℹ✓]+/, '')
    .trim();
}

function detectLanguage(text: string): { lang: string; method: string } {
  const cleaned = cleanTextForDetection(text);
  if (!cleaned || cleaned.length < 3) {
    return { lang: 'unknown', method: 'too_short' };
  }

  // Use franc for longer strings (> 20 chars), cld3 for short phrases
  if (cleaned.length > 20) {
    const francCode = franc(cleaned); // Returns 3-letter ISO 639-3 code (e.g. 'spa', 'tha', 'eng')
    if (francCode !== 'und') {
      return { lang: francCode, method: 'franc' };
    }
  }

  // Fallback or short string check using CLD3
  const cldIdentifier = cldFactory.create(0, 100);
  const result = cldIdentifier.findLanguage(cleaned);
  cldIdentifier.dispose();

  if (result && result.is_reliable && result.language) {
    return { lang: result.language, method: 'cld3' };
  }

  return { lang: 'unknown', method: 'none' };
}

// Forbidden language leakage per target locale
const forbiddenLeakedLanguages: Record<string, string[]> = {
  th: ['en', 'eng', 'es', 'spa'],
  es: ['en', 'eng', 'th', 'tha'],
  en: ['th', 'tha', 'es', 'spa']
};

let hasWarnings = false;
console.log('🔍 Starting i18n Language & Translation Quality Audit...\n');

// 1. Audit Message JSON files across locales
for (const locale of targetLocales) {
  const localeDir = path.join(messagesDir, locale);
  if (!fs.existsSync(localeDir)) continue;

  console.log(`--- Checking Locale: [${locale.toUpperCase()}] ---`);
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
  const forbidden = forbiddenLeakedLanguages[locale] || [];

  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(localeDir, file), 'utf-8'));

    function auditKeys(obj: any, prefix = '') {
      if (typeof obj === 'string') {
        const cleaned = cleanTextForDetection(obj);
        if (cleaned.length >= 6) {
          const { lang, method } = detectLanguage(cleaned);
          if (forbidden.includes(lang)) {
            // Unwanted language leak detected
            console.warn(`  ⚠️  [${locale}/${file}] Key '${prefix}' (${method}): Leaked '${lang}' text in ${locale.toUpperCase()} translation`);
            console.warn(`      Text: "${obj.length > 60 ? obj.substring(0, 60) + '...' : obj}"`);
            hasWarnings = true;
          }
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [k, v] of Object.entries(obj)) {
          auditKeys(v, prefix ? `${prefix}.${k}` : k);
        }
      }
    }

    auditKeys(content);
  }
}

// 2. Scan TSX components for hardcoded Thai & untranslated text with Regex
const scanDirs = [
  path.join(process.cwd(), 'src', 'app'),
  path.join(process.cwd(), 'src', 'components')
];

const THAI_REGEX = /[\u0E00-\u0E7F]/;

function scanDirectory(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (!fullPath.includes('/messages/') && !fullPath.includes('/i18n/')) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

console.log('\n🔍 Scanning TSX source code for hardcoded text (Regex)...');

for (const dir of scanDirs) {
  const files = scanDirectory(dir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      if (THAI_REGEX.test(line)) {
        console.warn(`  ⚠️  Hardcoded Thai in ${path.relative(process.cwd(), file)}:L${idx + 1}`);
        console.warn(`      Line: "${trimmed}"`);
        hasWarnings = true;
      }
    });
  }
}

if (!hasWarnings) {
  console.log('\n✅ i18n Audit Passed! All translations and components look good.');
} else {
  console.log('\n💡 Audit finished with warnings. Review matched items above.');
}
