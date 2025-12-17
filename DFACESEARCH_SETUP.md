# DFaceSearch - Isolated Deepfake Image Search Tool

## Overview
DFaceSearch is a completely isolated tool for searching for deepfaked versions of yourself online. It uses:
- **DeepFace** library (free, local) for face detection
- Reverse image search APIs (free/budget options)
- Cross-referencing with ShadowStack domains to flag known NCII sites

## Architecture
- **Isolated Blueprint**: `/dfacesearch` - completely separate from other modules
- **No Dependencies**: Doesn't import from PersonaForge, BlackWire, or ShadowStack
- **Database Access**: Only reads ShadowStack domains for cross-referencing (read-only)

## Features
1. **Face Detection**: Uses DeepFace to verify a face exists in uploaded image
2. **Reverse Image Search**: Searches for similar images online
3. **Domain Flagging**: Cross-references results with ShadowStack domains to flag known NCII sites
4. **Privacy**: Uploaded images are automatically deleted after processing

## Installation

### Required Dependencies
```bash
pip install deepface opencv-python
# Optional: tensorflow (or tensorflow-cpu for lighter install)
# pip install tensorflow  # or tensorflow-cpu
```

### Optional API Keys (for reverse image search)
- **SerpAPI Key**: `SERPAPI_API_KEY` (optional fallback only - 100/month free tier)
- **Imgur Client ID**: `IMGUR_CLIENT_ID` (optional, for better rate limits - free at imgur.com)

**Note**: SerpAPI is only used as a last resort if free methods return < 5 results. Free methods (Yandex, Google, Bing) are used first and have no limits.

## Usage

1. Navigate to `/dfacesearch`
2. Upload an image with a clear face
3. Click "Search for Similar Faces"
4. Results will show:
   - URLs where similar images were found
   - Flagged results (if domain is in ShadowStack list)

## Current Status

✅ **Completed:**
- Blueprint structure and isolation
- Face detection using DeepFace
- UI for image upload
- Domain cross-referencing with ShadowStack
- Privacy (auto-delete uploaded images)

⚠️ **In Progress:**
- Reverse image search implementation (TinEye API ready, SerpAPI needs image hosting)

## Reverse Image Search Options

### Free Solution (Implemented):
1. **Imgur Upload** (FREE)
   - Uploads image to Imgur anonymously (no API key needed)
   - Gets public URL for the image
   - ✅ Implemented

2. **SerpAPI + Imgur** (if SerpAPI key available)
   - Uses Imgur-hosted image URL
   - Searches via Google Lens API
   - ✅ Implemented

### How It Works:
1. User uploads image → saved locally
2. Face detection (DeepFace) → verifies face exists
3. Image uploaded to Imgur → gets public URL (e.g., `https://i.imgur.com/xxxxx.jpg`)
4. Public URL passed to SerpAPI → searches Google Lens
5. Results returned → cross-referenced with ShadowStack domains
6. Local image deleted → privacy maintained

### Cost:
- **Imgur**: FREE (anonymous uploads, or free API key for better limits)
- **SerpAPI**: FREE tier available (100 searches/month)
- **Total**: $0/month for basic usage

## File Structure
```
dfacesearch/
├── __init__.py
├── blueprint.py          # Main Flask blueprint
├── templates/
│   └── dfacesearch_index.html
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── uploads/          # Temporary uploads (auto-deleted)
└── src/                   # Reserved for future modules
```

## Notes
- DeepFace requires TensorFlow (large dependency, ~500MB)
- Consider `tensorflow-cpu` for lighter install
- First run will download face recognition models (~100MB)
- All processing is done locally (privacy-friendly)

