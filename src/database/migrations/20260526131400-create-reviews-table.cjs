'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'reviews',
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
            onDelete: 'RESTRICT',
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
          rating: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          comment: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          employment_type: {
            type: Sequelize.STRING(50),
            allowNull: false,
          },
          shift_type: {
            type: Sequelize.STRING(50),
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected'),
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

      await queryInterface.addIndex('reviews', ['hospital_id', 'status'], {
        transaction,
      });
      await queryInterface.addIndex('reviews', ['user_id'], { transaction });
      await queryInterface.addIndex('reviews', ['hospital_id', 'user_id'], {
        unique: true,
        name: 'reviews_hospital_user_unique',
        transaction,
      });
      await queryInterface.addConstraint('reviews', {
        fields: ['hospital_id', 'unit_id'],
        type: 'foreign key',
        name: 'reviews_hospital_unit_fk',
        references: {
          table: 'hospital_units',
          fields: ['hospital_id', 'unit_id'],
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        transaction,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('reviews', { transaction });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_reviews_status";',
        { transaction },
      );
    });
  },
};
