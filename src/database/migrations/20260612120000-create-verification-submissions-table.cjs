'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'verification_submissions',
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
          identity_method: {
            type: Sequelize.ENUM('selfie', 'license'),
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
          },
          badge_file_path: {
            type: Sequelize.STRING(500),
            allowNull: true,
          },
          identity_file_path: {
            type: Sequelize.STRING(500),
            allowNull: true,
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
        'verification_submissions',
        ['user_id', 'status'],
        {
          name: 'verification_submissions_user_status_idx',
          transaction,
        },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('verification_submissions', {
        transaction,
      });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_verification_submissions_identity_method";',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_verification_submissions_status";',
        { transaction },
      );
    });
  },
};
