# How to Generate 2 Months of Puzzles

## ⚠️ IMPORTANT: Protect Your API Key

Your OpenAI API key is currently in the `.env` file. Before pushing to GitHub:

1. **Never commit the `.env` file** (it's already in .gitignore)
2. **The puzzle JSON files are safe to commit** - they don't contain any sensitive data

## 🎯 Generate Puzzles (Do this locally)

### Option 1: Direct Command
```bash
# This will generate puzzles for the next 60 days
node scripts/generatePuzzles.mjs
```

### Option 2: Clean and Generate
```bash
# First delete old puzzles
node scripts/deletePuzzles.js

# Then generate new ones
node scripts/generatePuzzles.mjs
```

### Option 3: Use the regenerate script
```bash
node scripts/regeneratePuzzles.mjs
```

## 📊 What to Expect

- **Time**: ~5-10 minutes for 60 days (300 puzzles total)
- **Files**: Creates 60 JSON files in `/src/data/puzzles/`
- **Format**: `YYYY-MM-DD.json` (e.g., `2025-07-19.json`)
- **Rate Limits**: The script has delays to avoid OpenAI rate limits

## 🚀 After Generation

1. **Check the puzzles**:
   ```bash
   ls -la src/data/puzzles/ | wc -l
   # Should show 60+ files
   ```

2. **Remove sensitive data**:
   ```bash
   # Option 1: Remove the .env file
   rm .env
   
   # Option 2: Clear the API key
   echo "VITE_OPENAI_API_KEY=" > .env
   ```

3. **Commit the puzzles**:
   ```bash
   git add src/data/puzzles/
   git commit -m "Add 60 days of pre-generated puzzles"
   git push
   ```

## 🔒 Security Checklist

Before pushing to GitHub:
- [ ] `.env` file is in `.gitignore` ✓ (already done)
- [ ] No API keys in any committed files
- [ ] Only puzzle JSON files are being committed
- [ ] API key removed or cleared from `.env`

## 💡 For Deployment

Once puzzles are generated and committed:
1. Deploy to Vercel/Netlify without the API key
2. The game will use the pre-generated puzzles
3. No API calls needed in production
4. Users get the same daily puzzles

## 🔄 Future Puzzle Generation

To add more puzzles later:
1. Set up the API key locally
2. Modify the date range in the script
3. Generate and commit new puzzle files
4. No need to redeploy - just push to Git