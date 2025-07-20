import type { WordEmbedding } from '../types';
import type { DailyPuzzleSet } from '../services/puzzleGenerator';
import { loadDailyEmbeddings, clearDailyEmbeddingsCache } from './dailyEmbeddings';

// Lazy-loaded embeddings
let wordEmbeddings: WordEmbedding[] | null = null;
let loadingPromise: Promise<WordEmbedding[]> | null = null;
let isDailyMode = false;

// Load embeddings asynchronously
async function loadEmbeddings(): Promise<WordEmbedding[]> {
  if (wordEmbeddings) {
    return wordEmbeddings;
  }
  
  if (loadingPromise) {
    return loadingPromise;
  }
  
  loadingPromise = import('./glove_embeddings_3d_full.json').then(module => {
    wordEmbeddings = module.default as WordEmbedding[];
    return wordEmbeddings;
  });
  
  return loadingPromise;
}

// Initialize with daily puzzles for optimized loading
export async function initializeForDailyPuzzles(puzzleSet: DailyPuzzleSet): Promise<void> {
  isDailyMode = true;
  wordEmbeddings = await loadDailyEmbeddings(puzzleSet);
  loadingPromise = Promise.resolve(wordEmbeddings);
}

// Export async getter for embeddings
export async function getWordEmbeddings(): Promise<WordEmbedding[]> {
  if (isDailyMode && wordEmbeddings) {
    return wordEmbeddings;
  }
  return loadEmbeddings();
}

// Find a specific word embedding
export async function findWordEmbedding(word: string): Promise<WordEmbedding | undefined> {
  const embeddings = await getWordEmbeddings();
  return embeddings.find(w => w.word === word);
}

// Helper functions (now async)
export async function getRandomWord(): Promise<WordEmbedding> {
  const embeddings = await getWordEmbeddings();
  return embeddings[Math.floor(Math.random() * embeddings.length)];
}

export async function getWordsByCategory(category: string): Promise<WordEmbedding[]> {
  const embeddings = await getWordEmbeddings();
  return embeddings.filter(w => w.category === category);
}

export function calculateDistance(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) +
    Math.pow(pos1.y - pos2.y, 2) +
    Math.pow(pos1.z - pos2.z, 2)
  );
}

export async function getWordsByDistance(position: { x: number; y: number; z: number }) {
  const embeddings = await getWordEmbeddings();
  return embeddings
    .map(word => ({
      ...word,
      distance: calculateDistance(word.position, position)
    }))
    .sort((a, b) => a.distance - b.distance);
}

export async function countWordsBetween(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): Promise<number> {
  const embeddings = await getWordEmbeddings();
  const distance = calculateDistance(pos1, pos2);
  
  return embeddings.filter(word => {
    const wordDistance = calculateDistance(word.position, pos2);
    return wordDistance < distance;
  }).length - 1;
}

// Synchronous versions for compatibility (uses cached data only)
export function calculateDistanceSync(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  return calculateDistance(pos1, pos2);
}

export function countWordsBetweenSync(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  if (!wordEmbeddings) {
    console.warn('Word embeddings not loaded yet, returning 0');
    return 0;
  }
  
  const distance = calculateDistance(pos1, pos2);
  
  return wordEmbeddings.filter(word => {
    const wordDistance = calculateDistance(word.position, pos2);
    return wordDistance < distance;
  }).length - 1;
}

// Preload embeddings (can be called on app init)
export function preloadEmbeddings(): Promise<void> {
  return loadEmbeddings().then(() => undefined);
}

// Clear cache and reset mode
export function clearEmbeddingsCache(): void {
  wordEmbeddings = null;
  loadingPromise = null;
  isDailyMode = false;
  clearDailyEmbeddingsCache();
}