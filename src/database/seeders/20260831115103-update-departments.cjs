'use strict';

const NEW_DEPARTMENTS = [
  'Oncology',
  'Observation',
  'Float Pool',
  'Dialysis',
  'Pediatric ICU (PICU)',
  'Operating Room (OR)',
  'Pre-Operative Unit (Pre-Op)',
  'Post-Anesthesia Care Unit (PACU)',
  'Postpartum / Mother-Baby',
  'Case Management',
  'Social Services',
  'Utilization Review',
  'Quality & Risk Management',
];

const RENAMES = [
  { old: 'Behavioral Health', new: 'Behavioral Health / Psychiatry' },
  { old: 'Stepdown / IMC / PCU', new: 'Step-Down / IMCU / PCU' },
  { old: 'NICU', new: 'Neonatal ICU (NICU)' },
  { old: 'Outpatient / Clinic', new: 'Outpatient Services / Clinic' },
  { old: 'Med-Surg', new: 'Medical-Surgical (Med-Surg)' },
  { old: 'Labor & Delivery', new: 'Labor & Delivery (L&D)' },
];

const REMOVALS = [
  'Med-Surg / Telemetry',
  'Peri-Op / OR',
  'Case Management / Social Services',
];

async function resetSequence(queryInterface, tableName) {
  await queryInterface.sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`
  );
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 1. Rename existing departments
      for (const rename of RENAMES) {
        await queryInterface.bulkUpdate(
          'units',
          { name: rename.new },
          { name: rename.old },
          { transaction }
        );
      }

      // 2. Soft-delete requested departments
      for (const name of REMOVALS) {
        await queryInterface.bulkUpdate(
          'units',
          { deleted_at: new Date() },
          { name: name },
          { transaction }
        );
      }

      // 3. Add new departments (only if they don't already exist to be safe)
      for (const name of NEW_DEPARTMENTS) {
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM units WHERE name = :name LIMIT 1`,
          { replacements: { name }, transaction }
        );

        if (existing.length === 0) {
          await queryInterface.bulkInsert(
            'units',
            [{ name: name }],
            { transaction }
          );
        }
      }

      await resetSequence(queryInterface, 'units');

      const [hospitals] = await queryInterface.sequelize.query(
        `SELECT id FROM hospitals`,
        { transaction }
      );
      
      const hospitalIds = hospitals.map(h => h.id);
      
      const [newUnitRecords] = await queryInterface.sequelize.query(
        `SELECT id FROM units WHERE name IN (:names)`,
        { replacements: { names: NEW_DEPARTMENTS }, transaction }
      );
      
      for (const hospitalId of hospitalIds) {
        for (const unit of newUnitRecords) {
          const [exists] = await queryInterface.sequelize.query(
            `SELECT id FROM hospital_units WHERE hospital_id = :hospitalId AND unit_id = :unitId LIMIT 1`,
            { replacements: { hospitalId, unitId: unit.id }, transaction }
          );
          
          if (exists.length === 0) {
            await queryInterface.bulkInsert(
              'hospital_units',
              [{ hospital_id: hospitalId, unit_id: unit.id }],
              { transaction }
            );
          }
        }
      }

      await resetSequence(queryInterface, 'hospital_units');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      for (const name of REMOVALS) {
        await queryInterface.bulkUpdate(
          'units',
          { deleted_at: null },
          { name: name },
          { transaction }
        );
      }

      for (const rename of RENAMES) {
        await queryInterface.bulkUpdate(
          'units',
          { name: rename.old },
          { name: rename.new },
          { transaction }
        );
      }
      
      const [newUnitRecords] = await queryInterface.sequelize.query(
        `SELECT id FROM units WHERE name IN (:names)`,
        { replacements: { names: NEW_DEPARTMENTS }, transaction }
      );
      
      const newUnitIds = newUnitRecords.map(u => u.id);
      if (newUnitIds.length > 0) {
        await queryInterface.bulkDelete(
          'hospital_units',
          { unit_id: newUnitIds },
          { transaction }
        );
        await queryInterface.bulkDelete(
          'units',
          { id: newUnitIds },
          { transaction }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
