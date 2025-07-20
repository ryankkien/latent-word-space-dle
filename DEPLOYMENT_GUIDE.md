# Deployment Guide - Handling Large Embeddings File

The `embeddings_with_words.json` file is too large for GitHub (>100MB). Here are your options:

## Option 1: Use Git LFS (Git Large File Storage) - Recommended
```bash
# Install Git LFS
brew install git-lfs  # macOS
# or: apt-get install git-lfs  # Ubuntu/Debian

# Initialize Git LFS in your repo
git lfs install

# Track the embeddings file
git lfs track "src/data/embeddings_with_words.json"

# Add the .gitattributes file
git add .gitattributes

# Now you can commit and push normally
git add .
git commit -m "Add embeddings with Git LFS"
git push
```

**Note**: GitHub gives you 1GB of free LFS storage and 1GB/month bandwidth.

## Option 2: Host on Cloud Storage (Free Options)

### Using Cloudflare R2 (Free tier: 10GB storage, 1M requests/month)
1. Create a Cloudflare account
2. Create an R2 bucket
3. Upload `embeddings_with_words.json.gz` (compress it first)
4. Update `scripts/setup-embeddings.js` with the public URL
5. The file will be downloaded during build/deployment

### Using GitHub Releases
1. Compress the file: `gzip -k src/data/embeddings_with_words.json`
2. Create a GitHub release
3. Upload the `.gz` file as a release asset
4. Update the download URL in the setup script

### Using Google Drive / Dropbox
1. Upload the compressed file
2. Get a direct download link
3. Update the setup script

## Option 3: Deploy Without Full Embeddings (Quick Start)

I've already set up the project to handle this:

1. The `.gitignore` already excludes the embeddings file
2. The `setup-embeddings.js` script creates a minimal placeholder file
3. You can deploy immediately and add the full file later

## Step-by-Step Deployment (Vercel)

### 1. Prepare for deployment:
```bash
# Make sure embeddings file is ignored
git rm --cached src/data/embeddings_with_words.json
git add .gitignore
git commit -m "Ignore large embeddings file"
```

### 2. Push to GitHub:
```bash
git push origin main
```

### 3. Deploy to Vercel:
1. Go to https://vercel.com
2. Import your GitHub repository
3. Deploy (it will use the minimal embeddings)

### 4. Add full embeddings later:
Choose one of these methods:
- Upload to cloud storage and update the download script
- Use Vercel's file upload in the dashboard
- Set up Git LFS and redeploy

## Compressing the Embeddings File

To reduce file size:
```bash
# Compress the JSON file (reduces size by ~70%)
gzip -k src/data/embeddings_with_words.json

# Check the compressed size
ls -lh src/data/embeddings_with_words.json.gz
```

## Environment Variables for Production

Create a `.env.production` file:
```
VITE_EMBEDDINGS_URL=https://your-storage-url/embeddings_with_words.json.gz
```

## Quick Deploy Commands

```bash
# Option 1: Deploy with minimal embeddings (fastest)
vercel

# Option 2: Deploy with Git LFS
git lfs track "src/data/embeddings_with_words.json"
git add .gitattributes src/data/embeddings_with_words.json
git commit -m "Add embeddings with LFS"
git push
vercel

# Option 3: Build locally and deploy dist folder
npm run build
vercel dist
```

## Post-Deployment

After deployment, update the embeddings:
1. Upload the full file to your chosen storage
2. Update the download URL in the setup script
3. Redeploy

The game will work with minimal embeddings but won't have the full word set until you complete this step.