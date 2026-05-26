'use strict';

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const bcryptModule = await import('bcrypt');
    const bcrypt = bcryptModule.default ?? bcryptModule;
    const now = new Date();
    const passwordHash = bcrypt.hashSync('Password@123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        full_name: 'Taylor Brooks',
        email: 'taylor.brooks@example.com',
        password_hash: passwordHash,
        role_id: 1,
        is_verified: true,
        verification_status: 'verified',
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        full_name: 'Dr. Jordan Lee',
        email: 'jordan.lee@example.com',
        password_hash: passwordHash,
        role_id: 2,
        is_verified: true,
        verification_status: 'verified',
        created_at: now,
        updated_at: now,
      },
      {
        id: 3,
        full_name: 'System Admin',
        email: 'admin@example.com',
        password_hash: passwordHash,
        role_id: 3,
        is_verified: true,
        verification_status: 'verified',
        created_at: now,
        updated_at: now,
      },
    ]);

    await resetSequence(queryInterface, 'users');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { id: [1, 2, 3] }, {});
  },
};
