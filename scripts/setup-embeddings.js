import fs from 'fs';
import path from 'path';
import https from 'https';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMBEDDINGS_PATH = path.join(__dirname, '../src/data/glove_embeddings_3d_full.json');
const EMBEDDINGS_GZ_PATH = path.join(__dirname, '../src/data/glove_embeddings_3d_full.json.gz');

// Check if embeddings file already exists
if (fs.existsSync(EMBEDDINGS_PATH)) {
  console.log('✅ Embeddings file already exists');
  process.exit(0);
}

console.log('📥 Embeddings file not found. Downloading from cloud storage...');

// Download from GitHub Releases
const DOWNLOAD_URL = 'https://github.com/ryankkien/latent-word-space-dle/releases/download/v1.0.1/glove_embeddings_3d_full.json.gz';

// For now, we'll create a minimal embeddings file for deployment
// You'll need to upload the full file to cloud storage and update the URL above
console.log('📥 Downloading full embeddings from GitHub Releases...');

// Download and decompress the full embeddings file
const downloadFile = (url, destination) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        https.get(response.headers.location, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        });
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }
    }).on('error', (err) => {
      fs.unlink(destination);
      reject(err);
    });
  });
};

const decompressFile = (source, destination) => {
  return new Promise((resolve, reject) => {
    const gzip = zlib.createGunzip();
    const sourceStream = fs.createReadStream(source);
    const destinationStream = fs.createWriteStream(destination);
    
    sourceStream
      .pipe(gzip)
      .pipe(destinationStream)
      .on('finish', resolve)
      .on('error', reject);
  });
};

(async () => {
  try {
    console.log('Downloading embeddings file...');
    await downloadFile(DOWNLOAD_URL, EMBEDDINGS_GZ_PATH);
    
    console.log('Decompressing embeddings file...');
    await decompressFile(EMBEDDINGS_GZ_PATH, EMBEDDINGS_PATH);
    
    console.log('Cleaning up...');
    fs.unlinkSync(EMBEDDINGS_GZ_PATH);
    
    console.log('✅ Embeddings file ready!');
  } catch (error) {
    console.error('❌ Error setting up embeddings:', error);
    process.exit(1);
  }
})();