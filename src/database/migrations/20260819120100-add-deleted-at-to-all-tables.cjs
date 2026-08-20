'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // List of all tables that need deleted_at
      const tables = [
        'roles',
        'hospitals',
        'units',
        'hospital_units',
        'reviews',
        'auth_tokens',
        'refresh_tokens',
        'verification_submissions',
        'contact_submissions',
        'saved_hospitals',
        'review_reports',
        'login_events',
        'account_deletion_requests'
      ];

      for (const table of tables) {
        // Skip users table as it already has deleted_at from a previous migration
        await queryInterface.addColumn(
          table,
          'deleted_at',
          {
            type: Sequelize.DATE,
            allowNull: true,
          },
          { transaction },
        );
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const tables = [
        'roles',
        'hospitals',
        'units',
        'hospital_units',
        'reviews',
        'auth_tokens',
        'refresh_tokens',
        'verification_submissions',
        'contact_submissions',
        'saved_hospitals',
        'review_reports',
        'login_events',
        'account_deletion_requests'
      ];

      for (const table of tables) {
        await queryInterface.removeColumn(table, 'deleted_at', { transaction });
      }
    });
  },
};
