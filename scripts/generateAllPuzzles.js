import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  console.error('Please set it before running this script:');
  console.error('OPENAI_API_KEY="your-key" node scripts/generateAllPuzzles.js');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: apiKey,
});

// Load the full embeddings
const embeddingsPath = path.join(__dirname, '../src/data/glove_embeddings_3d_full.json');
const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));

// Create a map for quick lookup
const wordMap = new Map();
embeddings.forEach(embedding => {
  wordMap.set(embedding.word, embedding.position);
});

// Get all available words
const availableWords = embeddings.map(e => e.word);

// Helper to get word with position
function getWordWithPosition(word) {
  const position = wordMap.get(word);
  if (!position) {
    console.warn(`Warning: Word "${word}" not found in embeddings`);
    return null;
  }
  return { word, position };
}

// Generate a single puzzle using OpenAI
async function generateSinglePuzzle(puzzleNumber, usedWords = new Set()) {
  const difficulties = ['easy', 'medium', 'hard'];
  const difficulty = difficulties[puzzleNumber % 3];
  
  const prompt = `Create a semantic word puzzle for a word embedding space game. 

The user needs to guess where a target word belongs in semantic space based on reference words.

Requirements:
- Use ONLY words from this list: ${availableWords.filter(w => !usedWords.has(w)).slice(0, 1000).join(', ')}
- Choose a target word that relates to the reference words in an interesting way
- Provide exactly 9 reference words that help indicate where the target word should be placed
- Include a mix of words that are close to and far from the target word
- NO HINTS - the reference words should speak for themselves
- Be creative with relationships: opposites, categories, progressions, associations, etc.
- Make it ${difficulty} difficulty
- DO NOT use any of these words that have already been used: ${Array.from(usedWords).join(', ')}

Respond with ONLY a JSON object in this exact format:
{
  "referenceWords": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9"],
  "targetWord": "target",
  "difficulty": "${difficulty}"
}

Creative puzzle themes to consider:
- Emotions and feelings
- Time and temporal concepts
- Size and scale
- Movement and action
- Nature and environment
- Technology and innovation
- Abstract concepts
- Sensory experiences
- Social relationships
- Academic subjects

Make sure all words exist in the provided list!`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    });

    let content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    // Clean up response if it contains markdown code blocks
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const puzzleData = JSON.parse(content);
    
    // Validate that all words exist in our embeddings
    const allWords = [...puzzleData.referenceWords, puzzleData.targetWord];
    const validWords = allWords.every(word => wordMap.has(word));
    
    if (!validWords) {
      console.log('Generated puzzle contains invalid words, retrying...');
      return null;
    }

    // Convert to our format with positions
    const targetWord = getWordWithPosition(puzzleData.targetWord);
    const referenceWords = puzzleData.referenceWords
      .map(word => getWordWithPosition(word))
      .filter(w => w !== null);

    if (!targetWord || referenceWords.length < 9) {
      console.log('Could not find all word embeddings, retrying...');
      return null;
    }

    // Add used words
    allWords.forEach(word => usedWords.add(word));

    return {
      id: puzzleNumber,
      referenceWords,
      targetWord,
      difficulty: puzzleData.difficulty
    };
  } catch (error) {
    console.error('Error generating puzzle:', error);
    return null;
  }
}

// Generate puzzles for a specific date
async function generatePuzzlesForDate(date, usedWords) {
  const puzzles = [];
  const maxRetries = 3;

  // Generate 5 puzzles for the day
  for (let i = 1; i <= 5; i++) {
    let puzzle = null;
    
    for (let retry = 0; retry < maxRetries; retry++) {
      puzzle = await generateSinglePuzzle(i, usedWords);
      if (puzzle) break;
      
      // Wait a bit between retries
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (puzzle) {
      puzzles.push(puzzle);
    } else {
      console.error(`Failed to generate puzzle ${i} for ${date}`);
    }
  }

  return {
    date,
    puzzles,
    generated_at: new Date().toISOString()
  };
}

// Main function to generate all puzzles
async function generateAllPuzzles() {
  const startDate = new Date();
  const usedWords = new Set();
  
  // Create output directory
  const outputDir = path.join(__dirname, '../src/data/puzzles');
  fs.mkdirSync(outputDir, { recursive: true });
  
  console.log('Starting puzzle generation for 60 days...');
  
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    console.log(`\nGenerating puzzles for ${dateStr} (day ${dayOffset + 1}/60)...`);
    
    // Check if file already exists
    const outputPath = path.join(outputDir, `${dateStr}.json`);
    if (fs.existsSync(outputPath)) {
      console.log(`Puzzles for ${dateStr} already exist, skipping...`);
      continue;
    }
    
    try {
      const puzzleSet = await generatePuzzlesForDate(dateStr, usedWords);
      
      if (puzzleSet.puzzles.length === 5) {
        // Save to file
        fs.writeFileSync(outputPath, JSON.stringify(puzzleSet, null, 2));
        console.log(`✅ Generated and saved 5 puzzles for ${dateStr}`);
      } else {
        console.error(`❌ Only generated ${puzzleSet.puzzles.length} puzzles for ${dateStr}`);
      }
      
      // Rate limiting - wait between days
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to generate puzzles for ${dateStr}:`, error);
    }
  }
  
  console.log('\n✅ Puzzle generation complete!');
  console.log(`Total words used: ${usedWords.size}`);
}

// Run the generator
generateAllPuzzles().catch(console.error);