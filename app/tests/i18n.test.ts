import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { Warning } from "postcss";

const localesDir = path.resolve(__dirname, "../i18n/locales");
const srcDir = path.resolve(__dirname, "../");

function loadLocale(file: string): Record<string, any> {
  const content = fs.readFileSync(path.join(localesDir, file), "utf-8");
  return JSON.parse(content);
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
    /\bt\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}\s*\)/g,
    /\b\$t\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}\s*\)/g,
    /\bi18n\.t\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}\s*\)/g,
    /\bthis\.\$t\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}\s*\)/g,
    /\buseI18n\(\)\.t\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}\s*\)/g,
  ];

  const keys = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }

  const complexPatterns = [
    /\?\s*\$t\(\s*['"`]([^'"`]+)['"`](?:\s*,\s*\{[^}]*\})?\s*\)\s*:\s*\$t\(\s*['"`]([^'"`]+)['"`](?:\s*,\s*\{[^}]*\})?\s*\)/g,
    /\?\s*t\(\s*['"`]([^'"`]+)['"`](?:\s*,\s*\{[^}]*\})?\s*\)\s*:\s*t\(\s*['"`]([^'"`]+)['"`](?:\s*,\s*\{[^}]*\})?\s*\)/g,
  ];

  for (const pattern of complexPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
      keys.add(match[2]);
    }
  }

  return Array.from(keys);
}

describe("Translation key usage vs locale definitions", () => {
  const localeFiles = fs
    .readdirSync(localesDir)
    .filter((f) => f.endsWith(".json"));
  const allLocales = localeFiles.reduce((acc, file) => {
    acc[file] = flatten(loadLocale(file));
    return acc;
  }, {} as Record<string, Record<string, string>>);

  const files = getAllFiles(srcDir);
  const usedKeys = new Set<string>();

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    extractUsedTranslationKeys(content).forEach((key) => usedKeys.add(key));
  });

  localeFiles.forEach((file) => {
    const locale = allLocales[file];
    const localeKeys = new Set(Object.keys(locale));

    it(`should not use translation keys that are missing from ${file}`, () => {
      const missingKeys = Array.from(usedKeys).filter(
        (k) => !localeKeys.has(k)
      );
      if (missingKeys.length > 0) {
        console.log(`\n❌ Missing translation keys in ${file}:`);
        missingKeys.forEach((k) => console.log(`  - ${k}`));
        throw new Error(
          `Missing ${missingKeys.length} translation key(s) in ${file}`
        );
      }
      expect(missingKeys).toEqual([]);
    });

    it(`should not have unused keys in ${file}`, () => {
      const unusedKeys = Array.from(localeKeys).filter((k) => !usedKeys.has(k));
      if (unusedKeys.length > 0) {
        console.log(`\n⚠️ Unused translation keys in ${file}:`);
        unusedKeys.forEach((k) => console.log(`  + ${k}`));
        throw new Warning(
          `Found ${unusedKeys.length} unused translation key(s) in ${file}`
        );
      }
      expect(unusedKeys).toEqual([]);
    });
  });
});
