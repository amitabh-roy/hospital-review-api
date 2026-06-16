'use strict';

const HEALTHCARE_ROLES = [
  'Advanced Practice RN / NP (APRN)',
  'Nursing Assistant (CNA) / Patient Care Tech (PCT)',
  'Dietitian',
  'Licensed Practical Nurse (LPN)',
  'Medical Assistant (MA)',
  'Medical Laboratory Technician (MLT)',
  'Occupational Therapist (OT)',
  'Pharmacist / Pharmacy Tech',
  'Phlebotomist',
  'Physical Therapist (PT)',
  'Physician Assistant (PA-C)',
  'Radiologic Technologist',
  'Registered Nurse (RN)',
  'Respiratory Therapist (RT)',
  'Social Worker',
  'Speech-Language Pathologist (SLP)',
  'Surgical Technologist',
  'Ultrasound Technologist',
  'Other',
];

const ROLES = [
  ...HEALTHCARE_ROLES.map((name, index) => ({
    id: index + 1,
    name,
  })),
  { id: HEALTHCARE_ROLES.length + 1, name: 'admin' },
];

const ROLE_IDS = ROLES.map((role) => role.id);

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

async function existsById(queryInterface, tableName, id) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id FROM "${tableName}" WHERE id = :id LIMIT 1`,
    { replacements: { id } },
  );

  return rows.length > 0;
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    for (const role of ROLES) {
      if (await existsById(queryInterface, 'roles', role.id)) {
        continue;
      }

      await queryInterface.bulkInsert('roles', [role]);
    }

    await resetSequence(queryInterface, 'roles');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { id: ROLE_IDS }, {});
  },
};
