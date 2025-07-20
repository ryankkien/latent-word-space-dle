import { PuzzleGenerator } from './puzzleGenerator';
import type { DailyPuzzleSet } from './puzzleGenerator';

export class DailyPuzzleManager {
  private puzzleGenerator: PuzzleGenerator;
  private cache: Map<string, DailyPuzzleSet> = new Map();

  constructor() {
    this.puzzleGenerator = new PuzzleGenerator();
  }

  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private async loadCachedPuzzles(date: string): Promise<DailyPuzzleSet | null> {
    // Check memory cache first
    if (this.cache.has(date)) {
      return this.cache.get(date)!;
    }

    // Try to load from localStorage (for development)
    try {
      const cached = localStorage.getItem(`puzzles_${date}`);
      if (cached) {
        const puzzleSet = JSON.parse(cached) as DailyPuzzleSet;
        this.cache.set(date, puzzleSet);
        return puzzleSet;
      }
    } catch (error) {
      console.error('Error loading cached puzzles:', error);
    }

    // Try to load from static puzzle files (for development)
    try {
      const response = await fetch(`/src/data/puzzles/${date}.json`);
      if (response.ok) {
        const puzzleSet = await response.json() as DailyPuzzleSet;
        this.cache.set(date, puzzleSet);
        // Also save to localStorage for future use
        localStorage.setItem(`puzzles_${date}`, JSON.stringify(puzzleSet));
        return puzzleSet;
      }
    } catch (error) {
      console.log(`No static puzzle file found for ${date}`);
    }

    return null;
  }

  private async savePuzzles(puzzleSet: DailyPuzzleSet): Promise<void> {
    // Save to memory cache
    this.cache.set(puzzleSet.date, puzzleSet);

    // Save to localStorage (for development)
    try {
      localStorage.setItem(`puzzles_${puzzleSet.date}`, JSON.stringify(puzzleSet));
    } catch (error) {
      console.error('Error saving puzzles to cache:', error);
    }
  }

  async getTodaysPuzzles(): Promise<DailyPuzzleSet> {
    const today = this.getTodayDateString();
    
    // Try to load cached puzzles first
    const cached = await this.loadCachedPuzzles(today);
    if (cached) {
      console.log(`Loaded cached puzzles for ${today}`);
      return cached;
    }

    // Generate new puzzles if not in cache
    console.log(`Generating new puzzles for ${today}`);
    try {
      const puzzleSet = await this.puzzleGenerator.generateDailyPuzzles(today);
      await this.savePuzzles(puzzleSet);
      return puzzleSet;
    } catch (error) {
      console.error('Error generating puzzles:', error);
      
      // Return a fallback puzzle set if generation fails
      return {
        date: today,
        generated_at: new Date().toISOString(),
        puzzles: [
          {
            id: 1,
            referenceWords: ["man", "woman", "computer", "king", "prince", "tree", "princess", "royal", "book"],
            targetWord: "queen",
            difficulty: "easy"
          },
          {
            id: 2,
            referenceWords: ["tiny", "car", "small", "medium", "ocean", "large", "huge", "music", "gigantic"],
            targetWord: "big",
            difficulty: "easy"
          },
          {
            id: 3,
            referenceWords: ["happy", "table", "sad", "angry", "window", "excited", "calm", "guitar", "joyful", "peaceful"],
            targetWord: "emotion",
            difficulty: "medium"
          },
          {
            id: 4,
            referenceWords: ["cat", "lamp", "dog", "mouse", "paper", "elephant", "bird", "clock", "horse", "cow"],
            targetWord: "animal",
            difficulty: "medium"
          },
          {
            id: 5,
            referenceWords: ["past", "mountain", "present", "yesterday", "coffee", "today", "history", "shoe", "memory", "now"],
            targetWord: "future",
            difficulty: "hard"
          }
        ]
      };
    }
  }

  // Clear cache (useful for development/testing)
  clearCache(): void {
    this.cache.clear();
    // Clear localStorage cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('puzzles_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get puzzles for a specific date (for testing)
  async getPuzzlesForDate(date: string): Promise<DailyPuzzleSet> {
    const cached = await this.loadCachedPuzzles(date);
    if (cached) {
      return cached;
    }

    const puzzleSet = await this.puzzleGenerator.generateDailyPuzzles(date);
    await this.savePuzzles(puzzleSet);
    return puzzleSet;
  }
}

// Export singleton instance
export const dailyPuzzleManager = new DailyPuzzleManager();