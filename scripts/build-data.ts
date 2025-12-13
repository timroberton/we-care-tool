import { readFileSync, writeFileSync } from 'fs';
import Papa from 'papaparse';
import { importParametersFromCSV } from '../src/utils/csv_import.ts';

const csvPath = './data/all.csv';
const jsonPath = './public/data/all.json';

const csvContent = readFileSync(csvPath, 'utf-8');

const parsed = Papa.parse(csvContent, {
  skipEmptyLines: true,
});

const rows = parsed.data as string[][];

if (rows.length < 4) {
  throw new Error('CSV must have at least 4 rows: header, labels, countries, and data');
}

const headers = rows[0];
const labels = rows[1];
const countries = rows[2];
const dataRows = rows.slice(3);

// First two columns are parameter_id and label
const dataSourceColumns: { index: number; id: string; label: string; country?: string }[] = [];
for (let i = 2; i < headers.length; i++) {
  const id = headers[i]?.trim();
  const label = labels[i]?.trim();
  const country = countries[i]?.trim() || undefined;
  if (id && label) {
    dataSourceColumns.push({ index: i, id, label, country });
  }
}

const dataSources = dataSourceColumns.map(({ index, id, label, country }) => {
  // Build a mini CSV with parameter_id,BASE columns
  const miniCsvLines = ['parameter_id,BASE'];

  for (const row of dataRows) {
    const parameterId = row[0]?.trim();
    if (!parameterId) continue;

    const value = row[index]?.trim();
    if (!value) {
      throw new Error(`Missing value for ${parameterId} in column ${id}`);
    }

    // Quote the value to preserve commas in numbers like "1,120,883"
    miniCsvLines.push(`${parameterId},"${value}"`);
  }

  const miniCsv = miniCsvLines.join('\n');

  // Use the same import function as user CSV uploads
  const parameters = importParametersFromCSV(miniCsv);

  return {
    id,
    label,
    country,
    parameters
  };
});

// Sort alphabetically by label
dataSources.sort((a, b) => a.label.localeCompare(b.label));

const output = { dataSources };

writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`✓ Generated ${jsonPath} with ${dataSources.length} data sources`);
