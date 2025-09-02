// scripts/extract-i18n.ts
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const srcDir = path.resolve(process.cwd(), 'app');
const localesDir = path.resolve(process.cwd(), 'locales');
const languages = ['en', 'th'];

// ฟังก์ชันสำหรับ set nested value
function setNestedValue(obj: any, path: string, value: string): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  if (!current[lastKey]) {
    current[lastKey] = value;
  }
}

function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...getAllKeys(obj[key], currentPath));
      } else {
        keys.push(currentPath);
      }
    }
  }
  
  return keys;
}

// ฟังก์ชันสำหรับแยก string literal ที่ซับซ้อน
function extractStringValue(node: any): string | null {
  if (node.type === 'StringLiteral') {
    return node.value;
  }
  
  if (node.type === 'TemplateLiteral' && node.quasis.length === 1 && node.expressions.length === 0) {
    // Template literal ที่ไม่มี expression เช่น `hello`
    return node.quasis[0].value.raw;
  }
  
  return null;
}

// ฟังก์ชันตรวจสอบว่า key ถูกต้องหรือไม่
function isValidTranslationKey(key: string): boolean {
  if (!key || key.trim() === '') return false;
  if (!/^[a-zA-Z0-9_.-]+$/.test(key)) return false;
  if (key.startsWith('.') || key.endsWith('.')) return false;
  if (key.includes('..')) return false;
  if (key.length < 1) return false;
  if (key.length > 100) return false;
  return true;
}

// ฟังก์ชันเพิ่ม key พร้อมตรวจสอบ
function addKeyIfValid(keys: string[], key: string, source: string, fileName: string): void {
  if (isValidTranslationKey(key)) {
    keys.push(key);
    console.log(`🔑 Found ${source} -> "${key}" in ${fileName}`);
  } else {
    console.log(`❌ Skipped invalid key: "${key}" from ${source} in ${fileName}`);
  }
}

function extractKeysFromFile(filePath: string): string[] {
  const code = fs.readFileSync(filePath, 'utf-8');
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators-legacy'],
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
    });

    const keys: string[] = [];
    const translationNamespaces = new Map<string, string>();
    const importedTranslationFunctions = new Set<string>();

    traverse(ast, {
      ImportDeclaration({ node }) {
        if (
          node.source.value === 'next-intl' ||
          node.source.value === '@/lib/i18n' ||
          node.source.value === '@/hooks/useTranslation'
        ) {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
              importedTranslationFunctions.add(specifier.imported.name);
              console.log(`📦 Found import: ${specifier.imported.name} from ${node.source.value} in ${path.basename(filePath)}`);
            }
          });
        }
      },

      VariableDeclarator({ node }) {
        if (
          node.id.type === 'Identifier' &&
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee.type === 'Identifier'
        ) {
          const calleeName = node.init.callee.name;
          const variableName = node.id.name;
          
          if (
            calleeName === 'useTranslations' ||
            importedTranslationFunctions.has(calleeName)
          ) {
            console.log(`🔍 Processing ${calleeName}() call for variable "${variableName}" in ${path.basename(filePath)}`);
            
            if (node.init.arguments.length > 0) {
              const namespaceValue = extractStringValue(node.init.arguments[0]);
              
              if (namespaceValue) {
                translationNamespaces.set(variableName, namespaceValue);
                console.log(`📝 Found useTranslations: ${variableName} -> namespace "${namespaceValue}" in ${path.basename(filePath)}`);
              } else {
                console.log(`⚠️ Could not extract namespace from ${calleeName}() in ${path.basename(filePath)}`);
              }
            } else {
              translationNamespaces.set(variableName, '');
              console.log(`📝 Found useTranslations: ${variableName} -> default namespace in ${path.basename(filePath)}`);
            }
          }
        }
      },
      
      CallExpression({ node }) {
        if (node.callee.type === 'Identifier' && node.arguments.length > 0) {
          const functionName = node.callee.name;
          const firstArg = node.arguments[0];
          const keyValue = extractStringValue(firstArg);
          
          if (keyValue) {
            if (functionName === 't') {
              addKeyIfValid(keys, keyValue, `t('${keyValue}')`, path.basename(filePath));
            }
            else if (translationNamespaces.has(functionName)) {
              const namespace = translationNamespaces.get(functionName)!;
              const fullKey = namespace ? `${namespace}.${keyValue}` : keyValue;
              addKeyIfValid(keys, fullKey, `${functionName}('${keyValue}')`, path.basename(filePath));
            }
          }
        }
        
        if (node.callee.type === 'MemberExpression' && node.arguments.length > 0) {
          const object = node.callee.object;
          const property = node.callee.property;
          const firstArg = node.arguments[0];
          const keyValue = extractStringValue(firstArg);
          
          if (keyValue && object.type === 'Identifier') {
            const objectName = object.name;
            if (translationNamespaces.has(objectName)) {
              const namespace = translationNamespaces.get(objectName)!;
              const fullKey = namespace ? `${namespace}.${keyValue}` : keyValue;
              if (property.type === 'Identifier' && property.name !== 'call') {
                const methodInfo = property.name === 'rich' ? 'rich' : property.name;
                addKeyIfValid(keys, fullKey, `${objectName}.${methodInfo}('${keyValue}')`, path.basename(filePath));
              } else {
                addKeyIfValid(keys, fullKey, `${objectName}('${keyValue}')`, path.basename(filePath));
              }
            }
          }
        }
      },
      
      JSXAttribute({ node }) {
        if (node.value?.type === 'StringLiteral') {
          if (['id', 'placeholder', 'title', 'aria-label', 'data-key'].includes(node.name.name as string)) {
            const value = node.value.value;
            if (value.includes('.') || value.match(/^[a-zA-Z][a-zA-Z0-9_]*$/)) {
              addKeyIfValid(keys, value, `JSX ${node.name.name}="${value}"`, path.basename(filePath));
            }
          }
        }
        
        if (node.value?.type === 'JSXExpressionContainer') {
          const expression = node.value.expression;
          if (expression.type === 'CallExpression' && expression.callee.type === 'Identifier') {
            const functionName = expression.callee.name;
            const firstArg = expression.arguments[0];
            const keyValue = extractStringValue(firstArg);
            
            if (keyValue && translationNamespaces.has(functionName)) {
              const namespace = translationNamespaces.get(functionName)!;
              const fullKey = namespace ? `${namespace}.${keyValue}` : keyValue;
              addKeyIfValid(keys, fullKey, `JSX {${functionName}('${keyValue}')}`, path.basename(filePath));
            }
          }
        }
      },

      JSXText({ node }) {
        const text = node.value.trim();
        if (text && text.match(/^[a-zA-Z][a-zA-Z0-9_.]*$/) && text.includes('.')) {
          addKeyIfValid(keys, text, `JSX text "${text}"`, path.basename(filePath));
        }
      },

      ObjectExpression({ node }) {
        node.properties.forEach(prop => {
          if (prop.type === 'ObjectProperty' && prop.value.type === 'StringLiteral') {
            const value = prop.value.value;
            if (value.includes('.') && value.match(/^[a-zA-Z][a-zA-Z0-9_.]*$/)) {
              addKeyIfValid(keys, value, `object property "${value}"`, path.basename(filePath));
            }
          }
        });
      }
    });

    return [...new Set(keys)];
  } catch (error: any) {
    console.warn(`❌ Could not parse file ${filePath}:`, error.message);
    return [];
  }
}

console.log('🔍 Scanning files...');

const patterns = [
  'app/**/*.{ts,tsx,js,jsx}',
  'src/**/*.{ts,tsx,js,jsx}', 
  'src/app/**/*.{ts,tsx,js,jsx}',   // ✅ เพิ่มสำหรับ dynamic routes เช่น [locale]
  'components/**/*.{ts,tsx,js,jsx}',
  'pages/**/*.{ts,tsx,js,jsx}'
];

let files: string[] = [];
patterns.forEach(pattern => {
  const foundFiles = glob.sync(pattern);
  files = [...files, ...foundFiles];
});

files = [...new Set(files)];

const allKeys = new Set<string>();

console.log(`Found ${files.length} files to scan\n`);

if (files.length === 0) {
  console.log('⚠️ No files found! Please check your project structure.');
  console.log('Current working directory:', process.cwd());
  console.log('Looking for files in patterns:', patterns);
  process.exit(1);
}

files.forEach((file, index) => {
  console.log(`\n🔍 [${index + 1}/${files.length}] Processing: ${path.relative(process.cwd(), file)}`);
  const keys = extractKeysFromFile(file);
  keys.forEach(key => allKeys.add(key));
  
  if (keys.length > 0) {
    console.log(`   ✅ Extracted ${keys.length} keys from this file`);
  } else {
    console.log(`   ⚪ No keys found in this file`);
  }
});

console.log(`\n🎉 Found ${allKeys.size} unique keys total from ${files.length} files\n`);

if (allKeys.size > 0) {
  console.log('📋 All extracted keys:');
  [...allKeys].sort().forEach(key => {
    console.log(`   • ${key}`);
  });
  console.log('');
}

languages.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  let existing: Record<string, any> = {};

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (content) {
      try {
        existing = JSON.parse(content);
      } catch (e) {
        console.warn(`⚠️ Warning: invalid JSON in ${filePath}, resetting`);
        existing = {};
      }
    }
  } else {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  const updatedTranslations: Record<string, any> = JSON.parse(JSON.stringify(existing));
  let newKeysCount = 0;
  
  allKeys.forEach(key => {
    const existingValue = getNestedValue(updatedTranslations, key);
    if (existingValue === undefined) {
      newKeysCount++;
      const defaultValue = lang === 'en' ? key.split('.').pop() || key : `[${key}]`;
      setNestedValue(updatedTranslations, key, defaultValue);
    }
  });

  const totalKeys = getAllKeys(updatedTranslations);

  fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2), 'utf-8');
  
  if (newKeysCount > 0) {
    console.log(`📝 Updated ${filePath} with ${newKeysCount} new keys (total: ${totalKeys.length} keys)`);
  } else {
    console.log(`✅ ${filePath} is up to date (${totalKeys.length} keys)`);
  }
});

console.log('\n✅ i18n extraction completed!');

function validateTranslationStructure() {
  const structures: Record<string, string[]> = {};
  
  languages.forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        structures[lang] = getAllKeys(content).sort();
      } catch (error: any) {
        console.warn(`⚠️ Warning: Could not validate ${lang}.json:`, error.message);
      }
    }
  });

  const languageKeys = Object.keys(structures);
  if (languageKeys.length > 1) {
    const baseKeys = structures[languageKeys[0]];
    const missingKeys: Record<string, string[]> = {};
    
    languageKeys.slice(1).forEach(lang => {
      const currentKeys = structures[lang];
      const missing = baseKeys.filter(key => !currentKeys.includes(key));
      const extra = currentKeys.filter(key => !baseKeys.includes(key));
      
      if (missing.length > 0 || extra.length > 0) {
        missingKeys[lang] = [];
        if (missing.length > 0) {
          missingKeys[lang].push(`Missing: ${missing.join(', ')}`);
        }
        if (extra.length > 0) {
          missingKeys[lang].push(`Extra: ${extra.join(', ')}`);
        }
      }
    });

    if (Object.keys(missingKeys).length > 0) {
      console.log('\n⚠️ Translation structure mismatch:');
      Object.entries(missingKeys).forEach(([lang, issues]) => {
        console.log(`   ${lang}: ${issues.join(' | ')}`);
      });
    } else {
      console.log('\n✅ All translation files have matching structure');
    }
  }
}

validateTranslationStructure();

