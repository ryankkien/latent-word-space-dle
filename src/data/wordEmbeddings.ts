import type { WordEmbedding } from '../types';

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
  { word: "tiger", position: { x: 2.6, y: 3.6, z: 1.7 }, category: "animals" },
  { word: "bear", position: { x: 2.7, y: 3.3, z: 1.5 }, category: "animals" },
  { word: "rabbit", position: { x: 2.0, y: 3.5, z: 1.0 }, category: "animals" },
  { word: "horse", position: { x: 2.4, y: 3.7, z: 1.3 }, category: "animals" },
  { word: "sheep", position: { x: 2.2, y: 3.3, z: 1.1 }, category: "animals" },
  { word: "pig", position: { x: 2.3, y: 3.4, z: 1.2 }, category: "animals" },
  { word: "cow", position: { x: 2.4, y: 3.3, z: 1.3 }, category: "animals" },
  { word: "chicken", position: { x: 2.1, y: 3.8, z: 1.0 }, category: "animals" },
  { word: "duck", position: { x: 1.9, y: 3.9, z: 0.8 }, category: "animals" },
  { word: "goat", position: { x: 2.3, y: 3.5, z: 1.2 }, category: "animals" },
  { word: "monkey", position: { x: 2.2, y: 3.6, z: 1.5 }, category: "animals" },
  { word: "snake", position: { x: 1.8, y: 3.7, z: 1.3 }, category: "animals" },
  { word: "turtle", position: { x: 1.7, y: 3.8, z: 0.9 }, category: "animals" },
  
  // Food cluster
  { word: "apple", position: { x: -1.2, y: 2.3, z: 0.5 }, category: "food" },
  { word: "banana", position: { x: -1.4, y: 2.1, z: 0.6 }, category: "food" },
  { word: "bread", position: { x: -0.9, y: 2.5, z: 0.8 }, category: "food" },
  { word: "cheese", position: { x: -1.0, y: 2.7, z: 0.7 }, category: "food" },
  { word: "pizza", position: { x: -0.8, y: 2.4, z: 0.9 }, category: "food" },
  { word: "cake", position: { x: -1.3, y: 2.6, z: 0.4 }, category: "food" },
  { word: "orange", position: { x: -1.3, y: 2.2, z: 0.5 }, category: "food" },
  { word: "grape", position: { x: -1.5, y: 2.2, z: 0.6 }, category: "food" },
  { word: "strawberry", position: { x: -1.4, y: 2.3, z: 0.4 }, category: "food" },
  { word: "chocolate", position: { x: -1.2, y: 2.7, z: 0.3 }, category: "food" },
  { word: "coffee", position: { x: -0.7, y: 2.8, z: 0.6 }, category: "food" },
  { word: "tea", position: { x: -0.8, y: 2.9, z: 0.5 }, category: "food" },
  { word: "milk", position: { x: -0.9, y: 2.8, z: 0.7 }, category: "food" },
  { word: "water", position: { x: -0.6, y: 3.0, z: 0.4 }, category: "food" },
  { word: "juice", position: { x: -0.7, y: 2.9, z: 0.5 }, category: "food" },
  { word: "pasta", position: { x: -0.9, y: 2.4, z: 0.9 }, category: "food" },
  { word: "rice", position: { x: -1.0, y: 2.3, z: 0.8 }, category: "food" },
  { word: "meat", position: { x: -1.1, y: 2.5, z: 1.0 }, category: "food" },
  { word: "vegetable", position: { x: -1.3, y: 2.4, z: 0.7 }, category: "food" },
  { word: "fruit", position: { x: -1.4, y: 2.2, z: 0.5 }, category: "food" },
  
  // Technology cluster
  { word: "computer", position: { x: 3.5, y: -1.2, z: 2.1 }, category: "technology" },
  { word: "phone", position: { x: 3.3, y: -1.4, z: 2.0 }, category: "technology" },
  { word: "laptop", position: { x: 3.7, y: -1.1, z: 2.2 }, category: "technology" },
  { word: "internet", position: { x: 3.9, y: -0.9, z: 2.4 }, category: "technology" },
  { word: "software", position: { x: 3.6, y: -1.3, z: 2.3 }, category: "technology" },
  { word: "robot", position: { x: 4.1, y: -1.0, z: 2.5 }, category: "technology" },
  { word: "tablet", position: { x: 3.4, y: -1.3, z: 2.1 }, category: "technology" },
  { word: "keyboard", position: { x: 3.6, y: -1.2, z: 2.0 }, category: "technology" },
  { word: "mouse", position: { x: 3.5, y: -1.3, z: 1.9 }, category: "technology" },
  { word: "screen", position: { x: 3.7, y: -1.2, z: 2.1 }, category: "technology" },
  { word: "camera", position: { x: 3.4, y: -1.5, z: 2.0 }, category: "technology" },
  { word: "printer", position: { x: 3.8, y: -1.4, z: 2.2 }, category: "technology" },
  { word: "wifi", position: { x: 3.9, y: -1.0, z: 2.3 }, category: "technology" },
  { word: "app", position: { x: 3.5, y: -1.1, z: 2.2 }, category: "technology" },
  { word: "website", position: { x: 3.8, y: -0.9, z: 2.4 }, category: "technology" },
  { word: "email", position: { x: 3.7, y: -1.0, z: 2.3 }, category: "technology" },
  { word: "data", position: { x: 3.6, y: -1.2, z: 2.4 }, category: "technology" },
  { word: "code", position: { x: 3.7, y: -1.3, z: 2.3 }, category: "technology" },
  { word: "algorithm", position: { x: 3.8, y: -1.2, z: 2.5 }, category: "technology" },
  { word: "network", position: { x: 3.9, y: -1.1, z: 2.4 }, category: "technology" },
  
  // Nature cluster
  { word: "tree", position: { x: -2.1, y: -1.8, z: -0.5 }, category: "nature" },
  { word: "flower", position: { x: -2.3, y: -1.6, z: -0.7 }, category: "nature" },
  { word: "mountain", position: { x: -1.9, y: -2.2, z: -0.3 }, category: "nature" },
  { word: "ocean", position: { x: -2.5, y: -2.0, z: -0.9 }, category: "nature" },
  { word: "river", position: { x: -2.4, y: -1.9, z: -0.8 }, category: "nature" },
  { word: "forest", position: { x: -2.0, y: -2.1, z: -0.4 }, category: "nature" },
  { word: "lake", position: { x: -2.3, y: -1.9, z: -0.7 }, category: "nature" },
  { word: "beach", position: { x: -2.6, y: -1.8, z: -0.8 }, category: "nature" },
  { word: "desert", position: { x: -1.8, y: -2.3, z: -0.2 }, category: "nature" },
  { word: "rain", position: { x: -2.2, y: -1.5, z: -0.6 }, category: "nature" },
  { word: "snow", position: { x: -2.1, y: -1.4, z: -0.5 }, category: "nature" },
  { word: "wind", position: { x: -2.0, y: -1.5, z: -0.4 }, category: "nature" },
  { word: "sun", position: { x: -1.9, y: -1.3, z: -0.3 }, category: "nature" },
  { word: "moon", position: { x: -1.8, y: -1.4, z: -0.2 }, category: "nature" },
  { word: "star", position: { x: -1.7, y: -1.3, z: -0.1 }, category: "nature" },
  { word: "cloud", position: { x: -2.0, y: -1.6, z: -0.5 }, category: "nature" },
  { word: "grass", position: { x: -2.2, y: -1.7, z: -0.6 }, category: "nature" },
  { word: "rock", position: { x: -1.9, y: -2.0, z: -0.4 }, category: "nature" },
  { word: "sand", position: { x: -2.5, y: -1.9, z: -0.7 }, category: "nature" },
  { word: "wave", position: { x: -2.6, y: -2.0, z: -0.8 }, category: "nature" },
  
  // Emotions cluster
  { word: "happy", position: { x: 0.5, y: 1.2, z: -1.5 }, category: "emotions" },
  { word: "sad", position: { x: 0.3, y: 0.8, z: -1.7 }, category: "emotions" },
  { word: "angry", position: { x: 0.7, y: 0.9, z: -1.9 }, category: "emotions" },
  { word: "excited", position: { x: 0.6, y: 1.4, z: -1.4 }, category: "emotions" },
  { word: "calm", position: { x: 0.2, y: 1.0, z: -1.6 }, category: "emotions" },
  { word: "love", position: { x: 0.4, y: 1.3, z: -1.3 }, category: "emotions" },
  { word: "fear", position: { x: 0.8, y: 0.7, z: -1.8 }, category: "emotions" },
  { word: "joy", position: { x: 0.5, y: 1.3, z: -1.4 }, category: "emotions" },
  { word: "surprise", position: { x: 0.7, y: 1.1, z: -1.6 }, category: "emotions" },
  { word: "disgust", position: { x: 0.9, y: 0.8, z: -1.9 }, category: "emotions" },
  { word: "trust", position: { x: 0.3, y: 1.2, z: -1.5 }, category: "emotions" },
  { word: "anxiety", position: { x: 0.6, y: 0.7, z: -1.8 }, category: "emotions" },
  { word: "hope", position: { x: 0.4, y: 1.4, z: -1.3 }, category: "emotions" },
  { word: "pride", position: { x: 0.6, y: 1.2, z: -1.5 }, category: "emotions" },
  { word: "shame", position: { x: 0.4, y: 0.6, z: -1.8 }, category: "emotions" },
  { word: "guilt", position: { x: 0.5, y: 0.7, z: -1.7 }, category: "emotions" },
  { word: "envy", position: { x: 0.8, y: 0.9, z: -1.8 }, category: "emotions" },
  { word: "gratitude", position: { x: 0.3, y: 1.3, z: -1.4 }, category: "emotions" },
  { word: "empathy", position: { x: 0.2, y: 1.2, z: -1.5 }, category: "emotions" },
  { word: "compassion", position: { x: 0.3, y: 1.1, z: -1.4 }, category: "emotions" },
  
  // Transportation cluster
  { word: "car", position: { x: 1.5, y: -2.5, z: 1.8 }, category: "transportation" },
  { word: "train", position: { x: 1.7, y: -2.3, z: 2.0 }, category: "transportation" },
  { word: "airplane", position: { x: 1.9, y: -2.1, z: 2.2 }, category: "transportation" },
  { word: "bicycle", position: { x: 1.3, y: -2.7, z: 1.6 }, category: "transportation" },
  { word: "boat", position: { x: 1.6, y: -2.4, z: 1.9 }, category: "transportation" },
  { word: "bus", position: { x: 1.6, y: -2.5, z: 1.9 }, category: "transportation" },
  { word: "truck", position: { x: 1.5, y: -2.4, z: 1.8 }, category: "transportation" },
  { word: "motorcycle", position: { x: 1.4, y: -2.6, z: 1.7 }, category: "transportation" },
  { word: "helicopter", position: { x: 2.0, y: -2.0, z: 2.3 }, category: "transportation" },
  { word: "subway", position: { x: 1.8, y: -2.3, z: 2.0 }, category: "transportation" },
  { word: "taxi", position: { x: 1.5, y: -2.6, z: 1.8 }, category: "transportation" },
  { word: "ship", position: { x: 1.7, y: -2.4, z: 2.0 }, category: "transportation" },
  { word: "rocket", position: { x: 2.1, y: -1.9, z: 2.4 }, category: "transportation" },
  { word: "scooter", position: { x: 1.3, y: -2.8, z: 1.6 }, category: "transportation" },
  { word: "skateboard", position: { x: 1.2, y: -2.8, z: 1.5 }, category: "transportation" },
  
  // Colors cluster
  { word: "red", position: { x: -3.2, y: 0.5, z: 0.2 }, category: "colors" },
  { word: "blue", position: { x: -3.4, y: 0.3, z: 0.4 }, category: "colors" },
  { word: "green", position: { x: -3.3, y: 0.4, z: 0.3 }, category: "colors" },
  { word: "yellow", position: { x: -3.1, y: 0.6, z: 0.1 }, category: "colors" },
  { word: "purple", position: { x: -3.5, y: 0.2, z: 0.5 }, category: "colors" },
  { word: "orange", position: { x: -3.1, y: 0.5, z: 0.2 }, category: "colors" },
  { word: "pink", position: { x: -3.3, y: 0.3, z: 0.3 }, category: "colors" },
  { word: "brown", position: { x: -3.0, y: 0.4, z: 0.1 }, category: "colors" },
  { word: "black", position: { x: -3.6, y: 0.1, z: 0.6 }, category: "colors" },
  { word: "white", position: { x: -3.7, y: 0.0, z: 0.7 }, category: "colors" },
  { word: "gray", position: { x: -3.6, y: 0.1, z: 0.6 }, category: "colors" },
  { word: "gold", position: { x: -3.0, y: 0.6, z: 0.0 }, category: "colors" },
  { word: "silver", position: { x: -3.1, y: 0.5, z: 0.1 }, category: "colors" },
  
  // Abstract concepts
  { word: "time", position: { x: 0.0, y: 0.0, z: 3.0 }, category: "abstract" },
  { word: "space", position: { x: 0.2, y: -0.2, z: 3.2 }, category: "abstract" },
  { word: "idea", position: { x: -0.1, y: 0.1, z: 2.9 }, category: "abstract" },
  { word: "thought", position: { x: 0.1, y: -0.1, z: 3.1 }, category: "abstract" },
  { word: "dream", position: { x: -0.2, y: 0.2, z: 2.8 }, category: "abstract" },
  { word: "memory", position: { x: 0.0, y: 0.1, z: 2.9 }, category: "abstract" },
  { word: "future", position: { x: 0.1, y: 0.0, z: 3.1 }, category: "abstract" },
  { word: "past", position: { x: -0.1, y: 0.0, z: 2.9 }, category: "abstract" },
  { word: "present", position: { x: 0.0, y: 0.0, z: 3.0 }, category: "abstract" },
  { word: "reality", position: { x: 0.3, y: -0.1, z: 3.2 }, category: "abstract" },
  { word: "truth", position: { x: 0.2, y: 0.1, z: 3.1 }, category: "abstract" },
  { word: "lie", position: { x: -0.2, y: -0.1, z: 2.9 }, category: "abstract" },
  { word: "belief", position: { x: 0.1, y: 0.2, z: 3.0 }, category: "abstract" },
  { word: "knowledge", position: { x: 0.2, y: 0.0, z: 3.1 }, category: "abstract" },
  { word: "wisdom", position: { x: 0.3, y: 0.1, z: 3.2 }, category: "abstract" },
  
  // Body parts cluster
  { word: "hand", position: { x: -0.5, y: -3.2, z: -1.2 }, category: "body" },
  { word: "foot", position: { x: -0.4, y: -3.4, z: -1.3 }, category: "body" },
  { word: "head", position: { x: -0.3, y: -3.0, z: -1.1 }, category: "body" },
  { word: "eye", position: { x: -0.3, y: -3.1, z: -1.2 }, category: "body" },
  { word: "ear", position: { x: -0.4, y: -3.1, z: -1.2 }, category: "body" },
  { word: "nose", position: { x: -0.3, y: -3.2, z: -1.2 }, category: "body" },
  { word: "mouth", position: { x: -0.3, y: -3.3, z: -1.2 }, category: "body" },
  { word: "arm", position: { x: -0.5, y: -3.3, z: -1.3 }, category: "body" },
  { word: "leg", position: { x: -0.4, y: -3.5, z: -1.3 }, category: "body" },
  { word: "finger", position: { x: -0.6, y: -3.2, z: -1.2 }, category: "body" },
  { word: "heart", position: { x: -0.2, y: -3.2, z: -1.1 }, category: "body" },
  { word: "brain", position: { x: -0.2, y: -3.0, z: -1.0 }, category: "body" },
  { word: "stomach", position: { x: -0.3, y: -3.4, z: -1.2 }, category: "body" },
  { word: "back", position: { x: -0.4, y: -3.3, z: -1.3 }, category: "body" },
  { word: "shoulder", position: { x: -0.5, y: -3.2, z: -1.3 }, category: "body" },
  
  // Clothing cluster
  { word: "shirt", position: { x: 2.8, y: 1.2, z: -0.5 }, category: "clothing" },
  { word: "pants", position: { x: 2.9, y: 1.0, z: -0.4 }, category: "clothing" },
  { word: "shoes", position: { x: 3.0, y: 0.9, z: -0.3 }, category: "clothing" },
  { word: "hat", position: { x: 2.7, y: 1.3, z: -0.6 }, category: "clothing" },
  { word: "dress", position: { x: 2.9, y: 1.1, z: -0.5 }, category: "clothing" },
  { word: "jacket", position: { x: 2.8, y: 1.1, z: -0.4 }, category: "clothing" },
  { word: "socks", position: { x: 3.0, y: 0.8, z: -0.2 }, category: "clothing" },
  { word: "gloves", position: { x: 2.7, y: 1.2, z: -0.5 }, category: "clothing" },
  { word: "scarf", position: { x: 2.6, y: 1.3, z: -0.6 }, category: "clothing" },
  { word: "belt", position: { x: 2.9, y: 1.0, z: -0.3 }, category: "clothing" },
  { word: "tie", position: { x: 2.8, y: 1.2, z: -0.4 }, category: "clothing" },
  { word: "skirt", position: { x: 2.9, y: 1.1, z: -0.5 }, category: "clothing" },
  { word: "coat", position: { x: 2.8, y: 1.0, z: -0.4 }, category: "clothing" },
  { word: "sweater", position: { x: 2.7, y: 1.1, z: -0.5 }, category: "clothing" },
  { word: "boots", position: { x: 3.0, y: 0.9, z: -0.2 }, category: "clothing" },
  
  // Sports cluster
  { word: "football", position: { x: -1.2, y: -0.5, z: 1.8 }, category: "sports" },
  { word: "basketball", position: { x: -1.3, y: -0.4, z: 1.9 }, category: "sports" },
  { word: "baseball", position: { x: -1.1, y: -0.6, z: 1.7 }, category: "sports" },
  { word: "soccer", position: { x: -1.2, y: -0.5, z: 1.8 }, category: "sports" },
  { word: "tennis", position: { x: -1.0, y: -0.7, z: 1.6 }, category: "sports" },
  { word: "golf", position: { x: -0.9, y: -0.8, z: 1.5 }, category: "sports" },
  { word: "swimming", position: { x: -1.4, y: -0.3, z: 2.0 }, category: "sports" },
  { word: "running", position: { x: -1.5, y: -0.2, z: 2.1 }, category: "sports" },
  { word: "cycling", position: { x: -1.4, y: -0.4, z: 2.0 }, category: "sports" },
  { word: "hockey", position: { x: -1.2, y: -0.6, z: 1.8 }, category: "sports" },
  { word: "volleyball", position: { x: -1.3, y: -0.5, z: 1.9 }, category: "sports" },
  { word: "boxing", position: { x: -1.1, y: -0.7, z: 1.7 }, category: "sports" },
  { word: "skiing", position: { x: -1.0, y: -0.9, z: 1.6 }, category: "sports" },
  { word: "surfing", position: { x: -1.4, y: -0.4, z: 2.0 }, category: "sports" },
  { word: "yoga", position: { x: -1.5, y: -0.3, z: 2.1 }, category: "sports" },
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