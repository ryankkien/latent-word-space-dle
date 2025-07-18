import { useState, useRef, useEffect } from 'react';
import type { WordEmbedding } from '../types';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';
import { getWordsBetween, getBoundingBox } from '../utils/wordBetween';

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
  const [betweenWords, setBetweenWords] = useState<WordEmbedding[]>([]);
  const [viewBox, setViewBox] = useState('0 0 500 500');
  const [zoomScale, setZoomScale] = useState(1);
  const { playClick, playHover } = useSound();
  
  // Calculate words between guess and target after guess is made
  useEffect(() => {
    if (showTarget && userGuess && targetWord) {
      const words = getWordsBetween(userGuess, targetWord.position, 5);
      setBetweenWords(words);
      
      // Calculate bounding box for zoom
      const positions = [userGuess, targetWord.position, ...words.map(w => w.position)];
      const box = getBoundingBox(positions);
      
      // Convert to 2D coordinates and add padding
      const topLeft = to2D({ x: box.min.x - 1, y: box.max.y + 1, z: 0 });
      const bottomRight = to2D({ x: box.max.x + 1, y: box.min.y - 1, z: 0 });
      
      const width = bottomRight.x - topLeft.x;
      const height = bottomRight.y - topLeft.y;
      const newViewBox = `${topLeft.x} ${topLeft.y} ${width} ${height}`;
      
      // Calculate zoom scale for sizing elements
      const originalArea = 500 * 500;
      const newArea = width * height;
      const scale = Math.sqrt(originalArea / newArea);
      
      // Start smooth zoom animation
      setTimeout(() => {
        animateViewBox('0 0 500 500', newViewBox, scale);
      }, 1000);
    }
  }, [showTarget, userGuess, targetWord]);
  
  // Reset zoom when starting a new game
  useEffect(() => {
    if (!showTarget) {
      setViewBox('0 0 500 500');
      setZoomScale(1);
      setBetweenWords([]);
    }
  }, [showTarget]);
  
  // Smooth viewBox animation function
  const animateViewBox = (fromViewBox: string, toViewBox: string, finalScale: number) => {
    const parseViewBox = (vb: string) => {
      const [x, y, w, h] = vb.split(' ').map(Number);
      return { x, y, width: w, height: h };
    };
    
    const from = parseViewBox(fromViewBox);
    const to = parseViewBox(toViewBox);
    
    let progress = 0;
    const duration = 2000; // 2 seconds for smooth animation
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      
      const current = {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        width: from.width + (to.width - from.width) * eased,
        height: from.height + (to.height - from.height) * eased
      };
      
      const currentScale = 1 + (finalScale - 1) * eased;
      setZoomScale(currentScale);
      setViewBox(`${current.x} ${current.y} ${current.width} ${current.height}`);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Convert 3D to 2D coordinates (using x and y, ignoring z)
  const to2D = (pos: { x: number; y: number; z: number }) => ({
    x: (pos.x + 5) * 50, // Scale and offset to fit SVG viewport
    y: (5 - pos.y) * 50  // Invert y for SVG coordinate system
  });

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!placementMode || !svgRef.current) return;

    const pt = svgRef.current.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    // Transform the point to SVG coordinates
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

    // Convert back to 3D coordinates
    const position = {
      x: (svgP.x / 50) - 5,
      y: 5 - (svgP.y / 50),
      z: 0 // Default z to 0 for 2D mode
    };

    onGuessPlaced(position);
    setPlacementMode(false);
    setTempPosition(null);
    playClick();
  };

  const handleSvgMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!placementMode || !svgRef.current) return;

    const pt = svgRef.current.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    // Transform the point to SVG coordinates
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    setTempPosition({ x: svgP.x, y: svgP.y });
  };

  return (
    <div className="w-full h-[600px] relative">
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full bg-background border border-border rounded-lg transition-all duration-1000"
        onClick={handleSvgClick}
        onMouseMove={handleSvgMove}
        onMouseLeave={() => setTempPosition(null)}
        style={{ cursor: placementMode ? 'crosshair' : 'default' }}
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
                r={(isHovered ? 8 : 6) / zoomScale}
                className="fill-primary/80 stroke-primary transition-all duration-200"
                strokeWidth={2 / zoomScale}
              />
              <text
                x={pos.x}
                y={pos.y - 12 / zoomScale}
                textAnchor="middle"
                className="fill-foreground font-medium select-none"
                fontSize={14 / zoomScale}
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
              r={8 / zoomScale}
              className="fill-destructive/80 stroke-destructive"
              strokeWidth={3 / zoomScale}
            />
            <text
              x={to2D(userGuess).x}
              y={to2D(userGuess).y - 12 / zoomScale}
              textAnchor="middle"
              className="fill-foreground font-semibold select-none"
              fontSize={14 / zoomScale}
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
              r={8 / zoomScale}
              className="fill-green-500/80 stroke-green-500"
              strokeWidth={3 / zoomScale}
            />
            <text
              x={to2D(targetWord.position).x}
              y={to2D(targetWord.position).y - 12 / zoomScale}
              textAnchor="middle"
              className="fill-foreground font-semibold select-none"
              fontSize={14 / zoomScale}
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
            strokeWidth={2 / zoomScale}
            strokeDasharray={`${5 / zoomScale},${5 / zoomScale}`}
            className="text-destructive/60 animate-in fade-in-0 duration-700 delay-500"
          />
        )}
        
        {/* Words between guess and target */}
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
                r={4 / zoomScale}
                className="fill-yellow-500/80 stroke-yellow-500"
                strokeWidth={1.5 / zoomScale}
              />
              <text
                x={pos.x}
                y={pos.y - 8 / zoomScale}
                textAnchor="middle"
                className="fill-foreground font-medium select-none"
                fontSize={12 / zoomScale}
              >
                {word.word}
              </text>
            </g>
          );
        })}

        {/* Placement preview */}
        {placementMode && tempPosition && (
          <g className="animate-pulse">
            <circle
              cx={tempPosition.x}
              cy={tempPosition.y}
              r={8 / zoomScale}
              className="fill-orange-500/50 stroke-orange-500"
              strokeWidth={2 / zoomScale}
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