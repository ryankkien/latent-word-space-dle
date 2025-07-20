import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the full embeddings file
const fullEmbeddingsPath = path.join(__dirname, '../src/data/glove_embeddings_3d_full.json');
const outputPath = path.join(__dirname, '../src/data/embeddings_with_words.json');

// Common English words that should be prioritized
const PRIORITY_WORDS = new Set([
    // Core function words
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    
    // Common nouns
    'man', 'woman', 'person', 'people', 'child', 'children', 'family', 'friend', 'house', 'home', 'car', 'book', 'water', 'food', 'money', 'work', 'job',
    'school', 'student', 'teacher', 'doctor', 'city', 'country', 'world', 'life', 'death', 'love', 'peace', 'war', 'music', 'art', 'science', 'nature',
    'animal', 'plant', 'tree', 'flower', 'mountain', 'river', 'ocean', 'beach', 'forest', 'desert', 'sky', 'sun', 'moon', 'star', 'earth', 'fire', 'air',
    
    // Common verbs
    'see', 'hear', 'feel', 'think', 'know', 'understand', 'remember', 'forget', 'learn', 'teach', 'read', 'write', 'speak', 'listen', 'walk', 'run',
    'eat', 'drink', 'sleep', 'wake', 'open', 'close', 'start', 'stop', 'come', 'go', 'give', 'take', 'put', 'get', 'make', 'do', 'work', 'play',
    'help', 'ask', 'answer', 'tell', 'show', 'look', 'watch', 'find', 'lose', 'win', 'try', 'want', 'need', 'like', 'love', 'hate', 'hope', 'fear',
    
    // Common adjectives
    'good', 'bad', 'big', 'small', 'large', 'little', 'old', 'new', 'young', 'hot', 'cold', 'warm', 'cool', 'fast', 'slow', 'high', 'low', 'long', 'short',
    'happy', 'sad', 'angry', 'excited', 'tired', 'hungry', 'thirsty', 'sick', 'healthy', 'strong', 'weak', 'smart', 'stupid', 'beautiful', 'ugly',
    'easy', 'hard', 'simple', 'difficult', 'important', 'interesting', 'boring', 'funny', 'serious', 'safe', 'dangerous', 'free', 'expensive', 'cheap',
    
    // Colors
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey',
    
    // Numbers
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand', 'million',
    
    // Animals
    'cat', 'dog', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'chicken', 'mouse', 'rat', 'lion', 'tiger', 'bear', 'elephant', 'monkey', 'rabbit',
    
    // Food
    'apple', 'banana', 'orange', 'bread', 'milk', 'cheese', 'meat', 'chicken', 'fish', 'rice', 'pasta', 'pizza', 'cake', 'chocolate', 'coffee', 'tea',
    
    // Body parts
    'head', 'face', 'eye', 'eyes', 'nose', 'mouth', 'ear', 'ears', 'hair', 'hand', 'hands', 'finger', 'foot', 'feet', 'leg', 'legs', 'arm', 'arms',
    
    // Technology
    'computer', 'phone', 'internet', 'email', 'game', 'music', 'video', 'camera', 'television', 'radio', 'machine',
    
    // Places
    'store', 'shop', 'restaurant', 'hotel', 'hospital', 'airport', 'station', 'park', 'street', 'road', 'bridge', 'building',
    
    // Time
    'today', 'yesterday', 'tomorrow', 'morning', 'afternoon', 'evening', 'night', 'day', 'week', 'month', 'year', 'hour', 'minute', 'second',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'
]);

function isValidWord(word) {
    // Filter out words that are likely not useful for the game
    if (word.length < 2 || word.length > 15) return false;
    if (!word.match(/^[a-z]+$/)) return false; // Only lowercase letters
    if (word.includes('_') || word.includes('-')) return false;
    
    // Filter out very technical or obscure words
    const technicalPrefixes = ['bio', 'geo', 'neo', 'proto', 'pseudo', 'semi', 'anti', 'pre', 'post', 'non'];
    const technicalSuffixes = ['ology', 'ism', 'ist', 'tion', 'sion', 'ness', 'ment', 'able', 'ible'];
    
    // Allow some technical words but not overly complex ones
    if (word.length > 10) {
        const hasTechnicalAffix = technicalPrefixes.some(prefix => word.startsWith(prefix)) ||
                                  technicalSuffixes.some(suffix => word.endsWith(suffix));
        if (hasTechnicalAffix) return false;
    }
    
    return true;
}

function scoreWord(word) {
    let score = 0;
    
    // Priority words get highest score
    if (PRIORITY_WORDS.has(word)) {
        score += 1000;
    }
    
    // Prefer shorter, more common words
    if (word.length <= 5) score += 100;
    else if (word.length <= 7) score += 50;
    else if (word.length <= 10) score += 10;
    
    // Boost common word patterns
    const commonEndings = ['ing', 'ed', 'er', 'ly', 'tion', 'ness'];
    if (commonEndings.some(ending => word.endsWith(ending))) {
        score += 20;
    }
    
    // Vowel distribution (words with good vowel distribution are often more "real")
    const vowels = (word.match(/[aeiou]/g) || []).length;
    const vowelRatio = vowels / word.length;
    if (vowelRatio >= 0.2 && vowelRatio <= 0.6) {
        score += 30;
    }
    
    return score;
}

async function createCompactEmbeddings() {
    console.log('📥 Loading full embeddings file...');
    
    if (!fs.existsSync(fullEmbeddingsPath)) {
        console.error(`❌ Full embeddings file not found at ${fullEmbeddingsPath}`);
        console.log('Please make sure you have the full GloVe embeddings file.');
        return;
    }
    
    const fullEmbeddings = JSON.parse(fs.readFileSync(fullEmbeddingsPath, 'utf8'));
    console.log(`📊 Loaded ${fullEmbeddings.length} word embeddings`);
    
    console.log('🔍 Filtering and scoring words...');
    
    // Filter and score words
    const validEmbeddings = fullEmbeddings
        .filter(embedding => isValidWord(embedding.word))
        .map(embedding => ({
            ...embedding,
            score: scoreWord(embedding.word)
        }))
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, 20000) // Take top 20,000
        .map(embedding => {
            // Remove the score field from final output
            const { score, ...rest } = embedding;
            return rest;
        });
    
    console.log('💾 Saving compact embeddings...');
    fs.writeFileSync(outputPath, JSON.stringify(validEmbeddings, null, 0));
    
    // Check file sizes
    const originalStats = fs.statSync(fullEmbeddingsPath);
    const newStats = fs.statSync(outputPath);
    const originalSize = originalStats.size / (1024 * 1024); // MB
    const newSize = newStats.size / (1024 * 1024); // MB
    
    console.log('✅ Created compact embeddings file!');
    console.log(`📊 Original size: ${originalSize.toFixed(1)} MB`);
    console.log(`📊 New size: ${newSize.toFixed(1)} MB`);
    console.log(`📊 Reduction: ${((originalSize - newSize) / originalSize * 100).toFixed(1)}%`);
    console.log(`📊 Words included: ${validEmbeddings.length}`);
    
    // Show some sample words
    const sampleWords = validEmbeddings.slice(0, 20).map(emb => emb.word);
    console.log(`📝 Sample words: ${sampleWords.join(', ')}`);
    
    // Show priority words included
    const priorityIncluded = validEmbeddings
        .filter(emb => PRIORITY_WORDS.has(emb.word))
        .length;
    console.log(`🎯 Priority words included: ${priorityIncluded}/${PRIORITY_WORDS.size}`);
}

createCompactEmbeddings().catch(console.error);