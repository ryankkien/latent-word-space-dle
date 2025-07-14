import type { WordEmbedding } from '../types';
import { wordEmbeddings, calculateDistance } from '../data/wordEmbeddings';

// Get words that lie between two positions
export function getWordsBetween(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number },
  maxWords: number = 10
): WordEmbedding[] {
  const dist1to2 = calculateDistance(pos1, pos2);
  
  // Find words that are:
  // 1. Closer to pos2 than pos1 is
  // 2. Within a reasonable distance from the line between pos1 and pos2
  const betweenWords = wordEmbeddings
    .map(word => {
      const distToPos1 = calculateDistance(word.position, pos1);
      const distToPos2 = calculateDistance(word.position, pos2);
      
      // Check if word is between the two positions
      const isBetween = distToPos2 < dist1to2 && distToPos1 < dist1to2;
      
      // Calculate perpendicular distance to the line between pos1 and pos2
      // Using the formula for distance from point to line in 3D
      const lineVector = {
        x: pos2.x - pos1.x,
        y: pos2.y - pos1.y,
        z: pos2.z - pos1.z
      };
      
      const pointVector = {
        x: word.position.x - pos1.x,
        y: word.position.y - pos1.y,
        z: word.position.z - pos1.z
      };
      
      // Project point onto line
      const lineLengthSquared = lineVector.x ** 2 + lineVector.y ** 2 + lineVector.z ** 2;
      const dotProduct = pointVector.x * lineVector.x + pointVector.y * lineVector.y + pointVector.z * lineVector.z;
      const t = Math.max(0, Math.min(1, dotProduct / lineLengthSquared));
      
      const projectedPoint = {
        x: pos1.x + t * lineVector.x,
        y: pos1.y + t * lineVector.y,
        z: pos1.z + t * lineVector.z
      };
      
      const distanceToLine = calculateDistance(word.position, projectedPoint);
      
      return {
        ...word,
        isBetween,
        distanceToLine,
        distToTarget: distToPos2,
        t // Position along the line (0 = pos1, 1 = pos2)
      };
    })
    .filter(word => word.isBetween && word.distanceToLine < dist1to2 * 0.5) // Within reasonable distance from line
    .sort((a, b) => a.distToTarget - b.distToTarget)
    .slice(0, maxWords);
  
  return betweenWords;
}

// Get the bounding box for zoom animation
export function getBoundingBox(positions: { x: number; y: number; z: number }[]) {
  const xs = positions.map(p => p.x);
  const ys = positions.map(p => p.y);
  const zs = positions.map(p => p.z);
  
  return {
    min: { x: Math.min(...xs), y: Math.min(...ys), z: Math.min(...zs) },
    max: { x: Math.max(...xs), y: Math.max(...ys), z: Math.max(...zs) },
    center: {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
      z: (Math.min(...zs) + Math.max(...zs)) / 2
    },
    size: {
      x: Math.max(...xs) - Math.min(...xs),
      y: Math.max(...ys) - Math.min(...ys),
      z: Math.max(...zs) - Math.min(...zs)
    }
  };
}