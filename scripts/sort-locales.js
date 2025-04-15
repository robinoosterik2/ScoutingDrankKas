import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../locales');

// Function to recursively sort object keys alphabetically
const sortObjectKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj;
  }

  // Sort keys case-insensitively
  const sortedKeys = Object.keys(obj).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const sortedObj = {};

  sortedKeys.forEach(key => {
    sortedObj[key] = sortObjectKeys(obj[key]); // Recursively sort nested objects
  });

  return sortedObj;
};

// Main async function to handle file processing
const sortLocales = async () => {
  try {
    const files = await fs.readdir(localesDir);

    // Filter for JSON files
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

    if (jsonFiles.length === 0) {
      console.log('No JSON locale files found in', localesDir);
      return;
    }

    console.log(`Found ${jsonFiles.length} locale file(s) to sort.`);

    // Process each JSON file
    for (const file of jsonFiles) {
      const filePath = path.join(localesDir, file);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const jsonObj = JSON.parse(data);
        const sortedJsonObj = sortObjectKeys(jsonObj);
        const sortedJsonString = JSON.stringify(sortedJsonObj, null, 2); // Pretty print with 2 spaces

        // Write the sorted JSON back to the file
        await fs.writeFile(filePath, sortedJsonString + '\n', 'utf8');
        console.log(`Successfully sorted and saved ${file}`);
      } catch (err) {
        if (err instanceof SyntaxError) {
          console.error(`Error parsing JSON in file ${file}:`, err);
        } else {
          console.error(`Error processing file ${file}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Error reading locales directory:', err);
  }
};

// Run the script
sortLocales();