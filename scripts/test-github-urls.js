#!/usr/bin/env node

import https from 'https';
import http from 'http';

const REPO_OWNER = 'ryankkien';
const REPO_NAME = 'latent-word-space-dle';

// Test URLs to try
const testUrls = [
  // Direct download URLs with the actual tag
  `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/full1/realWordEmbeddings.json`,
  `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/full1/realWordEmbeddings.ts`,
  `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/full1/real-word-embeddings.json`,
  
  // GitHub API endpoints
  `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`,
  `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`,
  `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/full1`,
  
  // Raw content URLs (alternative approach)
  `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/full1/src/data/realWordEmbeddings.ts`,
  `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/data/realWordEmbeddings.ts`,
];

// Function to test a URL
async function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    console.log(`\nTesting: ${url}`);
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js Script',
        'Accept': url.includes('api.github.com') ? 'application/vnd.github.v3+json' : '*/*'
      }
    };
    
    const req = protocol.request(url, options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('SUCCESS!');
          
          // For API endpoints, parse and show release info
          if (url.includes('api.github.com')) {
            try {
              const json = JSON.parse(data);
              
              if (Array.isArray(json)) {
                console.log(`Found ${json.length} releases:`);
                json.forEach(release => {
                  console.log(`  - Tag: ${release.tag_name}, Name: ${release.name}`);
                  if (release.assets && release.assets.length > 0) {
                    console.log(`    Assets:`);
                    release.assets.forEach(asset => {
                      console.log(`      - ${asset.name}: ${asset.browser_download_url}`);
                    });
                  }
                });
              } else {
                console.log(`Release tag: ${json.tag_name}`);
                console.log(`Release name: ${json.name}`);
                if (json.assets && json.assets.length > 0) {
                  console.log(`Assets:`);
                  json.assets.forEach(asset => {
                    console.log(`  - ${asset.name}: ${asset.browser_download_url}`);
                  });
                }
              }
            } catch (e) {
              console.log('Response preview:', data.substring(0, 200));
            }
          } else {
            // For direct downloads, just show size
            console.log(`Content length: ${data.length} bytes`);
          }
        } else if (res.statusCode === 301 || res.statusCode === 302) {
          console.log(`Redirect to: ${res.headers.location}`);
        } else {
          console.log('Failed - Response preview:', data.substring(0, 200));
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`Error: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Testing GitHub URLs for word embeddings file...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  console.log('\n\nTest complete!');
}

runTests();