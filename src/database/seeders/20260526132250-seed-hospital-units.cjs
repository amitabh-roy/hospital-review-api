'use strict';

const HOSPITAL_IDS = [1, 2, 3];
const UNIT_IDS = Array.from({ length: 25 }, (_, index) => index + 1);

function buildHospitalUnits() {
  let id = 1;
  const rows = [];

  for (const hospitalId of HOSPITAL_IDS) {
    for (const unitId of UNIT_IDS) {
      rows.push({
        id,
        hospital_id: hospitalId,
        unit_id: unitId,
      });
      id += 1;
    }
  }

  return rows;
}

const HOSPITAL_UNIT_ROWS = buildHospitalUnits();
const HOSPITAL_UNIT_IDS = HOSPITAL_UNIT_ROWS.map((row) => row.id);

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('hospital_units', HOSPITAL_UNIT_ROWS);

    await resetSequence(queryInterface, 'hospital_units');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'hospital_units',
      { id: HOSPITAL_UNIT_IDS },
      {},
    );
  },
};
