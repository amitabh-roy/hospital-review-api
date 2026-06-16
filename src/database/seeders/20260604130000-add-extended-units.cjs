'use strict';

/**
 * Idempotent additive seeder — safe on fresh and existing databases.
 * Skips rows that already exist. Re-run anytime:
 *   npm run db:seed
 * or:
 *   npx sequelize-cli db:seed --seed 20260604130000-add-extended-units.cjs \
 *     --config src/database/sequelize-cli.config.cjs --seeders-path src/database/seeders
 */

const EXTRA_HOSPITALS = [
  {
    id: 4,
    cms_id: 'CMS-1004',
    name: 'Jackson Memorial Hospital',
    city: 'Miami',
    state: 'Florida',
    facility_type: 'General Acute Care',
    average_rating: 0,
  },
  {
    id: 5,
    cms_id: 'CMS-1005',
    name: 'Jackson Park Hospital',
    city: 'Chicago',
    state: 'Illinois',
    facility_type: 'General Acute Care',
    average_rating: 0,
  },
  {
    id: 6,
    cms_id: 'CMS-1006',
    name: 'Memorial Hermann Texas Medical Center',
    city: 'Houston',
    state: 'Texas',
    facility_type: 'Teaching Hospital',
    average_rating: 0,
  },
  {
    id: 7,
    cms_id: 'CMS-1007',
    name: 'Mayo Clinic Hospital — Rochester',
    city: 'Rochester',
    state: 'Minnesota',
    facility_type: 'Teaching Hospital',
    average_rating: 0,
  },
  {
    id: 8,
    cms_id: 'CMS-1008',
    name: 'Cedars-Sinai Medical Center',
    city: 'Los Angeles',
    state: 'California',
    facility_type: 'General Acute Care',
    average_rating: 0,
  },
  {
    id: 9,
    cms_id: 'CMS-1009',
    name: 'Emory University Hospital',
    city: 'Atlanta',
    state: 'Georgia',
    facility_type: 'Teaching Hospital',
    average_rating: 0,
  },
  {
    id: 10,
    cms_id: 'CMS-1010',
    name: 'Denver Health Medical Center',
    city: 'Denver',
    state: 'Colorado',
    facility_type: 'Safety Net Hospital',
    average_rating: 0,
  },
];

const RENAMED_UNITS = [
  { id: 1, name: 'ICU / Critical Care' },
  { id: 2, name: 'Emergency' },
  { id: 3, name: 'Telemetry' },
  { id: 4, name: 'Med-Surg' },
  { id: 5, name: 'Labor & Delivery' },
  { id: 6, name: 'NICU' },
];

const NEW_UNITS = [
  { id: 7, name: 'Anesthesia' },
  { id: 8, name: 'Behavioral Health' },
  { id: 9, name: 'Case Management / Social Services' },
  { id: 10, name: 'Central Services' },
  { id: 11, name: 'Laboratory' },
  { id: 12, name: 'Med-Surg / Telemetry' },
  { id: 13, name: 'Occupational Health' },
  { id: 14, name: 'Outpatient / Clinic' },
  { id: 15, name: 'Pediatrics' },
  { id: 16, name: 'Peri-Op / OR' },
  { id: 17, name: 'Pharmacy' },
  { id: 18, name: 'Radiology & Imaging' },
  { id: 19, name: 'Rehab & Therapy' },
  { id: 20, name: 'Skilled Nursing Facility (SNF)' },
  { id: 21, name: 'Specialized' },
  { id: 22, name: 'Stepdown / IMC / PCU' },
  { id: 23, name: 'Urgent Care' },
  { id: 24, name: 'Wound Care' },
  { id: 25, name: 'Other' },
];

const HOSPITAL_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const EXTRA_HOSPITAL_IDS = EXTRA_HOSPITALS.map((hospital) => hospital.id);

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

async function hospitalExists(queryInterface, hospital) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id FROM hospitals WHERE id = :id OR cms_id = :cmsId LIMIT 1`,
    { replacements: { id: hospital.id, cmsId: hospital.cms_id } },
  );

  return rows.length > 0;
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    for (const hospital of EXTRA_HOSPITALS) {
      if (await hospitalExists(queryInterface, hospital)) {
        continue;
      }

      await queryInterface.bulkInsert('hospitals', [
        {
          ...hospital,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    await resetSequence(queryInterface, 'hospitals');

    for (const unit of RENAMED_UNITS) {
      await queryInterface.bulkUpdate(
        'units',
        { name: unit.name },
        { id: unit.id },
      );
    }

    const [existingNew] = await queryInterface.sequelize.query(
      `SELECT id FROM units WHERE id = 7 LIMIT 1`,
    );

    if (existingNew.length === 0) {
      await queryInterface.bulkInsert('units', NEW_UNITS);
      await resetSequence(queryInterface, 'units');
    }

    for (const hospitalId of HOSPITAL_IDS) {
      for (const unit of [...RENAMED_UNITS, ...NEW_UNITS]) {
        const [rows] = await queryInterface.sequelize.query(
          `SELECT id FROM hospital_units WHERE hospital_id = :hospitalId AND unit_id = :unitId LIMIT 1`,
          { replacements: { hospitalId, unitId: unit.id } },
        );

        if (rows.length === 0) {
          await queryInterface.bulkInsert('hospital_units', [
            { hospital_id: hospitalId, unit_id: unit.id },
          ]);
        }
      }
    }

    await resetSequence(queryInterface, 'hospital_units');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'hospital_units',
      { hospital_id: EXTRA_HOSPITAL_IDS },
      {},
    );
    await queryInterface.bulkDelete(
      'hospitals',
      { id: EXTRA_HOSPITAL_IDS },
      {},
    );

    await queryInterface.bulkDelete(
      'units',
      { id: NEW_UNITS.map((u) => u.id) },
      {},
    );

    const legacyNames = [
      { id: 1, name: 'ICU' },
      { id: 2, name: 'Emergency Department' },
      { id: 3, name: 'Telemetry' },
      { id: 4, name: 'Med-Surg' },
      { id: 5, name: 'Labor and Delivery' },
      { id: 6, name: 'NICU' },
    ];

    for (const unit of legacyNames) {
      await queryInterface.bulkUpdate(
        'units',
        { name: unit.name },
        { id: unit.id },
      );
    }

    await queryInterface.bulkDelete(
      'hospital_units',
      { unit_id: NEW_UNITS.map((u) => u.id) },
      {},
    );
  },
};
