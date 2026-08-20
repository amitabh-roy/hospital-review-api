const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'database', 'models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.model.ts'));

for (const file of files) {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix double commas
  content = content.replace(/,,/g, ',');

  fs.writeFileSync(filePath, content);
}

console.log('Fixed double commas in models.');
