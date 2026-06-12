'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('login_events', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      ip_address: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.STRING(512),
        allowNull: true,
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    });

    await queryInterface.addIndex('login_events', ['created_at']);
    await queryInterface.addIndex('login_events', ['email']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('login_events');
  },
};
