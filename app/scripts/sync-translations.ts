import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, "../i18n/locales");
const srcDir = path.resolve(__dirname, "../");

function loadLocale(file: string): Record<string, any> {
  const content = fs.readFileSync(path.join(localesDir, file), "utf-8");
  return JSON.parse(content);
}

function saveLocale(file: string, data: Record<string, any>): void {
  const content = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(path.join(localesDir, file), content, "utf-8");
}

function flatten(
  obj: Record<string, any>,
  prefix = ""
): Record<string, string> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      Object.assign(acc, flatten(value, fullKey));
    } else {
      acc[fullKey] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}

function unflatten(flattened: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(flattened)) {
    const parts = key.split(".");
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
}

function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !["node_modules", ".output", ".nuxt", ".vscode"].includes(entry.name)
    ) {
      return getAllFiles(fullPath);
    }
    if (/\.(vue|ts|js)$/.test(entry.name)) {
      return [fullPath];
    }
    return [];
  });
}

function extractUsedTranslationKeys(content: string): string[] {
  const patterns = [
    /\bt\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /\b\$t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /\bi18n\.t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /\bthis\.\$t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /\buseI18n\(\)\.t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  ];

  const keys = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  return Array.from(keys);
}

function syncTranslations(): void {
  console.log("🔄 Syncing translation files...\n");

  const localeFiles = fs
    .readdirSync(localesDir)
    .filter((f) => f.endsWith(".json"));

  // Load all locales
  const allLocales = localeFiles.reduce((acc, file) => {
    acc[file] = loadLocale(file);
    return acc;
  }, {} as Record<string, Record<string, any>>);

  // Get all used translation keys from source files
  const files = getAllFiles(srcDir);
  const usedKeys = new Set<string>();

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    extractUsedTranslationKeys(content).forEach((key) => usedKeys.add(key));
  });

  console.log(`📊 Found ${usedKeys.size} translation keys in use\n`);

  // Process each locale file
  localeFiles.forEach((file) => {
    console.log(`🔧 Processing ${file}...`);

    const locale = allLocales[file];
    const flattenedLocale = flatten(locale);
    const localeKeys = new Set(Object.keys(flattenedLocale));

    // Find missing keys
    const missingKeys = Array.from(usedKeys).filter((k) => !localeKeys.has(k));

    // Find unused keys
    const unusedKeys = Array.from(localeKeys).filter((k) => !usedKeys.has(k));

    let hasChanges = false;

    // Add missing keys with "MISSING" value
    if (missingKeys.length > 0) {
      console.log(`  ➕ Adding ${missingKeys.length} missing keys:`);
      missingKeys.forEach((key) => {
        console.log(`     + ${key}`);
        flattenedLocale[key] = "MISSING";
      });
      hasChanges = true;
    }

    // Remove unused keys
    if (unusedKeys.length > 0) {
      console.log(`  🗑️  Removing ${unusedKeys.length} unused keys:`);
      unusedKeys.forEach((key) => {
        console.log(`     - ${key}`);
        delete flattenedLocale[key];
      });
      hasChanges = true;
    }

    if (hasChanges) {
      // Convert back to nested structure and save
      const updatedLocale = unflatten(flattenedLocale);
      saveLocale(file, updatedLocale);
      console.log(`  ✅ Updated ${file}`);
    } else {
      console.log(`  ✨ ${file} is already in sync`);
    }

    console.log("");
  });

  console.log("🎉 Translation sync completed!");
}

// Run the sync
syncTranslations();
