'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'users',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          full_name: {
            type: Sequelize.STRING(150),
            allowNull: false,
          },
          email: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
          },
          password_hash: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          role_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'roles',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          is_verified: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          verification_status: {
            type: Sequelize.ENUM('pending', 'verified', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
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
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('users', { transaction });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_users_verification_status";',
        { transaction },
      );
    });
  },
};
