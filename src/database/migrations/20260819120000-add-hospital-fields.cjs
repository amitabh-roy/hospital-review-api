'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Add source and is_active to hospitals
      await queryInterface.addColumn(
        'hospitals',
        'source',
        {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'MANUAL',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'hospitals',
        'is_active',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('hospitals', 'source', { transaction });
      await queryInterface.removeColumn('hospitals', 'is_active', { transaction });
    });
  },
};
