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

// Daily puzzle types
export interface DailyPuzzle {
  id: number;
  referenceWords: {
    word: string;
    position: { x: number; y: number; z: number };
  }[];
  targetWord: {
    word: string;
    position: { x: number; y: number; z: number };
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DailyPuzzleSet {
  date: string;
  puzzles: DailyPuzzle[];
  generated_at: string;
}

export interface PuzzleResult {
  puzzleId: number;
  score: number;
  wordsBetween: number;
  distance: number;
  completed: boolean;
}

export interface DailyGameState {
  currentPuzzleIndex: number;
  puzzleResults: PuzzleResult[];
  totalScore: number;
  isCompleted: boolean;
  date: string;
}

export interface PuzzleGameState {
  targetWord: WordEmbedding;
  referenceWords: WordEmbedding[];
  userGuess: { x: number; y: number; z: number } | null;
  isGameComplete: boolean;
  score: number;
  wordsBetween: number;
  puzzleId: number;
  difficulty: 'easy' | 'medium' | 'hard';
}