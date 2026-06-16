'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('saved_hospitals', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      hospital_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'hospitals', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex(
      'saved_hospitals',
      ['user_id', 'hospital_id'],
      {
        unique: true,
        name: 'saved_hospitals_user_hospital_unique',
      },
    );
    await queryInterface.addIndex('saved_hospitals', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('saved_hospitals');
  },
};
