import { useState, useEffect } from 'react';
import { WordSpace3D } from './WordSpace3D';
import type { GameState } from '../types';
import { selectTargetWord, selectReferenceWords } from '../utils/gameLogic';
import { countWordsBetween, calculateDistance } from '../data/wordEmbeddings';

export function Game() {
  const [gameState, setGameState] = useState<GameState>({
    targetWord: null as any,
    referenceWords: [],
    userGuess: null,
    isGameComplete: false,
    score: 0,
    wordsBetween: 0,
  });

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const target = selectTargetWord();
    const references = selectReferenceWords(target, 5);
    
    setGameState({
      targetWord: target,
      referenceWords: references,
      userGuess: null,
      isGameComplete: false,
      score: 0,
      wordsBetween: 0,
    });
  };

  const handleGuessPlaced = (position: { x: number; y: number; z: number }) => {
    if (!gameState.targetWord || gameState.isGameComplete) return;

    const wordsBetween = countWordsBetween(position, gameState.targetWord.position);
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
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ marginBottom: '10px' }}>Latent Word Space Game</h1>
      
      {!gameState.isGameComplete && gameState.targetWord && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f0f0f0',
          borderRadius: '10px'
        }}>
          <h2 style={{ margin: '0 0 10px 0' }}>
            Place the word: <span style={{ color: '#48bb78', fontWeight: 'bold' }}>
              "{gameState.targetWord.word}"
            </span>
          </h2>
          <p style={{ margin: 0, color: '#666' }}>
            Use the blue reference words to guide your placement
          </p>
        </div>
      )}

      <WordSpace3D
        referenceWords={gameState.referenceWords}
        targetWord={gameState.targetWord}
        userGuess={gameState.userGuess}
        onGuessPlaced={handleGuessPlaced}
        showTarget={gameState.isGameComplete}
      />

      {gameState.isGameComplete && (
        <div style={{ 
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>Results</h2>
          <div style={{ marginBottom: '10px' }}>
            <strong>Words Between:</strong> {gameState.wordsBetween}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Accuracy Score:</strong> {gameState.score}%
          </div>
          <div style={{ marginBottom: '20px' }}>
            <strong>Distance:</strong> {
              gameState.userGuess && gameState.targetWord
                ? calculateDistance(gameState.userGuess, gameState.targetWord.position).toFixed(2)
                : 0
            } units
          </div>
          <button
            onClick={startNewGame}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Play Again
          </button>
        </div>
      )}

      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '10px',
        maxWidth: '600px'
      }}>
        <h3 style={{ marginTop: 0 }}>How to Play</h3>
        <ul style={{ marginBottom: 0 }}>
          <li>You need to place a word in 3D space based on its semantic meaning</li>
          <li>Use the blue reference words to guide your placement</li>
          <li>Click "Start Placing Word" then click in the 3D space to place your guess</li>
          <li>The closer you are to the actual position, the higher your score!</li>
          <li>Rotate the view by dragging, zoom with scroll wheel</li>
        </ul>
      </div>
    </div>
  );
}