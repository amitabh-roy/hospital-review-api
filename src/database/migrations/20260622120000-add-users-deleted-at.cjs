'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'users',
        'deleted_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addIndex('users', ['deleted_at'], {
        name: 'users_deleted_at_idx',
        transaction,
      });

      // Backfill legacy anonymized accounts created before soft-delete support.
      await queryInterface.sequelize.query(
        `UPDATE users
         SET deleted_at = NOW()
         WHERE deleted_at IS NULL
           AND email ~ '^deleted\\+[0-9]+@opencurtain\\.invalid$'`,
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex('users', 'users_deleted_at_idx', {
        transaction,
      });
      await queryInterface.removeColumn('users', 'deleted_at', { transaction });
    });
  },
};
