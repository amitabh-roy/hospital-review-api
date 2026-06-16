'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const string = (length) => ({
        type: Sequelize.STRING(length),
        allowNull: true,
      });
      const rating = {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
      };

      const columns = {
        worked_when: string(50),
        employment_length: string(50),
        hours_per_week: string(30),
        years_in_role: string(30),
        yearly_compensation: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
        },
        has_benefits: string(10),
        orientation_adequate: string(30),
        understaffing: string(30),
        float_frequency: string(30),
        clock_out_on_time: string(10),
        mandatory_on_call: string(30),
        overtime_opportunity: string(30),
        shift_differentials: string(30),
        loved_one_care: string(30),
        loved_one_reasons: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        staffing_rating: rating,
        culture_rating: rating,
        compensation_rating: rating,
        work_life_rating: rating,
        safety_rating: rating,
        resources_rating: rating,
        management_tags: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        would_recommend: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        has_growth: string(10),
        schedule_accommodating: string(10),
        feels_safe: string(10),
        safety_concerns: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
      };

      for (const [name, definition] of Object.entries(columns)) {
        await queryInterface.addColumn('reviews', name, definition, { transaction });
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const columns = [
        'worked_when',
        'employment_length',
        'hours_per_week',
        'years_in_role',
        'yearly_compensation',
        'has_benefits',
        'orientation_adequate',
        'understaffing',
        'float_frequency',
        'clock_out_on_time',
        'mandatory_on_call',
        'overtime_opportunity',
        'shift_differentials',
        'loved_one_care',
        'loved_one_reasons',
        'staffing_rating',
        'culture_rating',
        'compensation_rating',
        'work_life_rating',
        'safety_rating',
        'resources_rating',
        'management_tags',
        'would_recommend',
        'has_growth',
        'schedule_accommodating',
        'feels_safe',
        'safety_concerns',
      ];

      for (const name of columns) {
        await queryInterface.removeColumn('reviews', name, { transaction });
      }
    });
  },
};
