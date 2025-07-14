import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Float, Trail } from '@react-three/drei';
import { Vector3 } from 'three';
import type { WordEmbedding } from '../types';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { getWordsBetween } from '../utils/wordBetween';
import { CameraController } from './CameraController';

interface WordSpace3DProps {
  referenceWords: WordEmbedding[];
  targetWord: WordEmbedding | null;
  userGuess: { x: number; y: number; z: number } | null;
  onGuessPlaced: (position: { x: number; y: number; z: number }) => void;
  showTarget: boolean;
}

function Word({ word, position, color = "blue", size = 0.1, isTarget = false }: { 
  word: string; 
  position: { x: number; y: number; z: number };
  color?: string;
  size?: number;
  isTarget?: boolean;
}) {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <Float speed={isTarget ? 1.5 : 0.8} rotationIntensity={isTarget ? 0.3 : 0.1} floatIntensity={isTarget ? 0.3 : 0.1}>
      <group position={[position.x, position.y, position.z]}>
        <Sphere 
          ref={meshRef}
          args={[size * (hovered ? 1.2 : 1), 32, 32]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={hovered ? 0.4 : 0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        <Text
          position={[0, size + 0.15, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {word}
        </Text>
      </group>
    </Float>
  );
}

function PlacementMarker({ position, onClick }: {
  position: { x: number; y: number; z: number };
  onClick: (position: { x: number; y: number; z: number }) => void;
}) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Sphere
      position={[position.x, position.y, position.z]}
      args={[0.15, 16, 16]}
      onClick={() => onClick(position)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color={hovered ? "yellow" : "orange"} 
        opacity={0.8}
        transparent
      />
    </Sphere>
  );
}

export function WordSpace3D({ 
  referenceWords, 
  targetWord, 
  userGuess, 
  onGuessPlaced, 
  showTarget 
}: WordSpace3DProps) {
  const [placementMode, setPlacementMode] = useState(false);
  const [tempPosition, setTempPosition] = useState<Vector3 | null>(null);
  const [betweenWords, setBetweenWords] = useState<WordEmbedding[]>([]);
  const [zoomToResult, setZoomToResult] = useState(false);
  
  // Calculate words between guess and target after guess is made
  useEffect(() => {
    if (showTarget && userGuess && targetWord) {
      const words = getWordsBetween(userGuess, targetWord.position, 15);
      setBetweenWords(words);
      // Trigger zoom after a short delay
      setTimeout(() => setZoomToResult(true), 1000);
    }
  }, [showTarget, userGuess, targetWord]);

  const handleCanvasClick = (event: any) => {
    if (!placementMode) return;
    
    // Get the intersection point
    const { point } = event;
    const position = { x: point.x, y: point.y, z: point.z };
    onGuessPlaced(position);
    setPlacementMode(false);
    setTempPosition(null);
  };

  return (
    <div className="w-full h-[600px] relative bg-gradient-to-b from-background to-muted/20 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} className="bg-transparent">
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#3b82f6" />
        
        <CameraController
          zoomToResult={zoomToResult}
          userGuess={userGuess}
          targetWord={targetWord}
          betweenWords={betweenWords}
        />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        
        {/* Grid helpers */}
        <gridHelper args={[10, 10]} rotation={[0, 0, 0]} />
        <gridHelper args={[10, 10]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} />
        <gridHelper args={[10, 10]} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} />
        
        {/* Ambient particles for atmosphere */}
        <fog attach="fog" args={['#030712', 10, 30]} />
        
        {/* Axes */}
        <Line
          points={[[-5, 0, 0], [5, 0, 0]]}
          color="red"
          lineWidth={2}
        />
        <Line
          points={[[0, -5, 0], [0, 5, 0]]}
          color="green"
          lineWidth={2}
        />
        <Line
          points={[[0, 0, -5], [0, 0, 5]]}
          color="blue"
          lineWidth={2}
        />
        
        {/* Reference words */}
        {referenceWords.map((word) => (
          <Word
            key={word.word}
            word={word.word}
            position={word.position}
            color="#3b82f6"
            size={0.12}
          />
        ))}
        
        {/* User guess */}
        {userGuess && (
          <Trail
            width={2}
            color="#ef4444"
            length={20}
            decay={1}
            attenuation={(t) => t * t}
          >
            <Word
              word="Your Guess"
              position={userGuess}
              color="#ef4444"
              size={0.15}
            />
          </Trail>
        )}
        
        {/* Target word (shown after guess) */}
        {showTarget && targetWord && (
          <Word
            word={targetWord.word}
            position={targetWord.position}
            color="#10b981"
            size={0.18}
            isTarget={true}
          />
        )}
        
        {/* Connection line between guess and target */}
        {showTarget && targetWord && userGuess && (
          <Line
            points={[
              [userGuess.x, userGuess.y, userGuess.z],
              [targetWord.position.x, targetWord.position.y, targetWord.position.z]
            ]}
            color="#ef4444"
            lineWidth={3}
            dashed
            dashScale={5}
            dashSize={0.1}
            gapSize={0.1}
          />
        )}
        
        {/* Words between guess and target */}
        {showTarget && betweenWords.map((word) => (
          <Float
            key={word.word}
            speed={0.5}
            rotationIntensity={0.1}
            floatIntensity={0.1}
          >
            <group 
              position={[word.position.x, word.position.y, word.position.z]}
            >
              <Sphere args={[0.08, 16, 16]}>
                <meshStandardMaterial 
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={0.3}
                  metalness={0.8}
                  roughness={0.2}
                  opacity={0.8}
                  transparent
                />
              </Sphere>
              <Text
                position={[0, 0.12, 0]}
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="black"
              >
                {word.word}
              </Text>
            </group>
          </Float>
        ))}
        
        {/* Placement mode indicator */}
        {placementMode && tempPosition && (
          <PlacementMarker
            position={{ x: tempPosition.x, y: tempPosition.y, z: tempPosition.z }}
            onClick={onGuessPlaced}
          />
        )}
        
        <mesh
          visible={false}
          position={[0, 0, 0]}
          onPointerMove={(e) => {
            if (placementMode) {
              setTempPosition(e.point);
            }
          }}
          onClick={handleCanvasClick}
        >
          <boxGeometry args={[20, 20, 20]} />
        </mesh>
      </Canvas>
      
      {!userGuess && (
        <Button
          onClick={() => setPlacementMode(!placementMode)}
          className={cn(
            "absolute bottom-4 left-1/2 transform -translate-x-1/2",
            "transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            placementMode && "bg-orange-500 hover:bg-orange-600"
          )}
          size="lg"
        >
          {placementMode ? 'Click in space to place word' : 'Start Placing Word'}
        </Button>
      )}
    </div>
  );
}