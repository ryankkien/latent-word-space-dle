#!/usr/bin/env python3
"""
Quick script to reduce embeddings file size by taking every Nth word.
This is a simple approach that maintains diversity.
"""
import json
import os

def main():
    input_file = '../src/data/glove_embeddings_3d_full.json'
    output_file = '../src/data/embeddings_with_words.json'
    
    if not os.path.exists(input_file):
        print(f"❌ File not found: {input_file}")
        return
    
    print("📥 Loading full embeddings...")
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    original_count = len(data)
    print(f"📊 Original: {original_count:,} words")
    
    # Calculate step size to get approximately 20,000 words
    target_size = 20000
    step = max(1, original_count // target_size)
    
    print(f"🔢 Taking every {step} words...")
    
    # Take every nth word to maintain diversity across the vocabulary
    reduced = data[::step]
    
    final_count = len(reduced)
    print(f"📊 Reduced: {final_count:,} words")
    
    # Save without pretty printing to minimize file size
    print("💾 Saving compact file...")
    with open(output_file, 'w') as f:
        json.dump(reduced, f, separators=(',', ':'))
    
    # Check file sizes
    original_size = os.path.getsize(input_file) / (1024 * 1024)
    new_size = os.path.getsize(output_file) / (1024 * 1024)
    reduction = ((original_size - new_size) / original_size) * 100
    
    print(f"✅ Success!")
    print(f"📊 Original size: {original_size:.1f} MB")
    print(f"📊 New size: {new_size:.1f} MB")
    print(f"📊 Reduction: {reduction:.1f}%")
    
    # Show some sample words
    sample = [item['word'] for item in reduced[:10]]
    print(f"📝 Sample words: {', '.join(sample)}")

if __name__ == "__main__":
    main()