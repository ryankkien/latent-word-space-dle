import type { WordEmbedding } from '../types';
// Import the full GloVe embeddings (will be downloaded during build)
import gloveEmbeddingsData from './glove_embeddings_3d_full.json';

// Convert the loaded JSON data to WordEmbedding format
function generateWordEmbeddings(): WordEmbedding[] {
  return gloveEmbeddingsData as WordEmbedding[];
}

// Export the real word embeddings
export const wordEmbeddings: WordEmbedding[] = generateWordEmbeddings();

// Helper functions (keep the same interface as the old manual embeddings)
export function getRandomWord(): WordEmbedding {
  return wordEmbeddings[Math.floor(Math.random() * wordEmbeddings.length)];
}

export function getWordsByCategory(category: string): WordEmbedding[] {
  return wordEmbeddings.filter(w => w.category === category);
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

export function getWordsByDistance(position: { x: number; y: number; z: number }) {
  return wordEmbeddings
    .map(word => ({
      ...word,
      distance: calculateDistance(word.position, position)
    }))
    .sort((a, b) => a.distance - b.distance);
}

export function countWordsBetween(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  const distance = calculateDistance(pos1, pos2);
  
  return wordEmbeddings.filter(word => {
    const wordDistance = calculateDistance(word.position, pos2);
    return wordDistance < distance;
  }).length - 1;
}