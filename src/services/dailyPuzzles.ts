import type { DailyPuzzleSet } from './puzzleGenerator';
import fallbackPuzzleSet from '../data/puzzles/fallback.json';

export class DailyPuzzleManager {
  private cache: Map<string, DailyPuzzleSet> = new Map();

  constructor() {
    // No longer need puzzle generator
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


  async getTodaysPuzzles(): Promise<DailyPuzzleSet> {
    const today = this.getTodayDateString();
    
    // Try to load cached puzzles first
    const cached = await this.loadCachedPuzzles(today);
    if (cached) {
      console.log(`Loaded puzzles for ${today}`);
      return cached;
    }

    // If no puzzle file exists for today, use fallback
    console.log(`No puzzles found for ${today}, using fallback`);
    return {
      ...fallbackPuzzleSet,
      date: today,
      generated_at: new Date().toISOString()
    } as DailyPuzzleSet;
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

    // If no puzzle file exists for the date, use fallback
    return {
      ...fallbackPuzzleSet,
      date,
      generated_at: new Date().toISOString()
    } as DailyPuzzleSet;
  }
}

// Export singleton instance
export const dailyPuzzleManager = new DailyPuzzleManager();