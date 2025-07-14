import { WordEmbedding } from '../types';

// Pre-computed word embeddings with semantic clustering
// Words are positioned so that semantically similar words are closer together
export const wordEmbeddings: WordEmbedding[] = [
  // Animals cluster
  { word: "cat", position: { x: 2.1, y: 3.4, z: 1.2 }, category: "animals" },
  { word: "dog", position: { x: 2.3, y: 3.2, z: 1.4 }, category: "animals" },
  { word: "mouse", position: { x: 1.9, y: 3.6, z: 1.1 }, category: "animals" },
  { word: "elephant", position: { x: 2.8, y: 3.8, z: 1.8 }, category: "animals" },
  { word: "lion", position: { x: 2.5, y: 3.5, z: 1.6 }, category: "animals" },
  { word: "bird", position: { x: 2.0, y: 4.1, z: 0.9 }, category: "animals" },
  { word: "fish", position: { x: 1.8, y: 3.9, z: 0.7 }, category: "animals" },
  
  // Food cluster
  { word: "apple", position: { x: -1.2, y: 2.3, z: 0.5 }, category: "food" },
  { word: "banana", position: { x: -1.4, y: 2.1, z: 0.6 }, category: "food" },
  { word: "bread", position: { x: -0.9, y: 2.5, z: 0.8 }, category: "food" },
  { word: "cheese", position: { x: -1.0, y: 2.7, z: 0.7 }, category: "food" },
  { word: "pizza", position: { x: -0.8, y: 2.4, z: 0.9 }, category: "food" },
  { word: "cake", position: { x: -1.3, y: 2.6, z: 0.4 }, category: "food" },
  
  // Technology cluster
  { word: "computer", position: { x: 3.5, y: -1.2, z: 2.1 }, category: "technology" },
  { word: "phone", position: { x: 3.3, y: -1.4, z: 2.0 }, category: "technology" },
  { word: "laptop", position: { x: 3.7, y: -1.1, z: 2.2 }, category: "technology" },
  { word: "internet", position: { x: 3.9, y: -0.9, z: 2.4 }, category: "technology" },
  { word: "software", position: { x: 3.6, y: -1.3, z: 2.3 }, category: "technology" },
  { word: "robot", position: { x: 4.1, y: -1.0, z: 2.5 }, category: "technology" },
  
  // Nature cluster
  { word: "tree", position: { x: -2.1, y: -1.8, z: -0.5 }, category: "nature" },
  { word: "flower", position: { x: -2.3, y: -1.6, z: -0.7 }, category: "nature" },
  { word: "mountain", position: { x: -1.9, y: -2.2, z: -0.3 }, category: "nature" },
  { word: "ocean", position: { x: -2.5, y: -2.0, z: -0.9 }, category: "nature" },
  { word: "river", position: { x: -2.4, y: -1.9, z: -0.8 }, category: "nature" },
  { word: "forest", position: { x: -2.0, y: -2.1, z: -0.4 }, category: "nature" },
  
  // Emotions cluster
  { word: "happy", position: { x: 0.5, y: 1.2, z: -1.5 }, category: "emotions" },
  { word: "sad", position: { x: 0.3, y: 0.8, z: -1.7 }, category: "emotions" },
  { word: "angry", position: { x: 0.7, y: 0.9, z: -1.9 }, category: "emotions" },
  { word: "excited", position: { x: 0.6, y: 1.4, z: -1.4 }, category: "emotions" },
  { word: "calm", position: { x: 0.2, y: 1.0, z: -1.6 }, category: "emotions" },
  { word: "love", position: { x: 0.4, y: 1.3, z: -1.3 }, category: "emotions" },
  
  // Transportation cluster
  { word: "car", position: { x: 1.5, y: -2.5, z: 1.8 }, category: "transportation" },
  { word: "train", position: { x: 1.7, y: -2.3, z: 2.0 }, category: "transportation" },
  { word: "airplane", position: { x: 1.9, y: -2.1, z: 2.2 }, category: "transportation" },
  { word: "bicycle", position: { x: 1.3, y: -2.7, z: 1.6 }, category: "transportation" },
  { word: "boat", position: { x: 1.6, y: -2.4, z: 1.9 }, category: "transportation" },
  
  // Colors cluster
  { word: "red", position: { x: -3.2, y: 0.5, z: 0.2 }, category: "colors" },
  { word: "blue", position: { x: -3.4, y: 0.3, z: 0.4 }, category: "colors" },
  { word: "green", position: { x: -3.3, y: 0.4, z: 0.3 }, category: "colors" },
  { word: "yellow", position: { x: -3.1, y: 0.6, z: 0.1 }, category: "colors" },
  { word: "purple", position: { x: -3.5, y: 0.2, z: 0.5 }, category: "colors" },
  
  // Abstract concepts
  { word: "time", position: { x: 0.0, y: 0.0, z: 3.0 }, category: "abstract" },
  { word: "space", position: { x: 0.2, y: -0.2, z: 3.2 }, category: "abstract" },
  { word: "idea", position: { x: -0.1, y: 0.1, z: 2.9 }, category: "abstract" },
  { word: "thought", position: { x: 0.1, y: -0.1, z: 3.1 }, category: "abstract" },
];

// Helper function to get a random word
export function getRandomWord(): WordEmbedding {
  return wordEmbeddings[Math.floor(Math.random() * wordEmbeddings.length)];
}

// Helper function to get words by category
export function getWordsByCategory(category: string): WordEmbedding[] {
  return wordEmbeddings.filter(w => w.category === category);
}

// Calculate Euclidean distance between two positions
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

// Get words sorted by distance from a position
export function getWordsByDistance(position: { x: number; y: number; z: number }) {
  return wordEmbeddings
    .map(word => ({
      ...word,
      distance: calculateDistance(word.position, position)
    }))
    .sort((a, b) => a.distance - b.distance);
}

// Count words between two positions
export function countWordsBetween(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  const distance = calculateDistance(pos1, pos2);
  
  // Count how many words are closer to pos2 than pos1 is
  return wordEmbeddings.filter(word => {
    const wordDistance = calculateDistance(word.position, pos2);
    return wordDistance < distance;
  }).length - 1; // Subtract 1 to exclude the target word itself
}