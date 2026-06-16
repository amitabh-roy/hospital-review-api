'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'account_deletion_requests',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          reason: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
          },
          admin_note: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          reviewed_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('NOW'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('NOW'),
          },
        },
        { transaction },
      );

      await queryInterface.addIndex(
        'account_deletion_requests',
        ['user_id', 'status'],
        {
          name: 'account_deletion_requests_user_status_idx',
          transaction,
        },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('account_deletion_requests', {
        transaction,
      });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_account_deletion_requests_status";',
        { transaction },
      );
    });
  },
};
