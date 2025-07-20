import { useState, useRef } from 'react';
import type { WordEmbedding } from '../types';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';

interface WordSpace2DProps {
  referenceWords: WordEmbedding[];
  targetWord: WordEmbedding | null;
  userGuess: { x: number; y: number; z: number } | null;
  onGuessPlaced: (position: { x: number; y: number; z: number }) => void | Promise<void>;
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
  const [placementMode, setPlacementMode] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const { playClick, playHover } = useSound();


  // Calculate coordinate ranges dynamically from all words
  const getCoordRanges = () => {
    const allWords = [...referenceWords];
    if (targetWord) allWords.push(targetWord);
    if (userGuess) allWords.push({ word: 'guess', position: userGuess, category: 'guess' });
    
    if (allWords.length === 0) {
      return {
        x: { min: -5, max: 5 },
        y: { min: -5, max: 5 }
      };
    }
    
    const positions = allWords.map(w => w.position || w);
    const xValues = positions.map(p => p.x);
    const yValues = positions.map(p => p.y);
    
    const padding = 2; // Add some padding around the data
    return {
      x: { 
        min: Math.min(...xValues) - padding, 
        max: Math.max(...xValues) + padding 
      },
      y: { 
        min: Math.min(...yValues) - padding, 
        max: Math.max(...yValues) + padding 
      }
    };
  };

  const coordRanges = getCoordRanges();


  const to2D = (pos: { x: number; y: number; z: number }) => {
    // Map to 0-800 coordinate space with smaller padding
    const padding = 50;
    const width = 800 - (padding * 2);
    const height = 600 - (padding * 2);
    
    const normalizedX = (pos.x - coordRanges.x.min) / (coordRanges.x.max - coordRanges.x.min);
    const normalizedY = (coordRanges.y.max - pos.y) / (coordRanges.y.max - coordRanges.y.min);
    
    return {
      x: padding + normalizedX * width,
      y: padding + normalizedY * height
    };
  };

  const fromSVG = (svgX: number, svgY: number) => {
    const padding = 50;
    const width = 800 - (padding * 2);
    const height = 600 - (padding * 2);
    
    const normalizedX = (svgX - padding) / width;
    const normalizedY = (svgY - padding) / height;
    
    // Clamp normalized values to ensure they stay within bounds
    const clampedX = Math.max(0, Math.min(1, normalizedX));
    const clampedY = Math.max(0, Math.min(1, normalizedY));
    
    return {
      x: coordRanges.x.min + clampedX * (coordRanges.x.max - coordRanges.x.min),
      y: coordRanges.y.max - clampedY * (coordRanges.y.max - coordRanges.y.min),
      z: 0
    };
  };

  const getMousePosition = (event: React.MouseEvent<SVGSVGElement>): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    
    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    
    // Transform the point from screen space to SVG space
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return null;
    
    const svgPoint = point.matrixTransform(ctm.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!placementMode) return;

    const svgPoint = getMousePosition(event);
    if (!svgPoint) return;
    
    const position = fromSVG(svgPoint.x, svgPoint.y);
    onGuessPlaced(position);
    setPlacementMode(false);
    setCursorPosition(null);
    playClick();
  };

  const handleSvgMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!placementMode) return;

    const svgPoint = getMousePosition(event);
    if (svgPoint) {
      setCursorPosition(svgPoint);
    }
  };


  return (
    <div className="w-full h-[600px] relative bg-slate-900 rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full transition-all duration-2000 ease-out"
        onClick={handleSvgClick}
        onMouseMove={handleSvgMove}
        onMouseLeave={() => setCursorPosition(null)}
        style={{ cursor: placementMode ? 'crosshair' : 'default' }}
      >
        {/* Background */}
        <rect width="800" height="600" fill="rgb(15 23 42)" />
        
        {/* Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(51 65 85)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#grid)" />


        {/* Reference words */}
        {referenceWords.map((word) => {
          const pos = to2D(word.position);
          
          return (
            <g
              key={word.word}
              onMouseEnter={() => playHover()}
              className="transition-all duration-200 hover:scale-110"
              style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={8}
                fill="rgb(59 130 246)"
                stroke="rgb(37 99 235)"
                strokeWidth={2}
              />
              <rect
                x={pos.x - (word.word.length * 4)}
                y={pos.y - 30}
                width={(word.word.length * 8)}
                height={20}
                fill="rgba(0, 0, 0, 0.8)"
                rx={4}
              />
              <text
                x={pos.x}
                y={pos.y - 16}
                textAnchor="middle"
                className="font-semibold select-none pointer-events-none"
                fontSize={14}
                fill="white"
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
              r={10}
              fill="rgb(239 68 68)"
              stroke="rgb(220 38 38)"
              strokeWidth={3}
            />
            <rect
              x={to2D(userGuess).x - 40}
              y={to2D(userGuess).y - 35}
              width={80}
              height={20}
              fill="rgba(220, 38, 38, 0.9)"
              rx={4}
            />
            <text
              x={to2D(userGuess).x}
              y={to2D(userGuess).y - 21}
              textAnchor="middle"
              className="font-bold select-none pointer-events-none"
              fontSize={14}
              fill="white"
            >
              Your Guess
            </text>
          </g>
        )}

        {/* Target word */}
        {showTarget && targetWord && (
          <g className="animate-in fade-in-0 zoom-in-95 duration-500 delay-300">
            <circle
              cx={to2D(targetWord.position).x}
              cy={to2D(targetWord.position).y}
              r={10}
              fill="rgb(34 197 94)"
              stroke="rgb(22 163 74)"
              strokeWidth={3}
            />
            <rect
              x={to2D(targetWord.position).x - (targetWord.word.length * 5)}
              y={to2D(targetWord.position).y - 35}
              width={(targetWord.word.length * 10)}
              height={20}
              fill="rgba(22, 163, 74, 0.9)"
              rx={4}
            />
            <text
              x={to2D(targetWord.position).x}
              y={to2D(targetWord.position).y - 21}
              textAnchor="middle"
              className="font-bold select-none pointer-events-none"
              fontSize={16}
              fill="white"
            >
              {targetWord.word}
            </text>
          </g>
        )}

        {/* Connection line */}
        {showTarget && targetWord && userGuess && (
          <line
            x1={to2D(userGuess).x}
            y1={to2D(userGuess).y}
            x2={to2D(targetWord.position).x}
            y2={to2D(targetWord.position).y}
            stroke="rgb(156 163 175)"
            strokeWidth={2}
            strokeDasharray={`${8},${4}`}
            className="animate-in fade-in-0 duration-700 delay-500"
          />
        )}

        {/* Placement preview */}
        {placementMode && cursorPosition && (
          <circle
            cx={cursorPosition.x}
            cy={cursorPosition.y}
            r={8}
            fill="rgba(249, 115, 22, 0.6)"
            stroke="rgb(249 115 22)"
            strokeWidth={2}
            className="animate-pulse pointer-events-none"
          />
        )}
      </svg>

      {/* Placement button */}
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
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {placementMode ? 'Click to place word' : 'Start Placing Word'}
        </button>
      )}
    </div>
  );
}