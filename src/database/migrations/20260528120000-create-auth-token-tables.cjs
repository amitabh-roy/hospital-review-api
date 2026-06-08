'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'refresh_tokens',
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
          token_hash: {
            type: Sequelize.STRING(64),
            allowNull: false,
            unique: true,
          },
          expires_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          revoked_at: {
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

      await queryInterface.addIndex('refresh_tokens', ['user_id'], {
        transaction,
      });
      await queryInterface.addIndex('refresh_tokens', ['expires_at'], {
        transaction,
      });

      await queryInterface.createTable(
        'auth_tokens',
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
          type: {
            type: Sequelize.ENUM('email_verification', 'password_reset'),
            allowNull: false,
          },
          token_hash: {
            type: Sequelize.STRING(64),
            allowNull: false,
            unique: true,
          },
          expires_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          consumed_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('NOW'),
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('auth_tokens', ['user_id', 'type'], {
        transaction,
      });
      await queryInterface.addIndex('auth_tokens', ['expires_at'], {
        transaction,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('auth_tokens', { transaction });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_auth_tokens_type";',
        { transaction },
      );
      await queryInterface.dropTable('refresh_tokens', { transaction });
    });
  },
};
