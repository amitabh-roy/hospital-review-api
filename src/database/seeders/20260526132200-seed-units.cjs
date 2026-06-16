'use strict';

/** Care units / departments — aligned with Hospital-Profile.html filter options. */
const UNITS = [
  { id: 1, name: 'ICU / Critical Care' },
  { id: 2, name: 'Emergency' },
  { id: 3, name: 'Telemetry' },
  { id: 4, name: 'Med-Surg' },
  { id: 5, name: 'Labor & Delivery' },
  { id: 6, name: 'NICU' },
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

const UNIT_IDS = UNITS.map((unit) => unit.id);

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

async function existsById(queryInterface, tableName, id) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id FROM "${tableName}" WHERE id = :id LIMIT 1`,
    { replacements: { id } },
  );

  return rows.length > 0;
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    for (const unit of UNITS) {
      if (await existsById(queryInterface, 'units', unit.id)) {
        continue;
      }

      await queryInterface.bulkInsert('units', [unit]);
    }

    await resetSequence(queryInterface, 'units');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('units', { id: UNIT_IDS }, {});
  },
};
