#!/usr/bin/env node

/**
 * Validates that the Next.js build completed successfully
 * Checks for common build errors and missing files
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const nextDir = path.join(projectRoot, '.next');

let hasErrors = false;
const errors = [];

// Check if .next directory exists
if (!fs.existsSync(nextDir)) {
  errors.push('❌ .next directory does not exist. Build may have failed.');
  hasErrors = true;
} else {
  console.log('✓ .next directory exists');
}

// Check for build manifest
const buildManifest = path.join(nextDir, 'build-manifest.json');
if (!fs.existsSync(buildManifest)) {
  errors.push('❌ build-manifest.json not found. Build may be incomplete.');
  hasErrors = true;
} else {
  console.log('✓ build-manifest.json exists');
  
  // Validate manifest structure
  try {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    if (!manifest.pages || Object.keys(manifest.pages).length === 0) {
      errors.push('❌ build-manifest.json is empty or invalid.');
      hasErrors = true;
    } else {
      console.log(`✓ build-manifest.json contains ${Object.keys(manifest.pages).length} pages`);
    }
  } catch (e) {
    errors.push(`❌ Failed to parse build-manifest.json: ${e.message}`);
    hasErrors = true;
  }
}

// Check for static chunks directory
const staticDir = path.join(nextDir, 'static');
if (!fs.existsSync(staticDir)) {
  errors.push('❌ .next/static directory does not exist.');
  hasErrors = true;
} else {
  console.log('✓ .next/static directory exists');
}

// Check for chunks directory
const chunksDir = path.join(staticDir, 'chunks');
if (fs.existsSync(chunksDir)) {
  const chunkFiles = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'));
  if (chunkFiles.length === 0) {
    errors.push('❌ No JavaScript chunks found in .next/static/chunks');
    hasErrors = true;
  } else {
    console.log(`✓ Found ${chunkFiles.length} chunk files`);
    
    // Check for common chunk files
    const requiredChunks = ['framework', 'main', 'webpack'];
    const chunkNames = chunkFiles.map(f => f.replace(/\.js$/, ''));
    const missingChunks = requiredChunks.filter(req => 
      !chunkNames.some(name => name.includes(req))
    );
    
    if (missingChunks.length > 0) {
      errors.push(`⚠️  Missing expected chunks: ${missingChunks.join(', ')}`);
    }
  }
}

// Check for app directory build output
const appDir = path.join(nextDir, 'server', 'app');
if (!fs.existsSync(appDir)) {
  errors.push('❌ .next/server/app directory does not exist.');
  hasErrors = true;
} else {
  console.log('✓ .next/server/app directory exists');
}

// Report results
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ BUILD VALIDATION FAILED\n');
  errors.forEach(err => console.error(err));
  console.error('\nPlease fix the build errors before starting the dev server.');
  process.exit(1);
} else {
  console.log('\n✓ BUILD VALIDATION PASSED\n');
  console.log('All required build artifacts are present.');
  process.exit(0);
}
