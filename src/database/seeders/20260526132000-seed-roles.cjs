'use strict';

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'nurse' },
      { id: 2, name: 'doctor' },
      { id: 3, name: 'admin' },
    ]);

    await resetSequence(queryInterface, 'roles');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { id: [1, 2, 3] }, {});
  },
};
