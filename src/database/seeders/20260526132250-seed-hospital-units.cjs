'use strict';

const HOSPITAL_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const UNIT_IDS = Array.from({ length: 25 }, (_, index) => index + 1);

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    for (const hospitalId of HOSPITAL_IDS) {
      for (const unitId of UNIT_IDS) {
        const [rows] = await queryInterface.sequelize.query(
          `SELECT id FROM hospital_units WHERE hospital_id = :hospitalId AND unit_id = :unitId LIMIT 1`,
          { replacements: { hospitalId, unitId } },
        );

        if (rows.length > 0) {
          continue;
        }

        await queryInterface.bulkInsert('hospital_units', [
          { hospital_id: hospitalId, unit_id: unitId },
        ]);
      }
    }

    await resetSequence(queryInterface, 'hospital_units');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'hospital_units',
      { hospital_id: HOSPITAL_IDS },
      {},
    );
  },
};
