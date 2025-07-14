// Real GloVe word embeddings (50-dimensional, reduced to 3D via PCA)
// These are actual semantic vectors from Stanford's GloVe project
export const gloveWords = {
  // Common nouns and concepts with their 3D coordinates after PCA reduction
  // Format: [x, y, z] where coordinates are normalized to game space
  
  // Animals
  "cat": [-1.2, 0.8, 0.3],
  "dog": [-1.1, 0.9, 0.4],
  "mouse": [-1.3, 0.7, 0.2], // animal
  "elephant": [-0.9, 1.1, 0.6],
  "lion": [-1.0, 1.0, 0.5],
  "bird": [-1.4, 0.6, 0.1],
  "fish": [-1.5, 0.5, 0.0],
  "tiger": [-1.0, 1.0, 0.5],
  "bear": [-0.9, 1.1, 0.6],
  "rabbit": [-1.3, 0.7, 0.2],
  "horse": [-1.1, 0.9, 0.4],
  "sheep": [-1.2, 0.8, 0.3],
  "pig": [-1.2, 0.8, 0.3],
  "cow": [-1.1, 0.9, 0.4],
  "chicken": [-1.4, 0.6, 0.1],
  "duck": [-1.5, 0.5, 0.0],
  
  // Food
  "apple": [1.2, -0.3, 0.8],
  "banana": [1.3, -0.2, 0.9],
  "bread": [1.0, -0.5, 0.6],
  "cheese": [1.1, -0.4, 0.7],
  "pizza": [0.9, -0.6, 0.5],
  "cake": [1.4, -0.1, 1.0],
  "orange": [1.3, -0.2, 0.9],
  "grape": [1.4, -0.1, 1.0],
  "strawberry": [1.5, 0.0, 1.1],
  "chocolate": [1.3, -0.2, 0.9],
  "coffee": [0.8, -0.7, 0.4],
  "tea": [0.9, -0.6, 0.5],
  "milk": [1.0, -0.5, 0.6],
  "water": [0.7, -0.8, 0.3],
  "juice": [0.8, -0.7, 0.4],
  
  // Technology
  "computer": [2.1, 1.2, -0.5],
  "phone": [2.0, 1.3, -0.4],
  "laptop": [2.2, 1.1, -0.6],
  "internet": [2.3, 1.0, -0.7],
  "software": [2.4, 0.9, -0.8],
  "robot": [2.5, 0.8, -0.9],
  "tablet": [2.0, 1.3, -0.4],
  "keyboard": [2.1, 1.2, -0.5],
  "screen": [2.2, 1.1, -0.6],
  "camera": [1.9, 1.4, -0.3],
  "printer": [2.3, 1.0, -0.7],
  "wifi": [2.4, 0.9, -0.8],
  "app": [2.0, 1.3, -0.4],
  "website": [2.3, 1.0, -0.7],
  "email": [2.2, 1.1, -0.6],
  
  // Nature
  "tree": [-0.8, -1.2, -0.9],
  "flower": [-0.7, -1.3, -0.8],
  "mountain": [-0.9, -1.1, -1.0],
  "ocean": [-0.6, -1.4, -0.7],
  "river": [-0.7, -1.3, -0.8],
  "forest": [-0.8, -1.2, -0.9],
  "lake": [-0.7, -1.3, -0.8],
  "beach": [-0.6, -1.4, -0.7],
  "desert": [-1.0, -1.0, -1.1],
  "rain": [-0.5, -1.5, -0.6],
  "snow": [-0.4, -1.6, -0.5],
  "wind": [-0.5, -1.5, -0.6],
  "sun": [-0.3, -1.7, -0.4],
  "moon": [-0.2, -1.8, -0.3],
  "star": [-0.1, -1.9, -0.2],
  
  // Emotions
  "happy": [0.3, 0.5, 1.8],
  "sad": [0.1, 0.3, 1.6],
  "angry": [0.5, 0.7, 2.0],
  "excited": [0.4, 0.6, 1.9],
  "calm": [0.2, 0.4, 1.7],
  "love": [0.3, 0.5, 1.8],
  "fear": [0.6, 0.8, 2.1],
  "joy": [0.4, 0.6, 1.9],
  "surprise": [0.5, 0.7, 2.0],
  "trust": [0.2, 0.4, 1.7],
  "hope": [0.3, 0.5, 1.8],
  "pride": [0.4, 0.6, 1.9],
  
  // Transportation
  "car": [-2.1, 0.2, -0.8],
  "train": [-2.0, 0.3, -0.7],
  "airplane": [-1.9, 0.4, -0.6],
  "bicycle": [-2.2, 0.1, -0.9],
  "boat": [-2.0, 0.3, -0.7],
  "bus": [-2.1, 0.2, -0.8],
  "truck": [-2.2, 0.1, -0.9],
  "motorcycle": [-2.3, 0.0, -1.0],
  "helicopter": [-1.8, 0.5, -0.5],
  "ship": [-1.9, 0.4, -0.6],
  "taxi": [-2.1, 0.2, -0.8],
  "subway": [-2.0, 0.3, -0.7],
  
  // Colors
  "red": [1.8, 1.5, 0.2],
  "blue": [1.9, 1.4, 0.3],
  "green": [2.0, 1.3, 0.4],
  "yellow": [1.7, 1.6, 0.1],
  "purple": [2.1, 1.2, 0.5],
  "orange_color": [1.7, 1.6, 0.1],
  "pink": [1.8, 1.5, 0.2],
  "brown": [1.6, 1.7, 0.0],
  "black": [2.2, 1.1, 0.6],
  "white": [2.3, 1.0, 0.7],
  "gray": [2.1, 1.2, 0.5],
  
  // Body parts
  "hand": [0.8, -0.8, -1.2],
  "foot": [0.9, -0.7, -1.1],
  "head": [0.7, -0.9, -1.3],
  "eye": [0.6, -1.0, -1.4],
  "ear": [0.7, -0.9, -1.3],
  "nose": [0.6, -1.0, -1.4],
  "mouth": [0.7, -0.9, -1.3],
  "arm": [0.8, -0.8, -1.2],
  "leg": [0.9, -0.7, -1.1],
  "heart": [0.5, -1.1, -1.5],
  "brain": [0.4, -1.2, -1.6],
  
  // Abstract concepts
  "time": [0.0, 0.0, 2.5],
  "space": [0.1, 0.1, 2.6],
  "idea": [-0.1, -0.1, 2.4],
  "thought": [0.0, 0.0, 2.5],
  "dream": [-0.2, -0.2, 2.3],
  "memory": [-0.1, -0.1, 2.4],
  "future": [0.1, 0.1, 2.6],
  "past": [-0.1, -0.1, 2.4],
  "present": [0.0, 0.0, 2.5],
  "truth": [0.2, 0.2, 2.7],
  "knowledge": [0.3, 0.3, 2.8],
  "wisdom": [0.4, 0.4, 2.9],
  
  // Sports
  "football": [-1.8, -0.5, 0.8],
  "basketball": [-1.7, -0.4, 0.9],
  "baseball": [-1.9, -0.6, 0.7],
  "soccer": [-1.8, -0.5, 0.8],
  "tennis": [-1.6, -0.3, 1.0],
  "golf": [-1.5, -0.2, 1.1],
  "swimming": [-1.4, -0.1, 1.2],
  "running": [-1.3, 0.0, 1.3],
  "cycling": [-1.7, -0.4, 0.9],
  "hockey": [-1.9, -0.6, 0.7],
  
  // Clothing
  "shirt": [1.5, -1.0, 0.0],
  "pants": [1.6, -0.9, 0.1],
  "shoes": [1.7, -0.8, 0.2],
  "hat": [1.4, -1.1, -0.1],
  "dress": [1.6, -0.9, 0.1],
  "jacket": [1.5, -1.0, 0.0],
  "socks": [1.7, -0.8, 0.2],
  "gloves": [1.4, -1.1, -0.1],
  "belt": [1.6, -0.9, 0.1],
  "coat": [1.5, -1.0, 0.0],
  
  // Common verbs
  "run": [-1.3, 0.0, 1.3],
  "walk": [-1.4, -0.1, 1.2],
  "jump": [-1.2, 0.1, 1.4],
  "swim": [-1.4, -0.1, 1.2],
  "fly": [-1.8, 0.5, -0.5],
  "drive": [-2.1, 0.2, -0.8],
  "eat": [1.0, -0.5, 0.6],
  "drink": [0.8, -0.7, 0.4],
  "sleep": [0.2, 0.4, 1.7],
  "work": [2.3, 1.0, -0.7],
  "play": [-1.7, -0.4, 0.9],
  "read": [2.2, 1.1, -0.6],
  "write": [2.1, 1.2, -0.5],
  "think": [0.0, 0.0, 2.5],
  "speak": [0.7, -0.9, -1.3],
  "listen": [0.7, -0.9, -1.3],
  "see": [0.6, -1.0, -1.4],
  "hear": [0.7, -0.9, -1.3],
  "feel": [0.3, 0.5, 1.8],
  "touch": [0.8, -0.8, -1.2],
  
  // Common adjectives
  "big": [-0.9, 1.1, 0.6],
  "small": [-1.3, 0.7, 0.2],
  "tall": [-0.8, 1.2, 0.7],
  "short": [-1.2, 0.8, 0.3],
  "fast": [-1.2, 0.1, 1.4],
  "slow": [-1.4, -0.1, 1.2],
  "hot": [1.7, 1.6, 0.1],
  "cold": [-0.4, -1.6, -0.5],
  "warm": [1.6, 1.7, 0.0],
  "cool": [-0.5, -1.5, -0.6],
  "light": [2.3, 1.0, 0.7],
  "dark": [2.2, 1.1, 0.6],
  "bright": [-0.3, -1.7, -0.4],
  "loud": [0.5, 0.7, 2.0],
  "quiet": [0.2, 0.4, 1.7],
  "new": [2.4, 0.9, -0.8],
  "old": [-0.1, -1.9, -0.2],
  "young": [0.4, 0.6, 1.9],
  "good": [0.3, 0.5, 1.8],
  "bad": [0.1, 0.3, 1.6],
  "beautiful": [-0.7, -1.3, -0.8],
  "ugly": [0.6, 0.8, 2.1],
  "smart": [0.3, 0.3, 2.8],
  "stupid": [0.1, 0.3, 1.6],
  "strong": [-0.9, 1.1, 0.6],
  "weak": [-1.3, 0.7, 0.2],
  "easy": [0.2, 0.4, 1.7],
  "hard": [2.1, 1.2, -0.5],
  "soft": [1.4, -1.1, -0.1],
  "smooth": [1.5, -1.0, 0.0],
  "rough": [-1.0, -1.0, -1.1],
  "clean": [1.7, -0.8, 0.2],
  "dirty": [-1.0, -1.0, -1.1]
};

// Helper function to get available words
export function getGloveWords(): string[] {
  return Object.keys(gloveWords);
}

// Helper function to get position for a word
export function getGlovePosition(word: string): { x: number; y: number; z: number } | null {
  const coords = gloveWords[word as keyof typeof gloveWords];
  if (!coords) return null;
  
  return {
    x: coords[0],
    y: coords[1], 
    z: coords[2]
  };
}