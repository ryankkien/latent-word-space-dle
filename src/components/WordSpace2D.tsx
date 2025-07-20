import { useState, useRef, useEffect } from 'react';
import type { WordEmbedding } from '../types';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';
import { getWordsBetween, getBoundingBox } from '../utils/wordBetween';

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
  const [betweenWords, setBetweenWords] = useState<WordEmbedding[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewBox, setViewBox] = useState('0 0 800 600');
  const { playClick, playHover } = useSound();

  // Calculate words between guess and target after guess is made
  useEffect(() => {
    if (showTarget && userGuess && targetWord) {
      getWordsBetween(userGuess, targetWord.position, 5).then(words => {
        setBetweenWords(words);
        
        // Calculate zoom area and trigger zoom animation
        setTimeout(() => {
          const focusArea = calculateFocusArea(userGuess, targetWord, words);
          if (focusArea) {
            const zoomViewBox = `${focusArea.x} ${focusArea.y} ${focusArea.width} ${focusArea.height}`;
            setViewBox(zoomViewBox);
            setIsZoomed(true);
          }
        }, 1000);
      });
    }
  }, [showTarget, userGuess, targetWord]);

  // Reset when starting a new game
  useEffect(() => {
    if (!showTarget) {
      setBetweenWords([]);
      setIsZoomed(false);
      setViewBox('0 0 800 600');
    }
  }, [showTarget]);

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

  // Get scale factor for zoomed elements
  const getScaleFactor = () => {
    if (!isZoomed) return 1;
    const [, , width, height] = viewBox.split(' ').map(Number);
    const baseArea = 800 * 600;
    const currentArea = width * height;
    return Math.sqrt(baseArea / currentArea);
  };

  const scaleFactor = getScaleFactor();

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

  // Calculate zoom focus area in SVG coordinates
  const calculateFocusArea = (userGuess: {x: number, y: number, z: number}, targetWord: WordEmbedding, words: WordEmbedding[]) => {
    const allPositions = [
      userGuess,
      targetWord.position,
      ...words.map(w => w.position)
    ];
    
    const box = getBoundingBox(allPositions);
    const padding = 1.5; // Semantic space padding
    
    // Convert to SVG coordinates
    const topLeft = to2D({ x: box.min.x - padding, y: box.max.y + padding, z: 0 });
    const bottomRight = to2D({ x: box.max.x + padding, y: box.min.y - padding, z: 0 });
    
    // Add some visual padding in SVG space
    const svgPadding = 80;
    
    return {
      x: Math.max(0, topLeft.x - svgPadding),
      y: Math.max(0, topLeft.y - svgPadding),
      width: Math.min(800, bottomRight.x - topLeft.x + (svgPadding * 2)),
      height: Math.min(600, bottomRight.y - topLeft.y + (svgPadding * 2))
    };
  };

  // Get focus area for blue box display (different from zoom calculation)
  const getFocusAreaForDisplay = () => {
    if (!userGuess || !targetWord || !showTarget) return null;
    
    const allPositions = [
      userGuess,
      targetWord.position,
      ...betweenWords.map(w => w.position)
    ];
    
    const box = getBoundingBox(allPositions);
    const padding = 2;
    
    return {
      minX: box.min.x - padding,
      maxX: box.max.x + padding,
      minY: box.min.y - padding,
      maxY: box.max.y + padding
    };
  };

  const focusArea = getFocusAreaForDisplay();

  return (
    <div className="w-full h-[600px] relative bg-slate-900 rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={viewBox}
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

        {/* Zoom focus overlay */}
        {isZoomed && focusArea && (
          <g className="animate-in fade-in-0 duration-1000">
            {/* Zoom indicator box */}
            <rect
              x={to2D({ x: focusArea.minX, y: focusArea.maxY, z: 0 }).x - 20}
              y={to2D({ x: focusArea.minX, y: focusArea.maxY, z: 0 }).y - 20}
              width={to2D({ x: focusArea.maxX, y: focusArea.minY, z: 0 }).x - to2D({ x: focusArea.minX, y: focusArea.maxY, z: 0 }).x + 40}
              height={to2D({ x: focusArea.minX, y: focusArea.minY, z: 0 }).y - to2D({ x: focusArea.minX, y: focusArea.maxY, z: 0 }).y + 40}
              fill="none"
              stroke="rgb(59 130 246)"
              strokeWidth="3"
              strokeDasharray="10,5"
              rx="8"
              className="animate-pulse"
            />
          </g>
        )}

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
                r={8 / scaleFactor}
                fill="rgb(59 130 246)"
                stroke="rgb(37 99 235)"
                strokeWidth={2 / scaleFactor}
              />
              <rect
                x={pos.x - (word.word.length * 4) / scaleFactor}
                y={pos.y - 30 / scaleFactor}
                width={(word.word.length * 8) / scaleFactor}
                height={20 / scaleFactor}
                fill="rgba(0, 0, 0, 0.8)"
                rx={4 / scaleFactor}
              />
              <text
                x={pos.x}
                y={pos.y - 16 / scaleFactor}
                textAnchor="middle"
                className="font-semibold select-none pointer-events-none"
                fontSize={14 / scaleFactor}
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
              r={10 / scaleFactor}
              fill="rgb(239 68 68)"
              stroke="rgb(220 38 38)"
              strokeWidth={3 / scaleFactor}
            />
            <rect
              x={to2D(userGuess).x - 40 / scaleFactor}
              y={to2D(userGuess).y - 35 / scaleFactor}
              width={80 / scaleFactor}
              height={20 / scaleFactor}
              fill="rgba(220, 38, 38, 0.9)"
              rx={4 / scaleFactor}
            />
            <text
              x={to2D(userGuess).x}
              y={to2D(userGuess).y - 21 / scaleFactor}
              textAnchor="middle"
              className="font-bold select-none pointer-events-none"
              fontSize={14 / scaleFactor}
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
              r={10 / scaleFactor}
              fill="rgb(34 197 94)"
              stroke="rgb(22 163 74)"
              strokeWidth={3 / scaleFactor}
            />
            <rect
              x={to2D(targetWord.position).x - (targetWord.word.length * 5) / scaleFactor}
              y={to2D(targetWord.position).y - 35 / scaleFactor}
              width={(targetWord.word.length * 10) / scaleFactor}
              height={20 / scaleFactor}
              fill="rgba(22, 163, 74, 0.9)"
              rx={4 / scaleFactor}
            />
            <text
              x={to2D(targetWord.position).x}
              y={to2D(targetWord.position).y - 21 / scaleFactor}
              textAnchor="middle"
              className="font-bold select-none pointer-events-none"
              fontSize={16 / scaleFactor}
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
            strokeWidth={2 / scaleFactor}
            strokeDasharray={`${8 / scaleFactor},${4 / scaleFactor}`}
            className="animate-in fade-in-0 duration-700 delay-500"
          />
        )}
        
        {/* Words between */}
        {showTarget && betweenWords.map((word, index) => {
          const pos = to2D(word.position);
          
          return (
            <g
              key={word.word}
              className="animate-in fade-in-0 zoom-in-95 duration-500"
              style={{ animationDelay: `${800 + index * 100}ms` }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={6 / scaleFactor}
                fill="rgb(234 179 8)"
                stroke="rgb(202 138 4)"
                strokeWidth={2 / scaleFactor}
              />
              <rect
                x={pos.x - (word.word.length * 3.5) / scaleFactor}
                y={pos.y - 26 / scaleFactor}
                width={(word.word.length * 7) / scaleFactor}
                height={16 / scaleFactor}
                fill="rgba(202, 138, 4, 0.9)"
                rx={3 / scaleFactor}
              />
              <text
                x={pos.x}
                y={pos.y - 16 / scaleFactor}
                textAnchor="middle"
                className="font-medium select-none pointer-events-none"
                fontSize={12 / scaleFactor}
                fill="white"
              >
                {word.word}
              </text>
            </g>
          );
        })}

        {/* Placement preview */}
        {placementMode && cursorPosition && (
          <circle
            cx={cursorPosition.x}
            cy={cursorPosition.y}
            r={8 / scaleFactor}
            fill="rgba(249, 115, 22, 0.6)"
            stroke="rgb(249 115 22)"
            strokeWidth={2 / scaleFactor}
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