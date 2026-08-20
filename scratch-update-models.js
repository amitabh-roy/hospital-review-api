const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'database', 'models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.model.ts') && f !== 'hospital.model.ts' && f !== 'user.model.ts');

for (const file of files) {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add DeletedAt, Default to imports if not there
  if (!content.includes('DeletedAt')) {
    content = content.replace(/}(?=[^}]*from 'sequelize-typescript')/, '  DeletedAt,\n}');
  }

  // 2. Add paranoid: true to @Table
  if (!content.includes('paranoid: true')) {
    content = content.replace(/@Table\(\{([^}]*)\}\)/, (match, p1) => {
      return `@Table({${p1.trimEnd()}${p1.endsWith(',') || p1.trim() === '' ? '' : ','}\n  paranoid: true,\n})`;
    });
  }

  // 3. Add deletedAt field
  if (!content.includes('deletedAt: Date | null')) {
    const deletedAtField = `\n  @DeletedAt\n  @Column({\n    type: DataType.DATE,\n    allowNull: true,\n    field: 'deleted_at',\n  })\n  declare deletedAt: Date | null;\n`;
    // Insert before the last closing brace
    content = content.replace(/}(\s*)$/, `${deletedAtField}}$1`);
  }

  fs.writeFileSync(filePath, content);
}

console.log('Models updated.');
