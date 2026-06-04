'use strict';

/**
 * Run after the original unit seed on an existing database:
 *   npx sequelize-cli db:seed --seed 20260604130000-add-extended-units.cjs \
 *     --config src/database/sequelize-cli.config.cjs --seeders-path src/database/seeders
 *
 * Or use a full reseed: npm run db:seed:undo:all && npm run db:seed
 */

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

const HOSPITAL_IDS = [1, 2, 3];

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    for (const unit of RENAMED_UNITS) {
      await queryInterface.bulkUpdate('units', { name: unit.name }, { id: unit.id });
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
    await queryInterface.bulkDelete('units', { id: NEW_UNITS.map((u) => u.id) }, {});

    const legacyNames = [
      { id: 1, name: 'ICU' },
      { id: 2, name: 'Emergency Department' },
      { id: 3, name: 'Telemetry' },
      { id: 4, name: 'Med-Surg' },
      { id: 5, name: 'Labor and Delivery' },
      { id: 6, name: 'NICU' },
    ];

    for (const unit of legacyNames) {
      await queryInterface.bulkUpdate('units', { name: unit.name }, { id: unit.id });
    }

    await queryInterface.bulkDelete(
      'hospital_units',
      { unit_id: NEW_UNITS.map((u) => u.id) },
      {},
    );
  },
};
