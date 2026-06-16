'use strict';

/**
 * Recompute hospitals.average_rating from approved reviews.
 * Mirrors ReviewsService.syncHospitalAverageRating for seed data.
 */
async function syncHospitalAverageRatings(queryInterface) {
  await queryInterface.sequelize.query(`
    UPDATE hospitals h
    SET
      average_rating = ROUND(agg.avg_rating::numeric, 2),
      updated_at = NOW()
    FROM (
      SELECT hospital_id, AVG(rating) AS avg_rating
      FROM reviews
      WHERE status = 'approved'
      GROUP BY hospital_id
    ) agg
    WHERE h.id = agg.hospital_id
  `);
}

async function resetHospitalAverageRatingsForReviewedHospitals(queryInterface) {
  await queryInterface.sequelize.query(`
    UPDATE hospitals h
    SET average_rating = 0, updated_at = NOW()
    WHERE EXISTS (
      SELECT 1
      FROM reviews r
      WHERE r.hospital_id = h.id
        AND r.status = 'approved'
    )
  `);
}

module.exports = {
  syncHospitalAverageRatings,
  resetHospitalAverageRatingsForReviewedHospitals,
};
