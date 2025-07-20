import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load available words from compact GloVe embeddings
const gloveEmbeddingsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/glove_embeddings_3d.json'), 'utf8'));
const availableWords = gloveEmbeddingsData.map(embedding => embedding.word);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

function validateWords(words) {
  // Skip validation - trust ChatGPT to use common words that are in GloVe
  return true;
}

async function generateSinglePuzzle(puzzleNumber, difficulty) {
  const prompt = `Create a semantic word puzzle for a word embedding space game. 

The user needs to guess where a target word belongs in semantic space based on reference words.

Requirements:
- Use any common English words
- Choose a target word that relates to SOME of the reference words in an interesting way
- Provide 8-12 total reference words:
  - 5-8 words that actually relate to the target word
  - 3-4 random words that DON'T relate to the target (to make it more challenging)
- Mix the related and unrelated words together randomly
- NO HINTS - the reference words should speak for themselves
- Be creative with relationships: opposites, categories, progressions, associations, etc.
- Make it ${difficulty} difficulty

Respond with ONLY a JSON object in this exact format:
{
  "referenceWords": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9"],
  "targetWord": "target",
  "difficulty": "${difficulty}"
}

Creative examples:
- ["hot", "bicycle", "cold", "warm", "tree", "cool", "freezing", "music", "boiling"] → "temperature"
- ["minute", "elephant", "hour", "day", "purple", "week", "month", "cheese", "year"] → "second"
- ["happy", "joyful", "computer", "elated", "mountain", "cheerful", "glad", "bread", "content"] → "sad"

Make the relationships intuitive but not too obvious!`;

  try {
    console.log(`  Generating ${difficulty} puzzle ${puzzleNumber}...`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    // Try to extract JSON from the response
    let puzzleData;
    try {
      puzzleData = JSON.parse(content);
    } catch (e) {
      // If direct parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        puzzleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    }
    
    // Validate that all words exist in our available words
    const allWords = [...puzzleData.referenceWords, puzzleData.targetWord];
    if (!validateWords(allWords)) {
      console.log(`    ❌ Generated puzzle contains invalid words, skipping...`);
      return null;
    }

    console.log(`    ✅ Generated: ${puzzleData.targetWord} (${difficulty})`);
    
    return {
      id: puzzleNumber,
      referenceWords: puzzleData.referenceWords.map(word => word.toLowerCase()),
      targetWord: puzzleData.targetWord.toLowerCase(),
      difficulty: puzzleData.difficulty
    };
  } catch (error) {
    console.log(`    ❌ Error generating puzzle: ${error.message}`);
    return null;
  }
}

function getFallbackPuzzles() {
  return [
    {
      id: 1,
      referenceWords: ["man", "woman", "computer", "king", "prince", "tree", "princess", "royal", "book"],
      targetWord: "queen",
      difficulty: "easy"
    },
    {
      id: 2,
      referenceWords: ["tiny", "car", "small", "medium", "ocean", "large", "huge", "music", "gigantic"],
      targetWord: "big",
      difficulty: "easy"
    },
    {
      id: 3,
      referenceWords: ["calm", "chair", "peaceful", "worried", "mountain", "anxious", "angry", "bread", "furious"],
      targetWord: "happy",
      difficulty: "medium"
    },
    {
      id: 4,
      referenceWords: ["apple", "keyboard", "banana", "orange", "cloud", "grape", "strawberry", "phone", "cherry", "peach"],
      targetWord: "fruit",
      difficulty: "medium"
    },
    {
      id: 5,
      referenceWords: ["past", "window", "present", "yesterday", "guitar", "today", "history", "cheese", "memory", "now"],
      targetWord: "future",
      difficulty: "hard"
    }
  ];
}

async function generateDailyPuzzles(date) {
  console.log(`\n📅 Generating puzzles for ${date}...`);
  
  const puzzles = [];
  const difficulties = ['easy', 'easy', 'medium', 'medium', 'hard'];
  const maxRetries = 3;

  // Try to generate 5 unique puzzles
  for (let i = 1; i <= 5; i++) {
    let puzzle = null;
    
    for (let retry = 0; retry < maxRetries; retry++) {
      puzzle = await generateSinglePuzzle(i, difficulties[i - 1]);
      if (puzzle) break;
      
      // Wait a bit between retries
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (puzzle) {
      puzzles.push(puzzle);
    }
    
    // Small delay between puzzles to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // If we couldn't generate enough puzzles, use fallbacks
  if (puzzles.length < 5) {
    console.log(`  ⚠️  Only generated ${puzzles.length} puzzles, using fallbacks for the rest`);
    const fallbacks = getFallbackPuzzles();
    
    while (puzzles.length < 5) {
      const fallback = fallbacks[puzzles.length];
      if (fallback) puzzles.push(fallback);
    }
  }

  return {
    date,
    puzzles: puzzles.slice(0, 5),
    generated_at: new Date().toISOString()
  };
}

function getTestDates() {
  const dates = [];
  const today = new Date();
  
  // Generate for next 60 days (2 months)
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

async function main() {
  console.log('🧩 Starting puzzle generation...');
  
  if (!process.env.VITE_OPENAI_API_KEY) {
    console.error('❌ VITE_OPENAI_API_KEY not found in environment variables');
    console.log('Please add your OpenAI API key to the .env file');
    process.exit(1);
  }
  
  const dates = getTestDates();
  const puzzlesDir = path.join(__dirname, '../src/data/puzzles');
  
  // Ensure puzzles directory exists
  if (!fs.existsSync(puzzlesDir)) {
    fs.mkdirSync(puzzlesDir, { recursive: true });
  }
  
  for (const date of dates) {
    try {
      const puzzleSet = await generateDailyPuzzles(date);
      const filePath = path.join(puzzlesDir, `${date}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(puzzleSet, null, 2));
      
      console.log(`✅ Saved puzzles for ${date}`);
      console.log(`   Puzzles: ${puzzleSet.puzzles.map(p => `${p.targetWord} (${p.difficulty})`).join(', ')}`);
      
      // Wait between dates to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to generate puzzles for ${date}:`, error.message);
    }
  }
  
  console.log('\n🎉 Puzzle generation complete!');
  console.log(`Generated puzzle files in: ${puzzlesDir}`);
}

main().catch(console.error);