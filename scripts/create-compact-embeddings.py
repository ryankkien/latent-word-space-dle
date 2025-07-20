#!/usr/bin/env python3
import json
import os
from collections import Counter

# Path to the full embeddings file
full_embeddings_path = '../src/data/glove_embeddings_3d_full.json'
output_path = '../src/data/embeddings_with_words.json'

# List of most common English words (you can expand this list)
# These are based on frequency in common usage
COMMON_WORDS = [
    # Top function words
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    
    # Common nouns
    'time', 'person', 'year', 'way', 'day', 'thing', 'man', 'world', 'life', 'hand', 'part', 'child', 'eye', 'woman', 'place', 'work', 'week', 'case', 'point', 'government',
    'company', 'number', 'group', 'problem', 'fact', 'money', 'business', 'service', 'book', 'water', 'food', 'house', 'car', 'school', 'family', 'state', 'country', 'area',
    
    # Common verbs
    'get', 'go', 'make', 'know', 'take', 'see', 'come', 'think', 'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try', 'leave',
    'call', 'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young',
    
    # Common adjectives
    'important', 'few', 'public', 'bad', 'same', 'able', 'local', 'sure', 'possible', 'late', 'hard', 'far', 'major', 'better', 'economic', 'strong', 'necessary', 'clear', 'real', 'trade',
    
    # Colors
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'brown', 'orange', 'purple', 'pink', 'gray', 'grey',
    
    # Animals
    'cat', 'dog', 'bird', 'fish', 'horse', 'cow', 'pig', 'chicken', 'sheep', 'mouse', 'lion', 'tiger', 'bear', 'elephant', 'monkey', 'rabbit', 'deer', 'wolf',
    
    # Food
    'apple', 'banana', 'orange', 'bread', 'milk', 'cheese', 'meat', 'chicken', 'fish', 'rice', 'pasta', 'pizza', 'cake', 'chocolate', 'coffee', 'tea', 'beer', 'wine',
    
    # Body parts
    'head', 'face', 'eye', 'nose', 'mouth', 'ear', 'hair', 'neck', 'shoulder', 'arm', 'hand', 'finger', 'leg', 'foot', 'back', 'chest', 'heart', 'brain',
    
    # Nature
    'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'snow', 'wind', 'tree', 'flower', 'grass', 'mountain', 'river', 'lake', 'ocean', 'beach', 'forest', 'desert',
    
    # Technology
    'computer', 'phone', 'internet', 'website', 'email', 'software', 'app', 'game', 'music', 'video', 'camera', 'television', 'radio', 'machine', 'robot',
    
    # Emotions
    'happy', 'sad', 'angry', 'excited', 'worried', 'surprised', 'scared', 'proud', 'lonely', 'grateful', 'confused', 'disappointed', 'nervous', 'calm', 'peaceful'
]

def load_word_frequency_list():
    """
    Load a more comprehensive list of common words.
    In a real implementation, you'd load this from a frequency corpus like Google's n-grams.
    For now, we'll use a basic approach.
    """
    # This is a simplified approach - in practice you'd use a real frequency list
    return set(COMMON_WORDS)

def filter_embeddings_by_frequency(embeddings_data, max_words=20000):
    """
    Filter embeddings to keep only the most common/useful words.
    """
    print(f"Starting with {len(embeddings_data)} word embeddings")
    
    # Get our priority words
    priority_words = load_word_frequency_list()
    
    # Separate into priority and non-priority
    priority_embeddings = []
    other_embeddings = []
    
    for embedding in embeddings_data:
        word = embedding['word'].lower()
        if word in priority_words:
            priority_embeddings.append(embedding)
        else:
            # Filter out very uncommon words or problematic ones
            if (len(word) >= 2 and 
                len(word) <= 15 and 
                word.isalpha() and 
                not any(char in word for char in ['_', '-', '.', "'"])):
                other_embeddings.append(embedding)
    
    print(f"Found {len(priority_embeddings)} priority words")
    print(f"Found {len(other_embeddings)} other valid words")
    
    # Take all priority words plus fill up to max_words with others
    remaining_slots = max_words - len(priority_embeddings)
    
    if remaining_slots > 0:
        # Sort others by word length and alphabetically for consistency
        other_embeddings.sort(key=lambda x: (len(x['word']), x['word']))
        selected_others = other_embeddings[:remaining_slots]
    else:
        selected_others = []
    
    final_embeddings = priority_embeddings + selected_others
    
    print(f"Final selection: {len(final_embeddings)} words")
    return final_embeddings

def main():
    # Check if full embeddings file exists
    if not os.path.exists(full_embeddings_path):
        print(f"❌ Full embeddings file not found at {full_embeddings_path}")
        print("Please make sure you have the full GloVe embeddings file.")
        return
    
    print("📥 Loading full embeddings file...")
    with open(full_embeddings_path, 'r') as f:
        full_embeddings = json.load(f)
    
    print("🔍 Filtering to top 20,000 most useful words...")
    compact_embeddings = filter_embeddings_by_frequency(full_embeddings, max_words=20000)
    
    print("💾 Saving compact embeddings...")
    with open(output_path, 'w') as f:
        json.dump(compact_embeddings, f, separators=(',', ':'))
    
    # Check file sizes
    original_size = os.path.getsize(full_embeddings_path) / (1024 * 1024)  # MB
    new_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
    
    print(f"✅ Created compact embeddings file!")
    print(f"📊 Original size: {original_size:.1f} MB")
    print(f"📊 New size: {new_size:.1f} MB")
    print(f"📊 Reduction: {((original_size - new_size) / original_size * 100):.1f}%")
    print(f"📊 Words included: {len(compact_embeddings)}")
    
    # Show some sample words
    sample_words = [emb['word'] for emb in compact_embeddings[:20]]
    print(f"📝 Sample words: {', '.join(sample_words)}")

if __name__ == "__main__":
    main()