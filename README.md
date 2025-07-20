# LatentLetters - Daily Word Puzzles 🧠

A daily word puzzle game where players place words in semantic space based on their meaning, powered by GloVe word embeddings.

## 🎮 Game Features

- **5 Daily Puzzles**: New challenges every day at midnight
- **Semantic Word Placement**: Place words based on meaning, not spelling
- **Visual Feedback**: See how close your guess was with distance metrics
- **Streak Counter**: Track consecutive days played
- **Share Results**: Share your daily performance with friends
- **Educational**: Learn about AI and word embeddings

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/latent-letters.git
cd latent-letters

# Install dependencies
npm install

# Set up environment (for local development only)
cp .env.example .env
# Add your OpenAI API key to .env if generating new puzzles

# Start development server
npm run dev
```

## 📦 Deployment

### Pre-deployment Checklist
- [ ] Generate puzzles for 60+ days (see GENERATE_PUZZLES_INSTRUCTIONS.md)
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Remove API keys from `.env` before committing
- [ ] Handle large embeddings file (see DEPLOYMENT_GUIDE.md)

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts
```

### Deploy to Netlify
1. Push to GitHub (without .env file)
2. Connect repository to Netlify
3. Deploy with default settings

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Word Embeddings**: GloVe 50D vectors reduced to 3D
- **Puzzles**: Pre-generated using OpenAI GPT-4
- **Storage**: Local storage for game state
- **Deployment**: Static site (no backend required)

## 📁 Project Structure

```
latent-letters/
├── src/
│   ├── components/         # React components
│   ├── data/              # Word embeddings and puzzles
│   ├── services/          # Business logic
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript types
├── scripts/               # Build and generation scripts
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🔐 Security

- API keys are only used locally for puzzle generation
- Pre-generated puzzles contain no sensitive data
- All game logic runs client-side
- No user data is collected or stored externally

## 🛠️ Development

### Generate New Puzzles
```bash
# Add OpenAI API key to .env
# Run generation script
node scripts/generatePuzzles.mjs
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Handling large files and deployment
- [Puzzle Generation](./GENERATE_PUZZLES_INSTRUCTIONS.md) - Creating new puzzles
- [AdSense Setup](./ADSENSE_SETUP.md) - Monetization setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- GloVe word embeddings by Stanford NLP
- OpenAI for puzzle generation
- React and Vite communities
