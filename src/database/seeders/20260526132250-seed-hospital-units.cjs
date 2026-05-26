'use strict';

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('hospital_units', [
      { id: 1, hospital_id: 1, unit_id: 1 },
      { id: 2, hospital_id: 1, unit_id: 2 },
      { id: 3, hospital_id: 2, unit_id: 3 },
      { id: 4, hospital_id: 2, unit_id: 4 },
      { id: 5, hospital_id: 3, unit_id: 5 },
      { id: 6, hospital_id: 3, unit_id: 6 },
    ]);

    await resetSequence(queryInterface, 'hospital_units');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'hospital_units',
      { id: [1, 2, 3, 4, 5, 6] },
      {},
    );
  },
};
