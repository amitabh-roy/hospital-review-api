'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'hospitals',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          cms_id: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true,
          },
          name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          city: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          state: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          facility_type: {
            type: Sequelize.STRING(120),
            allowNull: false,
          },
          average_rating: {
            type: Sequelize.DECIMAL(3, 2),
            allowNull: false,
            defaultValue: 0,
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

      await queryInterface.addIndex('hospitals', ['city'], { transaction });
      await queryInterface.addIndex('hospitals', ['state'], { transaction });
      await queryInterface.addIndex('hospitals', ['facility_type'], {
        transaction,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('hospitals', { transaction });
    });
  },
};
