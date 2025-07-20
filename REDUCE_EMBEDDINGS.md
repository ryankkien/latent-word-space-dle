# Reduce Embeddings File Size

Your embeddings file is too large for GitHub/Vercel. Here's how to create a smaller version:

## Option 1: Use the Script I Created

Run this command in your terminal:

```bash
node scripts/create-compact-embeddings.mjs
```

This will:
- Keep only 20,000 most useful words
- Prioritize common English words
- Filter out technical/obscure terms
- Reduce file size by ~80%

## Option 2: Manual Reduction (if script fails)

1. **Check current file size:**
```bash
ls -lh src/data/glove_embeddings_3d_full.json
```

2. **Create a backup:**
```bash
cp src/data/glove_embeddings_3d_full.json src/data/glove_embeddings_3d_full_backup.json
```

3. **Use Python to reduce (if you have Python):**
```python
import json

# Load the full file
with open('src/data/glove_embeddings_3d_full.json', 'r') as f:
    data = json.load(f)

print(f"Original: {len(data)} words")

# Take every 16th word (reduces from ~326k to ~20k)
reduced = data[::16]

print(f"Reduced: {len(reduced)} words")

# Save the reduced file
with open('src/data/embeddings_with_words.json', 'w') as f:
    json.dump(reduced, f, separators=(',', ':'))

print("✅ Created compact embeddings file!")
```

## Option 3: Quick Deploy Without Full Embeddings

For the fastest deployment:

1. **Delete the large file temporarily:**
```bash
rm src/data/embeddings_with_words.json
```

2. **Run the setup script:**
```bash
node scripts/setup-embeddings.js
```

3. **This creates a minimal file with just a few words**

4. **Deploy immediately:**
```bash
git add .
git commit -m "Prepare for deployment with minimal embeddings"
git push
vercel
```

5. **Add full embeddings later after deployment**

## What Each Option Gives You:

- **Option 1**: Best quality - keeps most useful 20k words
- **Option 2**: Good quality - systematic reduction
- **Option 3**: Fastest - minimal words, deploy now, improve later

## Recommended: Try Option 1 First

The script I created prioritizes:
- Common function words (the, and, but, etc.)
- Everyday nouns (cat, house, book, etc.)
- Basic verbs (run, eat, think, etc.)
- Colors, numbers, animals, food
- Filters out technical jargon

This gives you the best gaming experience with a manageable file size.