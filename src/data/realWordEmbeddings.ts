import type { WordEmbedding } from '../types';
import { getGlovePosition } from './gloveEmbeddings';

// Generate word embeddings from GloVe data
function generateWordEmbeddings(): WordEmbedding[] {
  const embeddings: WordEmbedding[] = [];
  
  // Define semantic categories based on the words we have
  const categories = {
    animals: ['cat', 'dog', 'mouse', 'elephant', 'lion', 'bird', 'fish', 'tiger', 'bear', 'rabbit', 'horse', 'sheep', 'pig', 'cow', 'chicken', 'duck'],
    food: ['apple', 'banana', 'bread', 'cheese', 'pizza', 'cake', 'orange', 'grape', 'strawberry', 'chocolate', 'coffee', 'tea', 'milk', 'water', 'juice'],
    technology: ['computer', 'phone', 'laptop', 'internet', 'software', 'robot', 'tablet', 'keyboard', 'screen', 'camera', 'printer', 'wifi', 'app', 'website', 'email'],
    nature: ['tree', 'flower', 'mountain', 'ocean', 'river', 'forest', 'lake', 'beach', 'desert', 'rain', 'snow', 'wind', 'sun', 'moon', 'star'],
    emotions: ['happy', 'sad', 'angry', 'excited', 'calm', 'love', 'fear', 'joy', 'surprise', 'trust', 'hope', 'pride'],
    transportation: ['car', 'train', 'airplane', 'bicycle', 'boat', 'bus', 'truck', 'motorcycle', 'helicopter', 'ship', 'taxi', 'subway'],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange_color', 'pink', 'brown', 'black', 'white', 'gray'],
    body: ['hand', 'foot', 'head', 'eye', 'ear', 'nose', 'mouth', 'arm', 'leg', 'heart', 'brain'],
    abstract: ['time', 'space', 'idea', 'thought', 'dream', 'memory', 'future', 'past', 'present', 'truth', 'knowledge', 'wisdom'],
    sports: ['football', 'basketball', 'baseball', 'soccer', 'tennis', 'golf', 'swimming', 'running', 'cycling', 'hockey'],
    clothing: ['shirt', 'pants', 'shoes', 'hat', 'dress', 'jacket', 'socks', 'gloves', 'belt', 'coat'],
    verbs: ['run', 'walk', 'jump', 'swim', 'fly', 'drive', 'eat', 'drink', 'sleep', 'work', 'play', 'read', 'write', 'think', 'speak', 'listen', 'see', 'hear', 'feel', 'touch'],
    adjectives: ['big', 'small', 'tall', 'short', 'fast', 'slow', 'hot', 'cold', 'warm', 'cool', 'light', 'dark', 'bright', 'loud', 'quiet', 'new', 'old', 'young', 'good', 'bad', 'beautiful', 'ugly', 'smart', 'stupid', 'strong', 'weak', 'easy', 'hard', 'soft', 'smooth', 'rough', 'clean', 'dirty']
  };
  
  // Convert GloVe data to WordEmbedding format
  for (const [category, words] of Object.entries(categories)) {
    for (const word of words) {
      const position = getGlovePosition(word);
      if (position) {
        embeddings.push({
          word,
          position,
          category
        });
      }
    }
  }
  
  return embeddings;
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