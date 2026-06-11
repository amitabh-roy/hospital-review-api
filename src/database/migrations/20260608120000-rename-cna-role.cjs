'use strict';

const OLD_NAME = 'Certified Nursing Assistant (CNA)';
const NEW_NAME = 'Nursing Assistant (CNA) / Patient Care Tech (PCT)';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkUpdate(
      'roles',
      { name: NEW_NAME },
      { name: OLD_NAME },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      'roles',
      { name: OLD_NAME },
      { name: NEW_NAME },
    );
  },
};
