#!/usr/bin/env python3
"""
Process the full GloVe embeddings file (400,000 words) and reduce dimensionality to 3D.
"""

import numpy as np
import json
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import os

def load_glove_embeddings(file_path):
    """Load GloVe embeddings from text file."""
    print(f"Loading GloVe embeddings from {file_path}...")
    
    words = []
    embeddings = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            if i % 50000 == 0:
                print(f"Processed {i} words...")
            
            parts = line.strip().split()
            word = parts[0]
            vector = [float(x) for x in parts[1:]]
            
            # Skip words with non-standard characters or very short/long words
            if len(word) < 2 or len(word) > 20 or not word.isalpha():
                continue
                
            words.append(word.lower())  # Convert to lowercase
            embeddings.append(vector)
    
    print(f"Loaded {len(words)} valid words")
    return words, np.array(embeddings)

def reduce_dimensions(embeddings, n_components=3):
    """Reduce embeddings from 50D to 3D using PCA."""
    print(f"Reducing dimensions from {embeddings.shape[1]}D to {n_components}D...")
    
    # Standardize the features
    scaler = StandardScaler()
    embeddings_scaled = scaler.fit_transform(embeddings)
    
    # Apply PCA
    pca = PCA(n_components=n_components)
    embeddings_reduced = pca.fit_transform(embeddings_scaled)
    
    print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
    print(f"Total explained variance: {sum(pca.explained_variance_ratio_):.3f}")
    
    return embeddings_reduced

def save_embeddings_json(words, embeddings_3d, output_file):
    """Save words and 3D embeddings to JSON file."""
    print(f"Saving {len(words)} words to {output_file}...")
    
    # Scale coordinates to reasonable range for visualization
    embeddings_3d = embeddings_3d * 5  # Scale up for better visualization
    
    data = []
    for word, coords in zip(words, embeddings_3d):
        data.append({
            "word": word,
            "position": {
                "x": float(coords[0]),
                "y": float(coords[1]),
                "z": float(coords[2])
            },
            "category": "general"  # Could be enhanced with word categories later
        })
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"Successfully saved {len(data)} word embeddings")

def main():
    # File paths
    input_file = "glove.6B.50d.txt"
    output_file = "../src/data/glove_embeddings_3d_full.json"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found in current directory")
        print("Make sure you're running this script from the scripts/ directory")
        return
    
    try:
        # Load embeddings
        words, embeddings = load_glove_embeddings(input_file)
        
        # Reduce dimensions
        embeddings_3d = reduce_dimensions(embeddings, n_components=3)
        
        # Save to JSON
        save_embeddings_json(words, embeddings_3d, output_file)
        
        print("\n✅ Processing complete!")
        print(f"📊 Processed {len(words)} words from 50D to 3D")
        print(f"💾 Saved to: {output_file}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()