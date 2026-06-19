'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'reviews',
        'hourly_rate',
        {
          type: Sequelize.DECIMAL(8, 2),
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'reviews',
        'patient_ratio',
        {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'reviews',
        'meal_breaks',
        {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'reviews',
        'bathroom_breaks',
        {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'reviews',
        'parking_cost',
        {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'reviews',
        'management_rating',
        {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'reviews',
        'would_return',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('reviews', 'hourly_rate', {
        transaction,
      });
      await queryInterface.removeColumn('reviews', 'patient_ratio', {
        transaction,
      });
      await queryInterface.removeColumn('reviews', 'meal_breaks', {
        transaction,
      });
      await queryInterface.removeColumn('reviews', 'bathroom_breaks', {
        transaction,
      });
      await queryInterface.removeColumn('reviews', 'parking_cost', {
        transaction,
      });
      await queryInterface.removeColumn('reviews', 'management_rating', {
        transaction,
      });
      await queryInterface.removeColumn('reviews', 'would_return', {
        transaction,
      });
    });
  },
};
