declare const puzzleSet: {
  date: string;
  puzzles: Array<{
    id: number;
    referenceWords: Array<{
      word: string;
      position: { x: number; y: number; z: number };
    }>;
    targetWord: {
      word: string;
      position: { x: number; y: number; z: number };
    };
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  generated_at: string;
};
export default puzzleSet;