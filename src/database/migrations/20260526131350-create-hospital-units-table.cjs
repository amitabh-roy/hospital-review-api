'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'hospital_units',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          hospital_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'hospitals',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          unit_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'units',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        },
        { transaction },
      );

      await queryInterface.addIndex(
        'hospital_units',
        ['hospital_id', 'unit_id'],
        {
          unique: true,
          name: 'hospital_units_hospital_unit_unique',
          transaction,
        },
      );
      await queryInterface.addIndex('hospital_units', ['hospital_id'], {
        name: 'hospital_units_hospital_id_idx',
        transaction,
      });
      await queryInterface.addIndex('hospital_units', ['unit_id'], {
        name: 'hospital_units_unit_id_idx',
        transaction,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('hospital_units', { transaction });
    });
  },
};
