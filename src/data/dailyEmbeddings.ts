import type { WordEmbedding } from '../types';
import type { DailyPuzzleSet } from '../services/puzzleGenerator';

// Cache for daily embeddings
let dailyEmbeddings: WordEmbedding[] | null = null;
let loadingPromise: Promise<WordEmbedding[]> | null = null;

// Extract all words needed for today's puzzles
function extractRequiredWords(puzzleSet: DailyPuzzleSet): Set<string> {
  const words = new Set<string>();
  
  puzzleSet.puzzles.forEach(puzzle => {
    // Add target word
    words.add(puzzle.targetWord);
    
    // Add all reference words
    puzzle.referenceWords.forEach(word => words.add(word));
  });
  
  // Add some nearby words for better visualization (optional)
  // This helps with the "words between" calculation
  const additionalWords = [
    // Common semantic neighbors
    'is', 'was', 'are', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'good', 'bad', 'new', 'old', 'first', 'last', 'long', 'short', 'high', 'low',
    'great', 'little', 'own', 'other', 'same', 'different', 'early', 'late',
    'young', 'old', 'few', 'many', 'more', 'less', 'most', 'least',
    'work', 'play', 'love', 'hate', 'want', 'need', 'give', 'take', 'make', 'break'
  ];
  
  additionalWords.forEach(word => words.add(word));
  
  return words;
}

// Load only the embeddings needed for today
export async function loadDailyEmbeddings(puzzleSet: DailyPuzzleSet): Promise<WordEmbedding[]> {
  if (dailyEmbeddings) {
    return dailyEmbeddings;
  }
  
  if (loadingPromise) {
    return loadingPromise;
  }
  
  loadingPromise = (async () => {
    try {
      // Get all required words
      const requiredWords = extractRequiredWords(puzzleSet);
      
      // Load the full embeddings file
      const module = await import('./glove_embeddings_3d_full.json');
      const allEmbeddings = module.default as WordEmbedding[];
      
      // Filter to only include required words and their neighbors
      const filteredEmbeddings = allEmbeddings.filter(embedding => {
        // Include if it's a required word
        if (requiredWords.has(embedding.word)) {
          return true;
        }
        
        // Include some random words for density (10% chance)
        // This helps make the space feel more realistic
        return Math.random() < 0.1;
      });
      
      dailyEmbeddings = filteredEmbeddings;
      
      console.log(`Loaded ${filteredEmbeddings.length} embeddings out of ${allEmbeddings.length} total`);
      console.log(`Size reduction: ${((1 - filteredEmbeddings.length / allEmbeddings.length) * 100).toFixed(1)}%`);
      
      return filteredEmbeddings;
    } catch (error) {
      console.error('Error loading daily embeddings:', error);
      // Fall back to empty array
      dailyEmbeddings = [];
      return [];
    }
  })();
  
  return loadingPromise;
}

// Clear the cache (useful when date changes)
export function clearDailyEmbeddingsCache(): void {
  dailyEmbeddings = null;
  loadingPromise = null;
}