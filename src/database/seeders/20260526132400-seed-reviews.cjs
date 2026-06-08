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

    await queryInterface.bulkInsert('reviews', [
      {
        id: 1,
        hospital_id: 1,
        unit_id: 1,
        user_id: 1,
        role_id: 13,
        rating: 5,
        comment:
          'Strong teamwork, good staffing support, and responsive leadership.',
        employment_type: 'full_time',
        shift_type: 'day',
        status: 'approved',
        hourly_rate: 43.0,
        patient_ratio: '1 : 5',
        meal_breaks: 'Usually',
        bathroom_breaks: 'Sometimes',
        parking_cost: '$150/mo',
        management_rating: 4.0,
        would_return: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        hospital_id: 2,
        unit_id: 3,
        user_id: 2,
        role_id: 11,
        rating: 4,
        comment:
          'High-acuity environment with solid physician collaboration.',
        employment_type: 'contract',
        shift_type: 'night',
        status: 'approved',
        hourly_rate: 55.0,
        patient_ratio: '1 : 4',
        meal_breaks: 'Always',
        bathroom_breaks: 'Usually',
        parking_cost: 'Free',
        management_rating: 4.2,
        would_return: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    await resetSequence(queryInterface, 'reviews');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('reviews', { id: [1, 2] }, {});
  },
};
