'use strict';

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('hospitals', [
      {
        id: 1,
        cms_id: 'CMS-1001',
        name: 'City Hospital',
        city: 'New York',
        state: 'New York',
        facility_type: 'General Acute Care',
        average_rating: 4.5,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        cms_id: 'CMS-1002',
        name: 'Riverside Medical Center',
        city: 'Boston',
        state: 'Massachusetts',
        facility_type: 'Teaching Hospital',
        average_rating: 4.2,
        created_at: now,
        updated_at: now,
      },
      {
        id: 3,
        cms_id: 'CMS-1003',
        name: 'Lakeside Women and Children Hospital',
        city: 'Chicago',
        state: 'Illinois',
        facility_type: 'Specialty Hospital',
        average_rating: 4.8,
        created_at: now,
        updated_at: now,
      },
    ]);

    await resetSequence(queryInterface, 'hospitals');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('hospitals', { id: [1, 2, 3] }, {});
  },
};
