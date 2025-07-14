import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Vector3 } from 'three';
import type { WordEmbedding } from '../types';

interface WordSpace3DProps {
  referenceWords: WordEmbedding[];
  targetWord: WordEmbedding | null;
  userGuess: { x: number; y: number; z: number } | null;
  onGuessPlaced: (position: { x: number; y: number; z: number }) => void;
  showTarget: boolean;
}

function Word({ word, position, color = "blue", size = 0.1 }: { 
  word: string; 
  position: { x: number; y: number; z: number };
  color?: string;
  size?: number;
}) {
  return (
    <group position={[position.x, position.y, position.z]}>
      <Sphere args={[size, 16, 16]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.15}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {word}
      </Text>
    </group>
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
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        
        {/* Grid helpers */}
        <gridHelper args={[10, 10]} rotation={[0, 0, 0]} />
        <gridHelper args={[10, 10]} rotation={[Math.PI / 2, 0, 0]} />
        <gridHelper args={[10, 10]} rotation={[0, 0, Math.PI / 2]} />
        
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
            color="#4299e1"
            size={0.12}
          />
        ))}
        
        {/* User guess */}
        {userGuess && (
          <Word
            word="Your Guess"
            position={userGuess}
            color="#f56565"
            size={0.15}
          />
        )}
        
        {/* Target word (shown after guess) */}
        {showTarget && targetWord && (
          <Word
            word={targetWord.word}
            position={targetWord.position}
            color="#48bb78"
            size={0.15}
          />
        )}
        
        {/* Connection line between guess and target */}
        {showTarget && targetWord && userGuess && (
          <Line
            points={[
              [userGuess.x, userGuess.y, userGuess.z],
              [targetWord.position.x, targetWord.position.y, targetWord.position.z]
            ]}
            color="#e53e3e"
            lineWidth={2}
            dashed
            dashScale={0.1}
          />
        )}
        
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
        <button
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            backgroundColor: placementMode ? '#e53e3e' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onClick={() => setPlacementMode(!placementMode)}
        >
          {placementMode ? 'Click in space to place word' : 'Start Placing Word'}
        </button>
      )}
    </div>
  );
}