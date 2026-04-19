import fs from 'fs';
import path from 'path';

function getMissingKeys(baseObj: any, targetObj: any, prefix = ''): string[] {
  let missing: string[] = [];
  
  if (!baseObj || typeof baseObj !== 'object') return missing;
  if (!targetObj || typeof targetObj !== 'object') {
     return Object.keys(baseObj).map(k => prefix + k);
  }

  for (const key of Object.keys(baseObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!(key in targetObj)) {
      missing.push(fullKey);
    } else if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
      missing = missing.concat(getMissingKeys(baseObj[key], targetObj[key], `${fullKey}.`));
    }
  }
  
  return missing;
}

const messagesDir = path.join(process.cwd(), 'src', 'messages');
const baseLocale = 'en';

// Automatically detect all language directories in src/messages/
const localesToCheck = fs.readdirSync(messagesDir).filter(item => {
  const isDirectory = fs.statSync(path.join(messagesDir, item)).isDirectory();
  return isDirectory && item !== baseLocale;
});

let hasError = false;

console.log('🔍 Checking translations for missing keys...');

for (const locale of localesToCheck) {
  const baseLocaleDir = path.join(messagesDir, baseLocale);
  const targetLocaleDir = path.join(messagesDir, locale);

  if (!fs.existsSync(targetLocaleDir)) {
    console.error(`❌ Locale directory not found: ${targetLocaleDir}`);
    hasError = true;
    continue;
  }

  const files = fs.readdirSync(baseLocaleDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const basePath = path.join(baseLocaleDir, file);
    const targetPath = path.join(targetLocaleDir, file);

    const baseData = JSON.parse(fs.readFileSync(basePath, 'utf-8'));
    
    if (!fs.existsSync(targetPath)) {
      console.error(`❌ [${locale}] Missing file: ${file}`);
      hasError = true;
      continue;
    }

    const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    
    // Namespace is the filename without .json
    const namespace = file.replace('.json', '');
    const missingKeysInTarget = getMissingKeys(baseData, targetData, namespace);

    if (missingKeysInTarget.length > 0) {
      console.error(`❌ [${locale}] Missing translations in ${file} (found in '${baseLocale}' but not in '${locale}'):`);
      missingKeysInTarget.forEach(k => console.error(`   - ${k}`));
      hasError = true;
    }

    // Check the other way around: keys present in target but missing in base
    const missingKeysInBase = getMissingKeys(targetData, baseData, namespace);

    if (missingKeysInBase.length > 0) {
      console.error(`❌ [${baseLocale}] Missing translations in ${file} (found in '${locale}' but not in '${baseLocale}'):`);
      missingKeysInBase.forEach(k => console.error(`   - ${k}`));
      hasError = true;
    }
  }
}

if (hasError) {
  console.error('\n🚨 Translation check failed! Please add the missing translation keys before building.');
  process.exit(1);
} else {
  console.log('✅ Translation check passed! All keys are present.');
}
