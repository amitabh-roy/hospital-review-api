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

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const roles = [
      ...HEALTHCARE_ROLES.map((name, index) => ({
        id: index + 1,
        name,
      })),
      { id: HEALTHCARE_ROLES.length + 1, name: 'admin' },
    ];

    await queryInterface.bulkInsert('roles', roles);

    await resetSequence(queryInterface, 'roles');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'roles',
      {
        id: Array.from(
          { length: HEALTHCARE_ROLES.length + 1 },
          (_, i) => i + 1,
        ),
      },
      {},
    );
  },
};
