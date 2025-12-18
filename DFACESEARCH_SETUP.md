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
2. **Deepfake Detection**: Analyzes images for deepfake indicators using EfficientNetV2 (ML-based) or artifact analysis (fallback)
3. **Reverse Image Search**: Searches for similar images online
4. **Domain Flagging**: Cross-references results with ShadowStack domains to flag known NCII sites
5. **Privacy**: Uploaded images are automatically deleted after processing

## Installation

### Required Dependencies
```bash
pip install deepface opencv-python numpy Pillow
# Optional: tensorflow (or tensorflow-cpu for lighter install)
# pip install tensorflow  # or tensorflow-cpu
```

### Deepfake Detection Dependencies

**Artifact-Based Detection (Always Available):**
- ✅ `opencv-python` - Image processing
- ✅ `numpy` - Numerical analysis
- ✅ `Pillow` - Image handling
- **Works on any Python version**

**EfficientNetV2 Detection (Enhanced Accuracy):**
- ✅ `tensorflow>=2.13.0` - Machine learning framework
- ✅ `keras-efficientnet-v2` (optional) - Pre-trained EfficientNetV2 models
- ⚠️ **Requires Python 3.12 or earlier** (TensorFlow doesn't support Python 3.13+ yet)
- **Falls back to artifact-based detection if TensorFlow unavailable**

**Note:** The code automatically uses the best available method. Artifact-based detection works without TensorFlow, but EfficientNetV2 provides higher accuracy when available.

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

## Deepfake Detection

DFaceSearch includes built-in deepfake detection that analyzes uploaded images for signs of manipulation:

### Detection Methods (Priority Order):

1. **EfficientNetV2 (ML-Based)** - Highest accuracy
   - Uses pre-trained EfficientNetV2 model for feature extraction
   - Analyzes high-level image features for deepfake indicators
   - Requires: Python 3.12 or earlier + TensorFlow
   - Automatically enabled if dependencies available

2. **Artifact Analysis (Fallback)** - Always available
   - Detects compression artifacts, edge inconsistencies, color anomalies
   - Works on any Python version
   - No TensorFlow required
   - Less accurate than ML-based but still functional

### Python Version Compatibility:

- **Python 3.12 or earlier**: Full support (EfficientNetV2 + artifact analysis)
- **Python 3.13+**: Artifact-based detection only (TensorFlow not yet supported)
- **Production (Render)**: Typically uses Python 3.12, so EfficientNetV2 will work automatically

The detection runs automatically during image upload and results are included in the API response.

