'use strict';

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const seedPassword = process.env.SEED_DEV_PASSWORD?.trim();

    if (!seedPassword) {
      throw new Error(
        '[seed-users] Set SEED_DEV_PASSWORD in your local .env before running user seeds.',
      );
    }

    console.warn(
      '[seed-users] Seeding development users from SEED_DEV_PASSWORD. Never use seeded credentials in production.',
    );

    const bcryptModule = await import('bcrypt');
    const bcrypt = bcryptModule.default ?? bcryptModule;
    const now = new Date();
    const passwordHash = bcrypt.hashSync(seedPassword, 10);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        full_name: 'Taylor Brooks',
        email: 'taylor.brooks@example.com',
        password_hash: passwordHash,
        role_id: 13,
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
        role_id: 11,
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
        role_id: 20,
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
