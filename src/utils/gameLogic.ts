import type { WordEmbedding } from '../types';
import { wordEmbeddings, getWordsByDistance } from '../data/realWordEmbeddings';

// Select reference words with varying distances from the target
export function selectReferenceWords(targetWord: WordEmbedding, count: number = 5): WordEmbedding[] {
  const sortedWords = getWordsByDistance(targetWord.position)
    .filter(w => w.word !== targetWord.word);
  
  const referenceWords: WordEmbedding[] = [];
  
  // Strategy: Pick words at different distance ranges
  // 1 very close, 2 medium distance, 2 far
  const ranges = [
    { min: 0, max: 0.2 },    // Very close
    { min: 0.2, max: 0.4 },  // Close
    { min: 0.4, max: 0.6 },  // Medium
    { min: 0.6, max: 0.8 },  // Far
    { min: 0.8, max: 1.0 },  // Very far
  ];
  
  // Normalize distances to 0-1 range
  const maxDistance = sortedWords[sortedWords.length - 1].distance;
  
  for (let i = 0; i < count && i < ranges.length; i++) {
    const range = ranges[i];
    const wordsInRange = sortedWords.filter(w => {
      const normalizedDistance = w.distance / maxDistance;
      return normalizedDistance >= range.min && normalizedDistance <= range.max;
    });
    
    if (wordsInRange.length > 0) {
      const randomIndex = Math.floor(Math.random() * wordsInRange.length);
      referenceWords.push(wordsInRange[randomIndex]);
    }
  }
  
  // If we couldn't get enough words with the range strategy, fill with random words
  while (referenceWords.length < count) {
    const remainingWords = sortedWords.filter(
      w => !referenceWords.some(ref => ref.word === w.word)
    );
    if (remainingWords.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * Math.min(remainingWords.length, 20));
    referenceWords.push(remainingWords[randomIndex]);
  }
  
  return referenceWords;
}

// Select a target word, preferably not from the same category as recent games
export function selectTargetWord(recentWords: string[] = []): WordEmbedding {
  const availableWords = wordEmbeddings.filter(
    w => !recentWords.includes(w.word)
  );
  
  if (availableWords.length === 0) {
    return wordEmbeddings[Math.floor(Math.random() * wordEmbeddings.length)];
  }
  
  return availableWords[Math.floor(Math.random() * availableWords.length)];
}