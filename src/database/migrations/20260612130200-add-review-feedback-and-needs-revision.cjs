'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_reviews_status" ADD VALUE IF NOT EXISTS 'needs_revision';`,
    );

    await queryInterface.addColumn('reviews', 'admin_feedback', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('reviews', 'admin_feedback');
    // PostgreSQL does not support removing enum values safely; leave enum value in place.
  },
};
