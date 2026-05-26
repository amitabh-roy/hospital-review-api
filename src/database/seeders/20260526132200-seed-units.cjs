'use strict';

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('units', [
      { id: 1, name: 'ICU' },
      { id: 2, name: 'Emergency Department' },
      { id: 3, name: 'Telemetry' },
      { id: 4, name: 'Med-Surg' },
      { id: 5, name: 'Labor and Delivery' },
      { id: 6, name: 'NICU' },
    ]);

    await resetSequence(queryInterface, 'units');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('units', { id: [1, 2, 3, 4, 5, 6] }, {});
  },
};
