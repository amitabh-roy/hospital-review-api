'use strict';

const HOSPITALS = [
  {
    id: 1,
    cms_id: 'CMS-1001',
    name: 'City Hospital',
    city: 'New York',
    state: 'New York',
    facility_type: 'General Acute Care',
    average_rating: 4.5,
  },
  {
    id: 2,
    cms_id: 'CMS-1002',
    name: 'Riverside Medical Center',
    city: 'Boston',
    state: 'Massachusetts',
    facility_type: 'Teaching Hospital',
    average_rating: 4.2,
  },
  {
    id: 3,
    cms_id: 'CMS-1003',
    name: 'Lakeside Women and Children Hospital',
    city: 'Chicago',
    state: 'Illinois',
    facility_type: 'Specialty Hospital',
    average_rating: 4.8,
  },
  {
    id: 4,
    cms_id: 'CMS-1004',
    name: 'Jackson Memorial Hospital',
    city: 'Miami',
    state: 'Florida',
    facility_type: 'General Acute Care',
    average_rating: 0,
  },
  {
    id: 5,
    cms_id: 'CMS-1005',
    name: 'Jackson Park Hospital',
    city: 'Chicago',
    state: 'Illinois',
    facility_type: 'General Acute Care',
    average_rating: 0,
  },
  {
    id: 6,
    cms_id: 'CMS-1006',
    name: 'Memorial Hermann Texas Medical Center',
    city: 'Houston',
    state: 'Texas',
    facility_type: 'Teaching Hospital',
    average_rating: 0,
  },
  {
    id: 7,
    cms_id: 'CMS-1007',
    name: 'Mayo Clinic Hospital — Rochester',
    city: 'Rochester',
    state: 'Minnesota',
    facility_type: 'Teaching Hospital',
    average_rating: 0,
  },
  {
    id: 8,
    cms_id: 'CMS-1008',
    name: 'Cedars-Sinai Medical Center',
    city: 'Los Angeles',
    state: 'California',
    facility_type: 'General Acute Care',
    average_rating: 0,
  },
  {
    id: 9,
    cms_id: 'CMS-1009',
    name: 'Emory University Hospital',
    city: 'Atlanta',
    state: 'Georgia',
    facility_type: 'Teaching Hospital',
    average_rating: 0,
  },
  {
    id: 10,
    cms_id: 'CMS-1010',
    name: 'Denver Health Medical Center',
    city: 'Denver',
    state: 'Colorado',
    facility_type: 'Safety Net Hospital',
    average_rating: 0,
  },
];

const HOSPITAL_IDS = HOSPITALS.map((hospital) => hospital.id);

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`,
  );
}

async function hospitalExists(queryInterface, hospital) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id FROM hospitals WHERE id = :id OR cms_id = :cmsId LIMIT 1`,
    { replacements: { id: hospital.id, cmsId: hospital.cms_id } },
  );

  return rows.length > 0;
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    for (const hospital of HOSPITALS) {
      if (await hospitalExists(queryInterface, hospital)) {
        continue;
      }

      await queryInterface.bulkInsert('hospitals', [
        {
          ...hospital,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    await resetSequence(queryInterface, 'hospitals');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('hospitals', { id: HOSPITAL_IDS }, {});
  },
};
