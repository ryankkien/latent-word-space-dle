const fs = require('fs');
const path = require('path');

const puzzlesDir = path.join(__dirname, '../src/data/puzzles');

// Delete all JSON files in the puzzles directory
fs.readdirSync(puzzlesDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(puzzlesDir, file);
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${file}`);
  }
});

console.log('All puzzle files deleted!');