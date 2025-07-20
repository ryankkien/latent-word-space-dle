import OpenAI from 'openai';
import { wordEmbeddings } from '../data/realWordEmbeddings';

export interface DailyPuzzle {
  id: number;
  referenceWords: string[];
  targetWord: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DailyPuzzleSet {
  date: string;
  puzzles: DailyPuzzle[];
  generated_at: string;
}

// Get available words from our embeddings
const availableWords = wordEmbeddings.map(w => w.word);

// Create OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development - in production, use a backend
});

export class PuzzleGenerator {
  private validateWords(words: string[]): boolean {
    return words.every(word => availableWords.includes(word));
  }

  private async generateSinglePuzzle(puzzleNumber: number): Promise<DailyPuzzle | null> {
    const difficulties = ['easy', 'medium', 'hard'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)] as 'easy' | 'medium' | 'hard';
    
    const prompt = `Create a semantic word puzzle for a word embedding space game. 

The user needs to guess where a target word belongs in semantic space based on reference words.

Requirements:
- Use any common English words
- Choose a target word that relates to the reference words in an interesting way
- Provide 6-10 reference words that help indicate where the target word should be placed
- NO HINTS - the reference words should speak for themselves
- Be creative with relationships: opposites, categories, progressions, associations, etc.
- Make it ${difficulty} difficulty

Respond with ONLY a JSON object in this exact format:
{
  "referenceWords": ["word1", "word2", "word3", "word4", "word5", "word6"],
  "targetWord": "target",
  "difficulty": "${difficulty}"
}

Creative examples:
- ["hot", "cold", "warm", "cool", "freezing", "boiling"] → "temperature"
- ["minute", "hour", "day", "week", "month", "year"] → "second"
- ["happy", "joyful", "elated", "cheerful", "glad", "content"] → "sad"
- ["red", "blue", "green", "yellow", "purple", "orange"] → "color"
- ["run", "walk", "sprint", "jog", "dash", "stroll"] → "move"

Make the relationships intuitive but not too obvious!`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      const puzzleData = JSON.parse(content);
      
      // Validate that all words exist in our embeddings
      const allWords = [...puzzleData.referenceWords, puzzleData.targetWord];
      if (!this.validateWords(allWords)) {
        console.log('Generated puzzle contains invalid words, retrying...');
        return null;
      }

      return {
        id: puzzleNumber,
        referenceWords: puzzleData.referenceWords,
        targetWord: puzzleData.targetWord,
        difficulty: puzzleData.difficulty
      };
    } catch (error) {
      console.error('Error generating puzzle:', error);
      return null;
    }
  }

  private getFallbackPuzzles(): DailyPuzzle[] {
    // Fallback puzzles if OpenAI fails
    return [
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
        referenceWords: ["calm", "chair", "peaceful", "worried", "mountain", "anxious", "angry", "bread", "furious"],
        targetWord: "happy",
        difficulty: "medium"
      },
      {
        id: 4,
        referenceWords: ["apple", "keyboard", "banana", "orange", "cloud", "grape", "strawberry", "phone", "cherry", "peach"],
        targetWord: "fruit",
        difficulty: "medium"
      },
      {
        id: 5,
        referenceWords: ["past", "window", "present", "yesterday", "guitar", "today", "history", "cheese", "memory", "now"],
        targetWord: "future",
        difficulty: "hard"
      }
    ];
  }

  async generateDailyPuzzles(date: string): Promise<DailyPuzzleSet> {
    console.log(`Generating puzzles for ${date}...`);
    
    const puzzles: DailyPuzzle[] = [];
    const maxRetries = 3;

    // Try to generate 5 unique puzzles
    for (let i = 1; i <= 5; i++) {
      let puzzle: DailyPuzzle | null = null;
      
      for (let retry = 0; retry < maxRetries; retry++) {
        puzzle = await this.generateSinglePuzzle(i);
        if (puzzle) break;
        
        // Wait a bit between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (puzzle) {
        puzzles.push(puzzle);
      }
    }

    // If we couldn't generate enough puzzles, use fallbacks
    if (puzzles.length < 5) {
      console.log('Using fallback puzzles to complete the set');
      const fallbacks = this.getFallbackPuzzles();
      
      while (puzzles.length < 5) {
        const fallback = fallbacks[puzzles.length];
        if (fallback) puzzles.push(fallback);
      }
    }

    return {
      date,
      puzzles: puzzles.slice(0, 5), // Ensure exactly 5 puzzles
      generated_at: new Date().toISOString()
    };
  }
}