import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const localesDir = path.resolve(__dirname, '../locales');
const baseLang = 'en';

function loadLocale(file: string): Record<string, any> {
	const content = fs.readFileSync(path.join(localesDir, file), 'utf-8');
	return JSON.parse(content);
}

function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (typeof value === 'object' && value !== null) {
			Object.assign(acc, flatten(value, fullKey));
		} else {
			acc[fullKey] = value;
		}
		return acc;
	}, {} as Record<string, string>);
}

describe('i18n translation consistency', () => {
	const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
	const baseFile = `${baseLang}.json`;
	const base = flatten(loadLocale(baseFile));
	const baseKeys = Object.keys(base);

	for (const file of files) {
		if (file === baseFile) continue;

		it(`${file} should have exactly the same keys as ${baseFile}`, () => {
			const other = flatten(loadLocale(file));
			const otherKeys = Object.keys(other);

			const missingKeys = baseKeys.filter(k => !otherKeys.includes(k));
			const extraKeys = otherKeys.filter(k => !baseKeys.includes(k));

			if (missingKeys.length > 0 || extraKeys.length > 0) {
				let message = '';
				if (missingKeys.length > 0) {
					message += `\n❌ Missing keys in ${file}:\n` + missingKeys.map(k => `  - ${k}`).join('\n');
				}
				if (extraKeys.length > 0) {
					message += `\n❌ Extra keys in ${file}:\n` + extraKeys.map(k => `  + ${k}`).join('\n');
				}
				throw new Error(message);
			}

			expect(otherKeys.sort()).toEqual(baseKeys.sort());
		});
	}
});
