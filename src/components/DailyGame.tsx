import { useState, useEffect } from 'react';
import { WordSpace2D } from './WordSpace2D';
import type { DailyGameState, PuzzleGameState, DailyPuzzleSet, PuzzleResult } from '../types';
import { findWordEmbedding, countWordsBetween, calculateDistance, initializeForDailyPuzzles, calculateDistanceSync } from '../data/realWordEmbeddings';
import { dailyPuzzleManager } from '../services/dailyPuzzles';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Moon, Sun, Sparkles, Share2, Calendar, Trophy, Target, Flame } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';
import { GoogleAd } from './GoogleAd';
import { ADSENSE_CONFIG } from '../config/adsense';
import { Logo } from './Logo';

export function DailyGame() {
  const [dailyState, setDailyState] = useState<DailyGameState>({
    currentPuzzleIndex: 0,
    puzzleResults: [],
    totalScore: 0,
    isCompleted: false,
    date: new Date().toISOString().split('T')[0]
  });
  
  const [currentGameState, setCurrentGameState] = useState<PuzzleGameState | null>(null);
  const [puzzleSet, setPuzzleSet] = useState<DailyPuzzleSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  
  const { theme, setTheme } = useTheme();
  const { playSuccess, playClick } = useSound();


  // Load today's puzzles and daily state
  useEffect(() => {
    loadDailyPuzzles();
    loadDailyState();
    calculateStreak();
  }, []);

  const loadDailyPuzzles = async () => {
    try {
      const puzzles = await dailyPuzzleManager.getTodaysPuzzles();
      setPuzzleSet(puzzles);
      
      // Initialize embeddings with only required words for better performance
      await initializeForDailyPuzzles(puzzles);
    } catch (error) {
      console.error('Error loading daily puzzles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyState = () => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`daily_game_${today}`);
    
    if (saved) {
      const savedState = JSON.parse(saved) as DailyGameState;
      setDailyState(savedState);
      
      // If not completed, set up current puzzle
      if (!savedState.isCompleted && puzzleSet) {
        setupCurrentPuzzle(savedState.currentPuzzleIndex);
      }
    }
  };

  const saveDailyState = (state: DailyGameState) => {
    localStorage.setItem(`daily_game_${state.date}`, JSON.stringify(state));
  };

  const calculateStreak = () => {
    let currentStreak = 0;
    const today = new Date();
    
    // Check backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const savedState = localStorage.getItem(`daily_game_${dateStr}`);
      if (savedState) {
        const state = JSON.parse(savedState) as DailyGameState;
        if (state.isCompleted) {
          currentStreak++;
        } else if (i === 0) {
          // Today not completed yet, but yesterday was - still counts
          continue;
        } else {
          // Found a gap in the streak
          break;
        }
      } else if (i === 0) {
        // Today not started yet, check yesterday
        continue;
      } else {
        // No data for this day, streak broken
        break;
      }
    }
    
    setStreak(currentStreak);
    
    // Save streak data
    localStorage.setItem('wordspace_streak', JSON.stringify({
      count: currentStreak,
      lastPlayed: today.toISOString().split('T')[0]
    }));
  };

  const setupCurrentPuzzle = async (puzzleIndex: number) => {
    if (!puzzleSet || puzzleIndex >= puzzleSet.puzzles.length) return;
    
    const puzzle = puzzleSet.puzzles[puzzleIndex];
    
    // Convert puzzle words to WordEmbedding objects
    const targetWord = await findWordEmbedding(puzzle.targetWord);
    const referenceWordPromises = puzzle.referenceWords.map(word => findWordEmbedding(word));
    const referenceWords = (await Promise.all(referenceWordPromises)).filter(w => w !== undefined);

    if (!targetWord || referenceWords.length < 3) {
      console.error('Could not find enough embeddings for puzzle words');
      console.error('Target word:', puzzle.targetWord, 'found:', !!targetWord);
      console.error('Reference words available:', referenceWords.length, 'out of', puzzle.referenceWords.length);
      
      // Skip this puzzle if we can't find enough words
      if (puzzleIndex < 4) {
        // Try next puzzle
        await setupCurrentPuzzle(puzzleIndex + 1);
        return;
      } else {
        // This was the last puzzle, show completion
        const newDailyState = {
          ...dailyState,
          isCompleted: true
        };
        setDailyState(newDailyState);
        saveDailyState(newDailyState);
        return;
      }
    }

    setCurrentGameState({
      targetWord,
      referenceWords,
      userGuess: null,
      isGameComplete: false,
      score: 0,
      wordsBetween: 0,
      puzzleId: puzzle.id,
      difficulty: puzzle.difficulty
    });
  };

  // Set up first puzzle when puzzle set loads
  useEffect(() => {
    if (puzzleSet && !currentGameState && !dailyState.isCompleted) {
      setupCurrentPuzzle(dailyState.currentPuzzleIndex);
    }
  }, [puzzleSet]);

  const handleGuessPlaced = async (position: { x: number; y: number; z: number }) => {
    if (!currentGameState || currentGameState.isGameComplete) return;

    const wordsBetween = await countWordsBetween(position, currentGameState.targetWord.position);
    const distance = calculateDistance(position, currentGameState.targetWord.position);
    
    // Score based on accuracy (inverse of distance)
    const maxDistance = 10;
    const score = Math.max(0, Math.round((1 - distance / maxDistance) * 100));

    const updatedGameState = {
      ...currentGameState,
      userGuess: position,
      isGameComplete: true,
      wordsBetween,
      score,
    };

    setCurrentGameState(updatedGameState);

    // Create puzzle result
    const result: PuzzleResult = {
      puzzleId: currentGameState.puzzleId,
      score,
      wordsBetween,
      distance,
      completed: true
    };

    // Update daily state
    const newResults = [...dailyState.puzzleResults, result];
    const newTotalScore = newResults.reduce((sum, r) => sum + r.score, 0);
    const isCompleted = newResults.length === 5;

    const newDailyState: DailyGameState = {
      ...dailyState,
      puzzleResults: newResults,
      totalScore: newTotalScore,
      isCompleted,
      currentPuzzleIndex: isCompleted ? dailyState.currentPuzzleIndex : dailyState.currentPuzzleIndex + 1
    };

    setDailyState(newDailyState);
    saveDailyState(newDailyState);

    // Play success sound
    setTimeout(() => playSuccess(), 500);
    
    // Recalculate streak if all puzzles completed
    if (isCompleted) {
      calculateStreak();
    }
  };

  const goToNextPuzzle = () => {
    if (dailyState.isCompleted) return;
    
    const nextIndex = dailyState.currentPuzzleIndex;
    setupCurrentPuzzle(nextIndex);
    playClick();
  };

  const generateShareText = () => {
    if (!dailyState.isCompleted) return '';
    
    const totalScore = dailyState.totalScore;
    const avgScore = Math.round(totalScore / 5);
    const scoreEmoji = avgScore > 80 ? '🎯' : avgScore > 60 ? '✨' : avgScore > 40 ? '🎲' : '🎮';
    
    const resultGrid = dailyState.puzzleResults.map(result => {
      const score = result.score;
      if (score >= 80) return '🟢';
      if (score >= 60) return '🟡';
      if (score >= 40) return '🟠';
      return '🔴';
    }).join('');

    return `🧠 LatentLetters ${scoreEmoji}
${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}

${resultGrid}
Total: ${totalScore}/500 (${avgScore}% avg)

Can you place words in semantic space?
#LatentLetters #DailyPuzzle`;
  };

  const handleShare = async () => {
    const shareText = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LatentLetters - Daily Results',
          text: shareText
        });
      } catch (err) {
        navigator.clipboard.writeText(shareText);
      }
    } else {
      navigator.clipboard.writeText(shareText);
    }
    
    playSuccess();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading today's puzzles...</p>
        </div>
      </div>
    );
  }

  if (dailyState.isCompleted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Daily Complete!
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-full">
                  <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
                  <span className="font-bold text-orange-500">{streak} day streak!</span>
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">🎉 All Puzzles Complete!</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center mb-6">
                <div>
                  <div className="text-4xl font-bold text-primary">{dailyState.totalScore}</div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">{Math.round(dailyState.totalScore / 5)}</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">5/5</div>
                  <div className="text-sm text-muted-foreground">Puzzles Complete</div>
                </div>
              </div>

              {/* Individual puzzle results */}
              <div className="space-y-3 mb-6">
                {dailyState.puzzleResults.map((result, index) => (
                  <div key={result.puzzleId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        result.score >= 80 ? "bg-green-500" :
                        result.score >= 60 ? "bg-yellow-500" :
                        result.score >= 40 ? "bg-orange-500" : "bg-red-500"
                      )} />
                      <span className="font-medium">Puzzle {index + 1}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{result.score}%</div>
                      <div className="text-xs text-muted-foreground">{result.wordsBetween} words between</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button onClick={handleShare} size="lg" className="transition-all duration-200 hover:scale-105">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Results
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Ad placement - below completion results */}
          <div className="mt-6">
            <GoogleAd 
              adSlot={ADSENSE_CONFIG.adSlots.completionScreen} 
              adFormat="rectangle"
              style={{ minHeight: '250px' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!currentGameState) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Setting up puzzle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-start gap-1">
            <Logo />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Daily Puzzles</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-full animate-pulse">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-orange-500">{streak}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-semibold">Puzzle {dailyState.currentPuzzleIndex + 1} of 5</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Total Score: {dailyState.totalScore}
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(dailyState.puzzleResults.length / 5) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Current puzzle info */}
        {!currentGameState.isGameComplete && (
          <Card className="mb-6 bg-gradient-to-br from-card to-muted/20 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Place the word: <span className="text-primary font-bold animate-pulse">
                  "{currentGameState.targetWord.word}"
                </span>
              </CardTitle>
              <CardDescription className="text-base">
                Use the reference words to guide your placement
              </CardDescription>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  currentGameState.difficulty === 'easy' ? "bg-green-100 text-green-800" :
                  currentGameState.difficulty === 'medium' ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                )}>
                  {currentGameState.difficulty}
                </span>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Game visualization */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <WordSpace2D
              referenceWords={currentGameState.referenceWords}
              targetWord={currentGameState.targetWord}
              userGuess={currentGameState.userGuess}
              onGuessPlaced={handleGuessPlaced}
              showTarget={currentGameState.isGameComplete}
            />
          </CardContent>
        </Card>

        {/* Results for current puzzle */}
        {currentGameState.isGameComplete && (
          <Card className={cn(
            "mb-6 transition-all duration-500",
            "animate-in fade-in-0 slide-in-from-bottom-4",
            currentGameState.score > 80 ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-card" :
            currentGameState.score > 60 ? "border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-card" :
            "border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-card"
          )}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {currentGameState.score > 80 ? "Excellent!" : 
                 currentGameState.score > 60 ? "Good Job!" : 
                 "Nice Try!"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <div className="text-3xl font-bold text-primary">{currentGameState.wordsBetween}</div>
                  <div className="text-sm text-muted-foreground">Words Between</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">{currentGameState.score}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {currentGameState.userGuess 
                      ? calculateDistanceSync(currentGameState.userGuess, currentGameState.targetWord.position).toFixed(1)
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                </div>
              </div>
              
              {dailyState.currentPuzzleIndex < 4 && (
                <div className="flex justify-center">
                  <Button
                    onClick={goToNextPuzzle}
                    size="lg"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Next Puzzle ({dailyState.currentPuzzleIndex + 2}/5)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ad placement - between game and educational content */}
        <div className="mb-6">
          <GoogleAd 
            adSlot={ADSENSE_CONFIG.adSlots.gameBottom} 
            adFormat="horizontal"
            style={{ minHeight: '90px' }}
          />
        </div>

        {/* About Latent Word Spaces */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What are Latent Word Spaces?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">Latent word spaces</strong> are mathematical representations of language that AI models use to understand meaning. 
              Every word is mapped to a point in high-dimensional space, where similar words cluster together and relationships become geometric patterns.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-foreground">🧠 How It Works</h4>
              <p>
                This game uses <strong className="text-foreground">GloVe embeddings</strong> (Global Vectors for Word Representation) - 
                a technique that analyzed 6 billion words of text to learn how words relate to each other. The original 50-dimensional 
                vectors are reduced to 3D for visualization while preserving semantic relationships.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-foreground">✨ Why It's Cool</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Vector arithmetic works!</strong> In these spaces, "king" - "man" + "woman" ≈ "queen"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Analogies become geometry:</strong> Words with similar relationships form parallel lines</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Meaning has structure:</strong> Concepts naturally organize by semantic similarity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">AI "understanding":</strong> This is how ChatGPT and other AI models represent language internally</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-foreground">🎯 The Challenge</h4>
              <p>
                When you place a word, you're essentially predicting where AI thinks it belongs based on meaning. 
                The reference words give you clues about the semantic landscape - some point to the target, 
                while others are distractors. Can you think like an AI?
              </p>
            </div>

            <p className="text-sm italic">
              This visualization shows how modern AI systems encode human language into mathematical spaces, 
              revealing the hidden geometry of meaning that powers language models like GPT and BERT.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}