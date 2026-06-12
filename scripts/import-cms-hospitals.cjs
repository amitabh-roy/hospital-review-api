#!/usr/bin/env node
'use strict';

/**
 * Bulk import CMS Hospital Compare hospitals from CSV.
 *
 * Usage:
 *   node scripts/import-cms-hospitals.cjs --file /path/to/hospitals.csv
 *
 * Expected columns (header names are flexible):
 *   - Facility ID / CMS Certification Number / cms_id
 *   - Facility Name / hospital_name / name
 *   - City/Town / city
 *   - State / state
 *   - Hospital Type / facility_type (optional; defaults to "General Acute Care Hospital")
 */

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

function parseArgs(argv) {
  const fileIndex = argv.indexOf('--file');
  const file = fileIndex >= 0 ? argv[fileIndex + 1] : null;

  if (!file) {
    console.error('Missing --file <path-to-csv>');
    process.exit(1);
  }

  return { file: path.resolve(file) };
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function pick(row, aliases, fallback = '') {
  for (const alias of aliases) {
    if (row[alias]) return row[alias];
  }

  return fallback;
}

function mapRow(headers, values) {
  const row = {};
  headers.forEach((header, index) => {
    row[header] = (values[index] ?? '').trim();
  });

  const cmsId = pick(row, [
    'facility_id',
    'cms_certification_number_ccn',
    'cms_certification_number',
    'cms_id',
    'provider_id',
  ]);
  const name = pick(row, ['facility_name', 'hospital_name', 'name']);
  const city = pick(row, ['city_town', 'city']);
  const state = pick(row, ['state']);
  const facilityType = pick(row, [
    'hospital_type',
    'facility_type',
    'type_of_facility',
  ], 'General Acute Care Hospital');

  if (!cmsId || !name || !city || !state) {
    return null;
  }

  return {
    cms_id: cmsId,
    name: name.slice(0, 255),
    city: city.slice(0, 100),
    state: state.slice(0, 100),
    facility_type: facilityType.slice(0, 120),
    average_rating: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

async function main() {
  const { file } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hospital_review',
    logging: false,
  });

  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    console.error('CSV must include a header row and at least one data row.');
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const mapped = mapRow(headers, parseCsvLine(lines[i]));
    if (mapped) rows.push(mapped);
  }

  console.log(`Parsed ${rows.length} hospital rows from ${file}`);

  const chunkSize = 500;
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);

    for (const row of chunk) {
      const [result, created] = await sequelize.query(
        `
          INSERT INTO hospitals (cms_id, name, city, state, facility_type, average_rating, created_at, updated_at)
          VALUES (:cms_id, :name, :city, :state, :facility_type, :average_rating, :created_at, :updated_at)
          ON CONFLICT (cms_id)
          DO UPDATE SET
            name = EXCLUDED.name,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            facility_type = EXCLUDED.facility_type,
            updated_at = EXCLUDED.updated_at
          RETURNING (xmax = 0) AS inserted
        `,
        {
          replacements: row,
          type: Sequelize.QueryTypes.SELECT,
        },
      );

      if (result?.inserted) inserted += 1;
      else updated += 1;
    }

    console.log(`Processed ${Math.min(i + chunkSize, rows.length)} / ${rows.length}`);
  }

  await sequelize.close();
  console.log(`Import complete. inserted=${inserted}, updated=${updated}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
