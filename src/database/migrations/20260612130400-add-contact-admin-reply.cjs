'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contact_submissions', 'admin_reply', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('contact_submissions', 'replied_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('contact_submissions', 'replied_at');
    await queryInterface.removeColumn('contact_submissions', 'admin_reply');
  },
};
