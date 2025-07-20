#!/usr/bin/env python3
import os
import glob

# Path to the puzzles directory
puzzles_dir = '/Users/wiggles/Documents/latent-word-space-dle/src/data/puzzles'

# Find all JSON files
json_files = glob.glob(os.path.join(puzzles_dir, '*.json'))

# Delete each JSON file
for file_path in json_files:
    try:
        os.remove(file_path)
        print(f"Deleted: {file_path}")
    except Exception as e:
        print(f"Error deleting {file_path}: {e}")

print(f"\nTotal files deleted: {len(json_files)}")