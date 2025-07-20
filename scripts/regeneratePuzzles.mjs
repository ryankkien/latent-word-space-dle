import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Delete old puzzles
const puzzlesDir = path.join(__dirname, '../src/data/puzzles');
try {
  const files = fs.readdirSync(puzzlesDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(puzzlesDir, file));
      console.log(`Deleted: ${file}`);
    }
  });
  console.log('✅ All old puzzle files deleted!\n');
} catch (error) {
  console.log('No old puzzles to delete or error:', error.message);
}

// Now generate new puzzles
console.log('🎯 Starting new puzzle generation...\n');
import('./generatePuzzles.mjs');