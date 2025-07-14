import { useState, useRef } from 'react';
import type { WordEmbedding } from '../types';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';

interface WordSpace2DProps {
  referenceWords: WordEmbedding[];
  targetWord: WordEmbedding | null;
  userGuess: { x: number; y: number; z: number } | null;
  onGuessPlaced: (position: { x: number; y: number; z: number }) => void;
  showTarget: boolean;
}

export function WordSpace2D({ 
  referenceWords, 
  targetWord, 
  userGuess, 
  onGuessPlaced, 
  showTarget 
}: WordSpace2DProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null);
  const { playClick, playHover } = useSound();

  // Convert 3D to 2D coordinates (using x and y, ignoring z)
  const to2D = (pos: { x: number; y: number; z: number }) => ({
    x: (pos.x + 5) * 50, // Scale and offset to fit SVG viewport
    y: (5 - pos.y) * 50  // Invert y for SVG coordinate system
  });

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!placementMode || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 500;
    const y = ((event.clientY - rect.top) / rect.height) * 500;

    // Convert back to 3D coordinates
    const position = {
      x: (x / 50) - 5,
      y: 5 - (y / 50),
      z: 0 // Default z to 0 for 2D mode
    };

    onGuessPlaced(position);
    setPlacementMode(false);
    setTempPosition(null);
    playClick();
  };

  const handleSvgMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!placementMode || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 500;
    const y = ((event.clientY - rect.top) / rect.height) * 500;

    setTempPosition({ x, y });
  };

  return (
    <div className="w-full h-[600px] relative">
      <svg
        ref={svgRef}
        viewBox="0 0 500 500"
        className="w-full h-full bg-background border border-border rounded-lg cursor-crosshair transition-all duration-300"
        onClick={handleSvgClick}
        onMouseMove={handleSvgMove}
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path 
              d="M 50 0 L 0 0 0 50" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              className="text-muted-foreground/20"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Axes */}
        <line
          x1="0"
          y1="250"
          x2="500"
          y2="250"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/40"
        />
        <line
          x1="250"
          y1="0"
          x2="250"
          y2="500"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/40"
        />

        {/* Reference words */}
        {referenceWords.map((word) => {
          const pos = to2D(word.position);
          const isHovered = hoveredWord === word.word;
          
          return (
            <g
              key={word.word}
              onMouseEnter={() => {
                setHoveredWord(word.word);
                playHover();
              }}
              onMouseLeave={() => setHoveredWord(null)}
              className="transition-all duration-200"
              style={{
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transformOrigin: `${pos.x}px ${pos.y}px`
              }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 8 : 6}
                className="fill-primary/80 stroke-primary transition-all duration-200"
                strokeWidth="2"
              />
              <text
                x={pos.x}
                y={pos.y - 12}
                textAnchor="middle"
                className="fill-foreground text-sm font-medium select-none"
              >
                {word.word}
              </text>
            </g>
          );
        })}

        {/* User guess */}
        {userGuess && (
          <g className="animate-in fade-in-0 zoom-in-95 duration-300">
            <circle
              cx={to2D(userGuess).x}
              cy={to2D(userGuess).y}
              r="8"
              className="fill-destructive/80 stroke-destructive"
              strokeWidth="3"
            />
            <text
              x={to2D(userGuess).x}
              y={to2D(userGuess).y - 12}
              textAnchor="middle"
              className="fill-foreground text-sm font-semibold select-none"
            >
              Your Guess
            </text>
          </g>
        )}

        {/* Target word (shown after guess) */}
        {showTarget && targetWord && (
          <g className="animate-in fade-in-0 zoom-in-95 duration-500 delay-300">
            <circle
              cx={to2D(targetWord.position).x}
              cy={to2D(targetWord.position).y}
              r="8"
              className="fill-green-500/80 stroke-green-500"
              strokeWidth="3"
            />
            <text
              x={to2D(targetWord.position).x}
              y={to2D(targetWord.position).y - 12}
              textAnchor="middle"
              className="fill-foreground text-sm font-semibold select-none"
            >
              {targetWord.word}
            </text>
          </g>
        )}

        {/* Connection line between guess and target */}
        {showTarget && targetWord && userGuess && (
          <line
            x1={to2D(userGuess).x}
            y1={to2D(userGuess).y}
            x2={to2D(targetWord.position).x}
            y2={to2D(targetWord.position).y}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="text-destructive/60 animate-in fade-in-0 duration-700 delay-500"
          />
        )}

        {/* Placement preview */}
        {placementMode && tempPosition && (
          <g className="animate-pulse">
            <circle
              cx={tempPosition.x}
              cy={tempPosition.y}
              r="8"
              className="fill-orange-500/50 stroke-orange-500"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {!userGuess && (
        <button
          onClick={() => {
            setPlacementMode(!placementMode);
            playClick();
          }}
          className={cn(
            "absolute bottom-4 left-1/2 transform -translate-x-1/2",
            "px-6 py-3 rounded-lg font-medium transition-all duration-200",
            "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            placementMode 
              ? "bg-orange-500 text-white hover:bg-orange-600" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {placementMode ? 'Click to place word' : 'Start Placing Word'}
        </button>
      )}
    </div>
  );
}