#!/usr/bin/env python3
"""
Script to download and process GloVe embeddings for the word space game.
Downloads the 50D GloVe vectors, extracts a subset of useful words,
and reduces dimensionality to 3D using PCA.
"""

import json
import numpy as np
import requests
import zipfile
import os
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Words we want to include in our game (curated for good gameplay)
GAME_WORDS = [
    # Animals
    'cat', 'dog', 'mouse', 'elephant', 'lion', 'bird', 'fish', 'tiger', 
    'bear', 'rabbit', 'horse', 'sheep', 'pig', 'cow', 'chicken', 'duck',
    'monkey', 'snake', 'turtle', 'frog',
    
    # Food
    'apple', 'banana', 'bread', 'cheese', 'pizza', 'cake', 'orange', 
    'grape', 'strawberry', 'chocolate', 'coffee', 'tea', 'milk', 'water',
    'juice', 'pasta', 'rice', 'meat', 'vegetable', 'fruit',
    
    # Technology
    'computer', 'phone', 'laptop', 'internet', 'software', 'robot',
    'tablet', 'keyboard', 'screen', 'camera', 'printer', 'wifi',
    'app', 'website', 'email', 'data', 'code', 'algorithm',
    
    # Nature
    'tree', 'flower', 'mountain', 'ocean', 'river', 'forest', 'lake',
    'beach', 'desert', 'rain', 'snow', 'wind', 'sun', 'moon', 'star',
    'cloud', 'grass', 'rock', 'sand', 'wave',
    
    # Emotions
    'happy', 'sad', 'angry', 'excited', 'calm', 'love', 'fear', 'joy',
    'surprise', 'trust', 'hope', 'pride', 'anxiety', 'shame', 'guilt',
    
    # Transportation
    'car', 'train', 'airplane', 'bicycle', 'boat', 'bus', 'truck',
    'motorcycle', 'helicopter', 'ship', 'taxi', 'subway',
    
    # Colors
    'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'brown',
    'black', 'white', 'gray', 'gold', 'silver',
    
    # Body parts
    'hand', 'foot', 'head', 'eye', 'ear', 'nose', 'mouth', 'arm',
    'leg', 'heart', 'brain', 'finger', 'shoulder',
    
    # Abstract concepts
    'time', 'space', 'idea', 'thought', 'dream', 'memory', 'future',
    'past', 'present', 'truth', 'knowledge', 'wisdom', 'reality',
    
    # Sports
    'football', 'basketball', 'baseball', 'soccer', 'tennis', 'golf',
    'swimming', 'running', 'cycling', 'hockey', 'volleyball', 'boxing',
    
    # Clothing
    'shirt', 'pants', 'shoes', 'hat', 'dress', 'jacket', 'socks',
    'gloves', 'belt', 'coat', 'boots', 'tie',
    
    # Common verbs
    'run', 'walk', 'jump', 'swim', 'fly', 'drive', 'eat', 'drink',
    'sleep', 'work', 'play', 'read', 'write', 'think', 'speak',
    'listen', 'see', 'hear', 'feel', 'touch',
    
    # Common adjectives
    'big', 'small', 'tall', 'short', 'fast', 'slow', 'hot', 'cold',
    'warm', 'cool', 'light', 'dark', 'bright', 'loud', 'quiet',
    'new', 'old', 'young', 'good', 'bad', 'beautiful', 'ugly',
    'strong', 'weak', 'easy', 'hard', 'soft', 'smooth'
]

def download_glove():
    """Download GloVe 50D embeddings if not already present."""
    url = "https://nlp.stanford.edu/data/glove.6B.zip"
    filename = "glove.6B.zip"
    
    if not os.path.exists("glove.6B.50d.txt"):
        print("Downloading GloVe embeddings...")
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        
        with open(filename, 'wb') as file:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    file.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        print(f"\rProgress: {percent:.1f}%", end='')
        
        print("\nExtracting...")
        with zipfile.ZipFile(filename, 'r') as zip_ref:
            zip_ref.extractall('.')
        
        os.remove(filename)
        print("Download complete!")
    else:
        print("GloVe file already exists.")

def load_glove_embeddings():
    """Load GloVe embeddings from file."""
    print("Loading GloVe embeddings...")
    embeddings = {}
    
    with open('glove.6B.50d.txt', 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split()
            word = parts[0]
            if word in GAME_WORDS:
                vector = np.array([float(x) for x in parts[1:]])
                embeddings[word] = vector
    
    print(f"Loaded {len(embeddings)} word embeddings")
    return embeddings

def reduce_to_3d(embeddings):
    """Reduce embeddings from 50D to 3D using PCA."""
    print("Reducing dimensionality to 3D...")
    
    words = list(embeddings.keys())
    vectors = np.array([embeddings[word] for word in words])
    
    # Standardize the features
    scaler = StandardScaler()
    vectors_scaled = scaler.fit_transform(vectors)
    
    # Apply PCA
    pca = PCA(n_components=3)
    vectors_3d = pca.fit_transform(vectors_scaled)
    
    # Scale to game coordinates (roughly -3 to 3 range)
    vectors_3d = vectors_3d * 2
    
    print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
    print(f"Total explained variance: {sum(pca.explained_variance_ratio_):.3f}")
    
    return {word: vectors_3d[i].tolist() for i, word in enumerate(words)}

def categorize_words(word_embeddings_3d):
    """Categorize words for the game."""
    categories = {
        'animals': ['cat', 'dog', 'mouse', 'elephant', 'lion', 'bird', 'fish', 'tiger', 'bear', 'rabbit', 'horse', 'sheep', 'pig', 'cow', 'chicken', 'duck', 'monkey', 'snake', 'turtle', 'frog'],
        'food': ['apple', 'banana', 'bread', 'cheese', 'pizza', 'cake', 'orange', 'grape', 'strawberry', 'chocolate', 'coffee', 'tea', 'milk', 'water', 'juice', 'pasta', 'rice', 'meat', 'vegetable', 'fruit'],
        'technology': ['computer', 'phone', 'laptop', 'internet', 'software', 'robot', 'tablet', 'keyboard', 'screen', 'camera', 'printer', 'wifi', 'app', 'website', 'email', 'data', 'code', 'algorithm'],
        'nature': ['tree', 'flower', 'mountain', 'ocean', 'river', 'forest', 'lake', 'beach', 'desert', 'rain', 'snow', 'wind', 'sun', 'moon', 'star', 'cloud', 'grass', 'rock', 'sand', 'wave'],
        'emotions': ['happy', 'sad', 'angry', 'excited', 'calm', 'love', 'fear', 'joy', 'surprise', 'trust', 'hope', 'pride', 'anxiety', 'shame', 'guilt'],
        'transportation': ['car', 'train', 'airplane', 'bicycle', 'boat', 'bus', 'truck', 'motorcycle', 'helicopter', 'ship', 'taxi', 'subway'],
        'colors': ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'gold', 'silver'],
        'body': ['hand', 'foot', 'head', 'eye', 'ear', 'nose', 'mouth', 'arm', 'leg', 'heart', 'brain', 'finger', 'shoulder'],
        'abstract': ['time', 'space', 'idea', 'thought', 'dream', 'memory', 'future', 'past', 'present', 'truth', 'knowledge', 'wisdom', 'reality'],
        'sports': ['football', 'basketball', 'baseball', 'soccer', 'tennis', 'golf', 'swimming', 'running', 'cycling', 'hockey', 'volleyball', 'boxing'],
        'clothing': ['shirt', 'pants', 'shoes', 'hat', 'dress', 'jacket', 'socks', 'gloves', 'belt', 'coat', 'boots', 'tie'],
        'verbs': ['run', 'walk', 'jump', 'swim', 'fly', 'drive', 'eat', 'drink', 'sleep', 'work', 'play', 'read', 'write', 'think', 'speak', 'listen', 'see', 'hear', 'feel', 'touch'],
        'adjectives': ['big', 'small', 'tall', 'short', 'fast', 'slow', 'hot', 'cold', 'warm', 'cool', 'light', 'dark', 'bright', 'loud', 'quiet', 'new', 'old', 'young', 'good', 'bad', 'beautiful', 'ugly', 'strong', 'weak', 'easy', 'hard', 'soft', 'smooth']
    }
    
    result = []
    for category, words in categories.items():
        for word in words:
            if word in word_embeddings_3d:
                x, y, z = word_embeddings_3d[word]
                result.append({
                    'word': word,
                    'position': {'x': x, 'y': y, 'z': z},
                    'category': category
                })
    
    return result

def main():
    """Main processing pipeline."""
    print("Processing GloVe embeddings for word space game...")
    
    # Download GloVe data
    download_glove()
    
    # Load embeddings for our words
    embeddings = load_glove_embeddings()
    
    if len(embeddings) == 0:
        print("No embeddings found! Check if words exist in GloVe dataset.")
        return
    
    # Reduce to 3D
    embeddings_3d = reduce_to_3d(embeddings)
    
    # Categorize and format for the game
    game_data = categorize_words(embeddings_3d)
    
    # Save to JSON file
    output_file = "../src/data/glove_embeddings_3d.json"
    with open(output_file, 'w') as f:
        json.dump(game_data, f, indent=2)
    
    print(f"Saved {len(game_data)} word embeddings to {output_file}")
    print("Processing complete!")

if __name__ == "__main__":
    main()