export interface WordEmbedding {
  word: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  category?: string;
}

export interface GameState {
  targetWord: WordEmbedding;
  referenceWords: WordEmbedding[];
  userGuess: { x: number; y: number; z: number } | null;
  isGameComplete: boolean;
  score: number;
  wordsBetween: number;
}

export interface WordDistance {
  word: string;
  distance: number;
}