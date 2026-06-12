'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('review_reports', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      review_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'reviews', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reporter_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reason: {
        type: Sequelize.ENUM('individual', 'false_claim', 'not_hcp', 'other'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'resolved', 'dismissed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      admin_notes: {
        type: Sequelize.TEXT,
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
    });

    await queryInterface.addIndex('review_reports', ['status']);
    await queryInterface.addIndex('review_reports', ['review_id']);
    await queryInterface.addIndex(
      'review_reports',
      ['review_id', 'reporter_user_id'],
      {
        unique: true,
        name: 'review_reports_review_reporter_unique',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('review_reports');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_review_reports_reason";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_review_reports_status";',
    );
  },
};
