import { PuzzleGenerator } from '../src/services/puzzleGenerator.js';
import fs from 'fs';
import path from 'path';

// Get dates for the next 10 days
function getTestDates() {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

async function generateTestPuzzles() {
  console.log('🧩 Generating test puzzles...');
  
  const generator = new PuzzleGenerator();
  const dates = getTestDates();
  const puzzlesDir = path.join(process.cwd(), 'src', 'data', 'puzzles');
  
  // Ensure puzzles directory exists
  if (!fs.existsSync(puzzlesDir)) {
    fs.mkdirSync(puzzlesDir, { recursive: true });
  }
  
  for (const date of dates) {
    console.log(`\n📅 Generating puzzles for ${date}...`);
    
    try {
      const puzzleSet = await generator.generateDailyPuzzles(date);
      const filePath = path.join(puzzlesDir, `${date}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(puzzleSet, null, 2));
      
      console.log(`✅ Successfully generated ${puzzleSet.puzzles.length} puzzles for ${date}`);
      console.log(`   Themes: ${puzzleSet.puzzles.map(p => p.theme).join(', ')}`);
      
      // Wait a bit between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to generate puzzles for ${date}:`, error.message);
    }
  }
  
  console.log('\n🎉 Puzzle generation complete!');
}

// Run the generator
generateTestPuzzles().catch(console.error);