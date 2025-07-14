import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { WordEmbedding } from '../types';
import { getBoundingBox } from '../utils/wordBetween';

interface CameraControllerProps {
  zoomToResult: boolean;
  userGuess: { x: number; y: number; z: number } | null;
  targetWord: WordEmbedding | null;
  betweenWords: WordEmbedding[];
}

export function CameraController({ zoomToResult, userGuess, targetWord, betweenWords }: CameraControllerProps) {
  const { camera, controls } = useThree();
  const targetPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const isAnimating = useRef(false);

  useEffect(() => {
    if (zoomToResult && userGuess && targetWord) {
      const positions = [userGuess, targetWord.position, ...betweenWords.map(w => w.position)];
      const box = getBoundingBox(positions);
      const distance = Math.max(box.size.x, box.size.y, box.size.z) * 2.5;
      
      // Set target camera position
      targetPosition.current.set(
        box.center.x + distance * 0.7,
        box.center.y + distance * 0.7,
        box.center.z + distance * 0.7
      );
      
      // Set target look-at point
      targetLookAt.current.set(box.center.x, box.center.y, box.center.z);
      
      isAnimating.current = true;
    }
  }, [zoomToResult, userGuess, targetWord, betweenWords]);

  useFrame(() => {
    if (isAnimating.current) {
      // Smoothly interpolate camera position
      camera.position.lerp(targetPosition.current, 0.05);
      
      // Update controls target
      if (controls) {
        const currentTarget = (controls as any).target;
        currentTarget.lerp(targetLookAt.current, 0.05);
        (controls as any).update();
      }
      
      // Check if animation is complete
      if (camera.position.distanceTo(targetPosition.current) < 0.1) {
        isAnimating.current = false;
      }
    }
  });

  return null;
}