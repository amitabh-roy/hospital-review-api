'use strict';

const {
  resetHospitalAverageRatingsForReviewedHospitals,
  syncHospitalAverageRatings,
} = require('../helpers/sync-hospital-ratings.cjs');

/**
 * Backfill hospitals.average_rating from approved reviews.
 * Safe to re-run — idempotent.
 */
/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    await syncHospitalAverageRatings(queryInterface);
  },

  async down(queryInterface) {
    await resetHospitalAverageRatingsForReviewedHospitals(queryInterface);
  },
};
