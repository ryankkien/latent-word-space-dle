import { useState, useEffect } from 'react';
import { WordSpace3D } from './WordSpace3D';
import { WordSpace2D } from './WordSpace2D';
import type { GameState } from '../types';
import { selectTargetWord, selectReferenceWords } from '../utils/gameLogic';
import { countWordsBetween, calculateDistance } from '../data/realWordEmbeddings';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Moon, Sun, Box, Square, Sparkles, Share2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';

export function Game() {
  const [gameState, setGameState] = useState<GameState>({
    targetWord: null as any,
    referenceWords: [],
    userGuess: null,
    isGameComplete: false,
    score: 0,
    wordsBetween: 0,
  });
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');
  const { theme, setTheme } = useTheme();
  const { playSuccess } = useSound();

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = async () => {
    const target = await selectTargetWord();
    const references = await selectReferenceWords(target, 5);
    
    setGameState({
      targetWord: target,
      referenceWords: references,
      userGuess: null,
      isGameComplete: false,
      score: 0,
      wordsBetween: 0,
    });
  };

  const handleGuessPlaced = async (position: { x: number; y: number; z: number }) => {
    if (!gameState.targetWord || gameState.isGameComplete) return;

    const wordsBetween = await countWordsBetween(position, gameState.targetWord.position);
    const distance = calculateDistance(position, gameState.targetWord.position);
    
    // Score based on accuracy (inverse of distance)
    const maxDistance = 10; // Approximate max distance in our space
    const score = Math.max(0, Math.round((1 - distance / maxDistance) * 100));

    setGameState({
      ...gameState,
      userGuess: position,
      isGameComplete: true,
      wordsBetween,
      score,
    });
    
    // Play success sound after a short delay
    setTimeout(() => playSuccess(), 500);
  };

  const generateShareText = () => {
    if (!gameState.isGameComplete || !gameState.targetWord) return '';
    
    const scoreEmoji = gameState.score > 80 ? '🎯' : gameState.score > 50 ? '✨' : '🎲';
    const accuracyStars = '⭐'.repeat(Math.ceil(gameState.score / 20));
    
    return `🧠 Latent Word Space ${scoreEmoji}

Word: "${gameState.targetWord.word}"
${accuracyStars} ${gameState.score}% accuracy
📏 ${gameState.wordsBetween} words between
🎮 Mode: ${viewMode}

Can you place words in semantic space? Play at: [Your URL]

#LatentWordSpace #AI #WordEmbeddings`;
  };

  const handleShare = async () => {
    const shareText = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Latent Word Space - My Result',
          text: shareText
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
    }
    
    playSuccess();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Latent Word Space
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="transition-all duration-200"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <div className="flex rounded-lg overflow-hidden border">
              <Button
                variant={viewMode === '2D' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('2D')}
                className="rounded-none"
              >
                <Square className="h-4 w-4 mr-1" />
                2D
              </Button>
              <Button
                variant={viewMode === '3D' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('3D')}
                className="rounded-none"
              >
                <Box className="h-4 w-4 mr-1" />
                3D
              </Button>
            </div>
          </div>
        </div>

        {/* Game Content */}
        {!gameState.isGameComplete && gameState.targetWord && (
          <Card className="mb-6 bg-gradient-to-br from-card to-muted/20 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Place the word: <span className="text-primary font-bold animate-pulse">
                  "{gameState.targetWord.word}"
                </span>
              </CardTitle>
              <CardDescription>
                Use the reference words to guide your placement in {viewMode} space
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Visualization */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            {viewMode === '3D' ? (
              <WordSpace3D
                referenceWords={gameState.referenceWords}
                targetWord={gameState.targetWord}
                userGuess={gameState.userGuess}
                onGuessPlaced={handleGuessPlaced}
                showTarget={gameState.isGameComplete}
              />
            ) : (
              <WordSpace2D
                referenceWords={gameState.referenceWords}
                targetWord={gameState.targetWord}
                userGuess={gameState.userGuess}
                onGuessPlaced={handleGuessPlaced}
                showTarget={gameState.isGameComplete}
              />
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {gameState.isGameComplete && (
          <Card className={cn(
            "mb-6 transition-all duration-500",
            "animate-in fade-in-0 slide-in-from-bottom-4",
            gameState.score > 80 ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-card" :
            gameState.score > 50 ? "border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-card" :
            "border-red-500/50 bg-gradient-to-br from-red-500/10 to-card"
          )}>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">
                {gameState.score > 80 ? "Excellent!" : 
                 gameState.score > 50 ? "Good Job!" : 
                 "Nice Try!"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">
                    {gameState.wordsBetween}
                  </div>
                  <div className="text-sm text-muted-foreground">Words Between</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">
                    {gameState.score}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">
                    {gameState.userGuess && gameState.targetWord
                      ? calculateDistance(gameState.userGuess, gameState.targetWord.position).toFixed(1)
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Result
                </Button>
                <Button
                  onClick={startNewGame}
                  size="lg"
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Place a word in {viewMode} space based on its semantic meaning
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Use the reference words to guide your placement
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Click "Start Placing Word" then click in the space to place your guess
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                The closer you are to the actual position, the higher your score!
              </li>
              {viewMode === '3D' && (
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Rotate the view by dragging, zoom with scroll wheel
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* About the Game */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧠 About Latent Word Space
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Welcome to a daily puzzle game that explores how AI understands language! Each day presents 
              5 unique semantic challenges where you must place words in their correct positions based on 
              <strong className="text-foreground"> meaningful patterns</strong>.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">🎯 Daily Challenge</h4>
              <p>
                Every day you get 5 new puzzles with different themes - from royal hierarchies to temperature scales, 
                emotional spectrums to category completions. Use the reference words to discover the pattern and 
                find where the target word belongs!
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">🤖 Powered by GloVe Embeddings</h4>
              <p>
                This game uses real <strong className="text-foreground">GloVe (Global Vectors for Word Representation)</strong> 
                embeddings from Stanford University. These AI models learned semantic relationships by analyzing 
                6 billion words of text from the internet.
              </p>
              <p className="mt-2">
                Each puzzle is generated using <strong className="text-foreground">AI pattern recognition</strong> to create 
                intuitive word relationship challenges that test your understanding of semantic space!
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span>Built with ❤️ using React, TypeScript, and OpenAI</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}