const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// First, let's clear the existing puzzles
const puzzlesDir = path.join(__dirname, '../src/data/puzzles');
if (fs.existsSync(puzzlesDir)) {
  const files = fs.readdirSync(puzzlesDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(puzzlesDir, file));
      console.log(`Deleted: ${file}`);
    }
  });
}

console.log('\n🚀 Starting puzzle generation for 60 days...\n');

// Run the puzzle generation script
const puzzleGen = spawn('node', ['scripts/generatePuzzles.mjs'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: process.env
});

puzzleGen.on('error', (error) => {
  console.error('Failed to start puzzle generation:', error);
});

puzzleGen.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Puzzle generation completed successfully!');
    console.log('\n📝 IMPORTANT: Before committing to Git:');
    console.log('1. Remove your OpenAI API key from .env file');
    console.log('2. Or add .env to .gitignore');
    console.log('3. The generated puzzles are safe to commit');
  } else {
    console.error(`\n❌ Puzzle generation failed with code ${code}`);
  }
});