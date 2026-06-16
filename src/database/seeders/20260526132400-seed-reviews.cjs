'use strict';

const {
  syncHospitalAverageRatings,
} = require('../helpers/sync-hospital-ratings.cjs');

const REVIEWS = [
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
  },
  {
    id: 2,
    hospital_id: 2,
    unit_id: 3,
    user_id: 2,
    role_id: 11,
    rating: 4,
    comment: 'High-acuity environment with solid physician collaboration.',
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
  },
];

const REVIEW_IDS = REVIEWS.map((review) => review.id);

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
    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE id = 1 LIMIT 1',
    );

    if (users.length === 0) {
      console.warn(
        '[seed-reviews] Skipping sample reviews — no seeded users found.',
      );
      return;
    }

    const now = new Date();

    for (const review of REVIEWS) {
      if (await existsById(queryInterface, 'reviews', review.id)) {
        continue;
      }

      await queryInterface.bulkInsert('reviews', [
        {
          ...review,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    await resetSequence(queryInterface, 'reviews');
    await syncHospitalAverageRatings(queryInterface);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('reviews', { id: REVIEW_IDS }, {});
  },
};
