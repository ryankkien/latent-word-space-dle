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
      console.log(`Download response status: ${response.statusCode}`);
      console.log(`Content-Type: ${response.headers['content-type']}`);
      
      if (response.statusCode === 404) {
        file.close();
        fs.unlink(destination, () => {});
        reject(new Error('File not found in release. Make sure v1.0.1 release exists with glove_embeddings_3d_full.json.gz'));
        return;
      }
      
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        console.log(`Following redirect to: ${response.headers.location}`);
        https.get(response.headers.location, (response) => {
          if (response.statusCode !== 200) {
            file.close();
            fs.unlink(destination, () => {});
            reject(new Error(`Failed to download: ${response.statusCode}`));
            return;
          }
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        });
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(destination, () => {});
        reject(new Error(`Unexpected status code: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(destination, () => {});
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
    console.log('URL:', DOWNLOAD_URL);
    await downloadFile(DOWNLOAD_URL, EMBEDDINGS_GZ_PATH);
    
    // Verify the downloaded file
    const stats = fs.statSync(EMBEDDINGS_GZ_PATH);
    console.log(`Downloaded file size: ${stats.size} bytes`);
    
    // Check if it's a valid gzip file
    const buffer = fs.readFileSync(EMBEDDINGS_GZ_PATH, { length: 10 });
    const isGzip = buffer[0] === 0x1f && buffer[1] === 0x8b;
    
    if (!isGzip) {
      // Check if it's HTML (common when file not found)
      const content = fs.readFileSync(EMBEDDINGS_GZ_PATH, 'utf8').substring(0, 100);
      console.error('Downloaded file is not a gzip file. First 100 chars:', content);
      throw new Error('Downloaded file is not a valid gzip file. The release file may not exist.');
    }
    
    console.log('Decompressing embeddings file...');
    await decompressFile(EMBEDDINGS_GZ_PATH, EMBEDDINGS_PATH);
    
    console.log('Cleaning up...');
    fs.unlinkSync(EMBEDDINGS_GZ_PATH);
    
    console.log('✅ Embeddings file ready!');
  } catch (error) {
    console.error('❌ Error setting up embeddings:', error);
    // Clean up any partial files
    if (fs.existsSync(EMBEDDINGS_GZ_PATH)) {
      fs.unlinkSync(EMBEDDINGS_GZ_PATH);
    }
    process.exit(1);
  }
})();