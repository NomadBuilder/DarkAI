# DFaceSearch - How It Works

## Overview
DFaceSearch is a tool that helps you find if your face (or someone else's face) has been deepfaked and posted online. It searches the internet for similar images and flags if they appear on known NCII (Non-Consensual Intimate Image) sites.

## Complete Workflow

### Step 1: User Uploads Image
```
User visits /dfacesearch
    ↓
Uploads an image file (PNG, JPG, JPEG, GIF, WEBP)
    ↓
Image saved temporarily to: dfacesearch/static/uploads/
```

**What happens:**
- File validation (size, type)
- Secure filename generation
- Temporary storage

---

### Step 2: Face Detection (DeepFace)
```
Image file path
    ↓
DeepFace.extract_faces()
    ↓
✅ Face detected? → Continue
❌ No face? → Error: "No face detected"
```

**What happens:**
- Uses **DeepFace** library (free, runs locally)
- Detects if a face exists in the image
- Uses OpenCV detector (fast, free)
- **If no face found**: Returns error, deletes image, stops

**Why this step?**
- Prevents wasting API calls on images without faces
- Ensures we're searching for actual people, not objects

---

### Step 2b: Deepfake Detection (Optional Analysis)
```
Face detected
    ↓
Deepfake detection analysis
    ↓
Returns: is_deepfake, confidence, method
```

**What happens:**
- Analyzes image for deepfake indicators
- **Method 1 (if TensorFlow available)**: EfficientNetV2 feature extraction + heuristic analysis
- **Method 2 (fallback)**: Artifact-based detection (compression, edges, color inconsistencies)
- Results included in API response: `deepfake_detection` object

**Detection Methods:**
- **EfficientNetV2**: Uses pre-trained model features, analyzes for anomalies (requires Python 3.12 or earlier + TensorFlow)
- **Artifact Analysis**: Detects compression artifacts, edge inconsistencies, color anomalies (works on any Python version)

**Why this step?**
- Helps identify if uploaded image itself might be a deepfake
- Provides additional context for search results
- Runs automatically in background

**Note:** Detection works even without TensorFlow (uses artifact analysis), but EfficientNetV2 provides higher accuracy when available.

---

### Step 3: Upload to Imgur (Get Public URL)
```
Local image file
    ↓
POST to Imgur API
    ↓
Get public URL: https://i.imgur.com/xxxxx.jpg
```

**What happens:**
- Uploads image to Imgur (free image hosting)
- Uses anonymous upload (no account needed)
- Gets back a public URL that anyone can access
- **Why?** Reverse image search APIs need a public URL, not a local file

**Privacy note:** Image is now publicly accessible on Imgur (temporary)

---

### Step 4: Reverse Image Search (Multiple Free Methods)
```
Public image URL
    ↓
┌─────────────────────────────────────────┐
│  Run ALL searches in parallel          │
├─────────────────────────────────────────┤
│                                         │
│  1. Yandex Images (FREE)               │
│     - Scrapes yandex.com/images        │
│     - Best for facial recognition      │
│     - No limits                         │
│                                         │
│  2. Google Lens (FREE)                 │
│     - Scrapes lens.google.com          │
│     - Largest database                  │
│     - No limits                         │
│                                         │
│  3. Bing Visual Search (FREE)          │
│     - Scrapes bing.com/images          │
│     - Good alternative                 │
│     - No limits                         │
│                                         │
│  4. SerpAPI (FALLBACK ONLY)            │
│     - Official API (100/month free)    │
│     - Only used if < 5 results found  │
│     - Most reliable                    │
│                                         │
└─────────────────────────────────────────┘
    ↓
Combine all results
```

**What happens:**
- Each search method runs independently
- Uses web scraping (BeautifulSoup) to parse HTML
- Extracts URLs where similar images were found
- Combines results from all sources
- Removes duplicates

**Example results:**
```json
[
  {
    "url": "https://example.com/image.jpg",
    "title": "Found on example.com",
    "source_name": "Yandex Images"
  },
  {
    "url": "https://another-site.com/photo.png",
    "title": "Similar image",
    "source_name": "Google Lens"
  }
]
```

---

### Step 5: Cross-Reference with ShadowStack Domains
```
Search results URLs
    ↓
Extract domain from each URL
    ↓
Check if domain in ShadowStack database
    ↓
Flag if match found
```

**What happens:**
- For each result URL, extracts the domain (e.g., `example.com`)
- Queries ShadowStack database: `SELECT domain FROM domains WHERE source ILIKE 'SHADOWSTACK%'`
- If domain matches → flags result as "Known NCII site"
- Adds `flagged: true` and `flag_reason: "Known NCII site"` to result

**Example:**
```json
{
  "url": "https://dangerous-site.com/image.jpg",
  "title": "Found image",
  "flagged": true,
  "flag_reason": "Known NCII site",
  "source_name": "Yandex Images"
}
```

**Why this step?**
- ShadowStack contains 200+ known NCII/deepfake sites
- Helps users identify if their image is on dangerous sites
- Provides context about the threat level

---

### Step 6: Clean Up & Return Results
```
All results collected
    ↓
Delete local image file (privacy)
    ↓
Return JSON response
```

**What happens:**
- Deletes the temporary image file from `uploads/` folder
- Returns JSON with:
  - All results (with flags)
  - Total count
  - Flagged count
  - Success status

**Privacy:**
- Local file deleted ✅
- Image still on Imgur (public) ⚠️
- Future: Could delete from Imgur too (requires API)

---

### Step 7: Display Results in UI
```
JSON response
    ↓
JavaScript renders results
    ↓
Shows:
- Total results found
- Flagged results (red highlight)
- Links to each result
- Source of each result
```

**UI Features:**
- Red highlight for flagged results
- "⚠️ Known NCII Site" badge
- Clickable links to source URLs
- Shows which search engine found each result

---

## Technical Architecture

### Components

1. **Flask Blueprint** (`dfacesearch/blueprint.py`)
   - Handles all routes and logic
   - Completely isolated from other modules

2. **Face Detection** (`deepface` library)
   - Local processing (privacy-friendly)
   - No data sent to external services

3. **Image Hosting** (Imgur API)
   - Free anonymous uploads
   - Gets public URL for search APIs

4. **Reverse Search** (Web Scraping)
   - BeautifulSoup for HTML parsing
   - Multiple sources for redundancy

5. **Domain Database** (PostgreSQL)
   - Reads ShadowStack domains
   - Read-only access

### Data Flow Diagram

```
User Browser
    ↓ (POST /api/search)
Flask Backend
    ↓
1. Save image locally
    ↓
2. DeepFace: Detect face
    ↓
3. Imgur: Upload → Get URL
    ↓
4. Parallel searches:
   - Yandex (scrape)
   - Google (scrape)
   - Bing (scrape)
   - SerpAPI (if needed)
    ↓
5. PostgreSQL: Check ShadowStack domains
    ↓
6. Delete local image
    ↓
7. Return JSON
    ↓
User Browser (displays results)
```

---

## Privacy & Security

### What's Stored:
- ✅ Nothing permanently (local files deleted)
- ⚠️ Image temporarily on Imgur (public URL)

### What's Sent:
- Image → Imgur (for hosting)
- Image URL → Search engines (for reverse search)
- Domain names → ShadowStack database (read-only)

### What's NOT Sent:
- ❌ Face embeddings (stays local)
- ❌ User identity
- ❌ Personal information

---

## Limitations & Considerations

### Current Limitations:
1. **Web Scraping Fragility**
   - If search engines change HTML, parsing may break
   - May need updates if layouts change

2. **Rate Limiting**
   - Free methods may slow down with heavy use
   - Google may block if too many requests

3. **Imgur Privacy**
   - Images are publicly accessible
   - Could add deletion after search completes

4. **Face Detection**
   - Requires clear face in image
   - May fail on low-quality images

### Future Improvements:
- Add image deletion from Imgur after search
- Implement proxy rotation for scraping
- Add Selenium/Playwright for more reliable scraping
- Cache ShadowStack domains to reduce DB queries
- Add user accounts to track search history

---

## Cost Breakdown

| Component | Cost | Limits |
|-----------|------|--------|
| DeepFace | $0 | None |
| Imgur | $0 | None (anonymous) |
| Yandex | $0 | None |
| Google | $0 | None |
| Bing | $0 | None |
| SerpAPI | $0 | 100/month (fallback only) |
| **Total** | **$0/month** | **Unlimited** |

---

## Example Usage

1. User uploads their photo
2. System detects face ✅
3. Uploads to Imgur → `https://i.imgur.com/abc123.jpg`
4. Searches:
   - Yandex finds 5 results
   - Google finds 8 results
   - Bing finds 3 results
5. Checks domains:
   - 2 results from `dangerous-site.com` → **FLAGGED** ⚠️
   - 14 results from other sites → Not flagged
6. Returns:
   - Total: 16 results
   - Flagged: 2 results
   - User sees red highlights on dangerous sites

---

## Key Features

✅ **Free & Unlimited** - No API costs for primary searches  
✅ **Privacy-Focused** - Local face detection, auto-delete files  
✅ **Multi-Source** - Combines 3+ search engines  
✅ **Threat Detection** - Flags known NCII sites  
✅ **Isolated** - Doesn't affect other modules  
✅ **Fast** - Parallel searches, efficient processing  

