import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the full embeddings
const embeddingsPath = path.join(__dirname, '../src/data/glove_embeddings_3d_full.json');
const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));

// Create a map for quick lookup
const wordMap = new Map();
embeddings.forEach(embedding => {
  wordMap.set(embedding.word, embedding.position);
});

// Helper to get word with position
function getWordWithPosition(word) {
  const position = wordMap.get(word);
  if (!position) {
    console.warn(`Warning: Word "${word}" not found in embeddings`);
    return null;
  }
  return { word, position };
}

// Convert puzzle format
function convertPuzzle(puzzle) {
  const targetWord = getWordWithPosition(puzzle.targetWord);
  if (!targetWord) return null;
  
  const referenceWords = puzzle.referenceWords
    .map(word => getWordWithPosition(word))
    .filter(w => w !== null);
  
  if (referenceWords.length < puzzle.referenceWords.length) {
    console.warn(`Some reference words not found for puzzle ${puzzle.id}`);
  }
  
  return {
    ...puzzle,
    targetWord,
    referenceWords
  };
}

// Example puzzles to convert
const puzzles = [
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

// Convert all puzzles
const convertedPuzzles = puzzles
  .map(puzzle => convertPuzzle(puzzle))
  .filter(p => p !== null);

// Generate today's puzzle set
const today = new Date().toISOString().split('T')[0];
const puzzleSet = {
  date: today,
  puzzles: convertedPuzzles,
  generated_at: new Date().toISOString()
};

// Save to file
const outputPath = path.join(__dirname, '../src/data/puzzles', `${today}.json`);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(puzzleSet, null, 2));

console.log(`Generated puzzle set for ${today} with ${convertedPuzzles.length} puzzles`);
console.log(`Saved to: ${outputPath}`);

// Also create a default fallback set
const fallbackPath = path.join(__dirname, '../src/data/puzzles', 'fallback.json');
fs.writeFileSync(fallbackPath, JSON.stringify(puzzleSet, null, 2));
console.log(`Also saved fallback puzzles to: ${fallbackPath}`);