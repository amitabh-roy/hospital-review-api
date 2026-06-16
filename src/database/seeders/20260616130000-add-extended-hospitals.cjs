'use strict';

/**
 * Additive seeder for databases that already ran the original hospital seeds.
 * Safe to run multiple times — skips rows that already exist.
 *
 *   npx sequelize-cli db:seed --seed 20260616130000-add-extended-hospitals.cjs \
 *     --config src/database/sequelize-cli.config.cjs --seeders-path src/database/seeders
 *
 * Or use a full reseed: npm run db:seed:undo:all && npm run db:seed
 */

const NEW_HOSPITALS = [
  {
    id: 4,
    cms_id: 'CMS-1004',
    name: 'Jackson Memorial Hospital',
    city: 'Miami',
    state: 'Florida',
    facility_type: 'General Acute Care',
    average_rating: 4.1,
  },
  {
    id: 5,
    cms_id: 'CMS-1005',
    name: 'Jackson Park Hospital',
    city: 'Chicago',
    state: 'Illinois',
    facility_type: 'General Acute Care',
    average_rating: 3.6,
  },
  {
    id: 6,
    cms_id: 'CMS-1006',
    name: 'Memorial Hermann Texas Medical Center',
    city: 'Houston',
    state: 'Texas',
    facility_type: 'Teaching Hospital',
    average_rating: 4.3,
  },
  {
    id: 7,
    cms_id: 'CMS-1007',
    name: 'Mayo Clinic Hospital — Rochester',
    city: 'Rochester',
    state: 'Minnesota',
    facility_type: 'Teaching Hospital',
    average_rating: 4.7,
  },
  {
    id: 8,
    cms_id: 'CMS-1008',
    name: 'Cedars-Sinai Medical Center',
    city: 'Los Angeles',
    state: 'California',
    facility_type: 'General Acute Care',
    average_rating: 4.4,
  },
  {
    id: 9,
    cms_id: 'CMS-1009',
    name: 'Emory University Hospital',
    city: 'Atlanta',
    state: 'Georgia',
    facility_type: 'Teaching Hospital',
    average_rating: 4.0,
  },
  {
    id: 10,
    cms_id: 'CMS-1010',
    name: 'Denver Health Medical Center',
    city: 'Denver',
    state: 'Colorado',
    facility_type: 'Safety Net Hospital',
    average_rating: 3.9,
  },
];

const NEW_HOSPITAL_IDS = NEW_HOSPITALS.map((hospital) => hospital.id);
const UNIT_IDS = Array.from({ length: 25 }, (_, index) => index + 1);

const NEW_REVIEWS = [
  {
    id: 3,
    hospital_id: 4,
    unit_id: 2,
    user_id: 1,
    role_id: 13,
    rating: 4,
    comment:
      'Busy trauma center with strong learning opportunities and supportive charge nurses.',
    employment_type: 'full_time',
    shift_type: 'night',
    status: 'approved',
    hourly_rate: 41.5,
    patient_ratio: '1 : 6',
    meal_breaks: 'Sometimes',
    bathroom_breaks: 'Sometimes',
    parking_cost: '$75/mo',
    management_rating: 3.8,
    would_return: true,
  },
  {
    id: 4,
    hospital_id: 6,
    unit_id: 1,
    user_id: 2,
    role_id: 11,
    rating: 5,
    comment:
      'Excellent interdisciplinary collaboration and well-resourced critical care units.',
    employment_type: 'full_time',
    shift_type: 'day',
    status: 'approved',
    hourly_rate: 62.0,
    patient_ratio: '1 : 3',
    meal_breaks: 'Always',
    bathroom_breaks: 'Usually',
    parking_cost: '$120/mo',
    management_rating: 4.5,
    would_return: true,
  },
];

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    for (const hospital of NEW_HOSPITALS) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM hospitals WHERE id = :id OR cms_id = :cmsId LIMIT 1`,
        { replacements: { id: hospital.id, cmsId: hospital.cms_id } },
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert('hospitals', [
          {
            ...hospital,
            created_at: now,
            updated_at: now,
          },
        ]);
      }
    }

    await resetSequence(queryInterface, 'hospitals');

    for (const hospitalId of NEW_HOSPITAL_IDS) {
      for (const unitId of UNIT_IDS) {
        const [rows] = await queryInterface.sequelize.query(
          `SELECT id FROM hospital_units WHERE hospital_id = :hospitalId AND unit_id = :unitId LIMIT 1`,
          { replacements: { hospitalId, unitId } },
        );

        if (rows.length === 0) {
          await queryInterface.bulkInsert('hospital_units', [
            { hospital_id: hospitalId, unit_id: unitId },
          ]);
        }
      }
    }

    await resetSequence(queryInterface, 'hospital_units');

    for (const review of NEW_REVIEWS) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM reviews WHERE id = :id LIMIT 1`,
        { replacements: { id: review.id } },
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert('reviews', [
          {
            ...review,
            created_at: now,
            updated_at: now,
          },
        ]);
      }
    }

    await resetSequence(queryInterface, 'reviews');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'reviews',
      { id: NEW_REVIEWS.map((r) => r.id) },
      {},
    );
    await queryInterface.bulkDelete(
      'hospital_units',
      { hospital_id: NEW_HOSPITAL_IDS },
      {},
    );
    await queryInterface.bulkDelete('hospitals', { id: NEW_HOSPITAL_IDS }, {});
  },
};
