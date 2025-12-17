# DFaceSearch - Robust Deepfake Detection Approach

## Problem with Original Approach
The original implementation was just **reverse image search**, which has a critical flaw:
- ❌ Only finds **exact or very similar image matches**
- ❌ **Won't catch deepfakes** because they're modified/altered versions
- ❌ A deepfake won't match the original image exactly

## New Robust Approach

### How It Works Now

1. **Extract Face Embedding** (from uploaded image)
   - Uses DeepFace to create a 2622-dimensional vector
   - Captures facial features, not pixel values
   - Works even if image is modified

2. **Reverse Image Search** (find candidate images)
   - Uses Yandex, Google, Bing to find similar images
   - Gets list of candidate URLs

3. **Face Recognition Verification** (CRITICAL STEP)
   - For each candidate image:
     - Download the image
     - Extract face embedding
     - Calculate cosine similarity with source embedding
     - If similarity > 0.6 → **Same person found!**
   - This catches deepfakes that reverse image search would miss

4. **Cross-Reference with ShadowStack**
   - Flag results from known NCII sites

## Why This Is More Robust

### Face Embeddings vs Pixel Matching

**Old (Reverse Image Search):**
```
Original Image → [Pixel Values] → Search for exact match
❌ Deepfake won't match (different pixels)
```

**New (Face Recognition):**
```
Original Image → [Face Embedding Vector] → Compare with candidates
✅ Deepfake will match (same facial features)
```

### Example

**Scenario:** Your photo is deepfaked and posted online

1. **Upload your original photo**
   - Extract embedding: `[0.23, -0.45, 0.12, ...]` (2622 dimensions)

2. **Reverse search finds candidates:**
   - `example.com/deepfake1.jpg` (your face, but modified)
   - `example.com/deepfake2.jpg` (your face, different angle)
   - `example.com/other-person.jpg` (different person)

3. **Face recognition verifies:**
   - `deepfake1.jpg`: Similarity = 0.87 → **MATCH!** ✅
   - `deepfake2.jpg`: Similarity = 0.75 → **MATCH!** ✅
   - `other-person.jpg`: Similarity = 0.32 → No match ❌

4. **Result:** Finds deepfakes even though they don't match exactly!

## Technical Details

### Face Embedding Extraction
```python
embedding = DeepFace.represent(
    img_path=image_path,
    model_name='VGG-Face',  # 2622-dimensional vector
    enforce_detection=False
)
```

### Cosine Similarity Calculation
```python
similarity = cosine_similarity(source_embedding, candidate_embedding)
# Returns value between 0 (different person) and 1 (same person)
```

### Similarity Thresholds
- **High Confidence**: ≥ 0.8 (very likely same person)
- **Medium Confidence**: 0.7 - 0.8 (likely same person)
- **Low Confidence**: 0.6 - 0.7 (possibly same person)
- **No Match**: < 0.6 (different person)

## Advantages

✅ **Catches Deepfakes**: Finds same person even if image is modified  
✅ **Works with Filters**: Handles Instagram filters, edits, etc.  
✅ **Angle Invariant**: Works with different angles/poses  
✅ **Lighting Invariant**: Works in different lighting conditions  
✅ **More Accurate**: Face recognition is more reliable than pixel matching  

## Limitations

⚠️ **Processing Time**: 
- Must download and process each candidate image
- Slower than simple reverse image search
- Could take 10-30 seconds for 20 candidates

⚠️ **False Positives**:
- Similar-looking people might match (low similarity)
- Threshold of 0.6 helps reduce this

⚠️ **No Face in Candidate**:
- If candidate image has no face, it's skipped
- Only processes images with detectable faces

## Performance Optimization

### Current Implementation
- Processes candidates sequentially
- Downloads each image
- Extracts embedding for each

### Future Improvements
1. **Parallel Processing**: Process multiple candidates simultaneously
2. **Caching**: Cache embeddings for previously seen images
3. **Early Exit**: Stop if high-confidence match found
4. **Batch Processing**: Process multiple candidates in one DeepFace call

## Cost

Still **$0/month**:
- DeepFace: Free (local processing)
- Reverse search: Free (web scraping)
- Image downloads: Free (just bandwidth)

## Example Output

```json
{
  "url": "https://dangerous-site.com/deepfake.jpg",
  "title": "Found on dangerous-site.com",
  "face_similarity": 0.87,
  "match_confidence": "High",
  "verified": true,
  "flagged": true,
  "flag_reason": "Known NCII site"
}
```

UI shows:
- **👤 87.0% match (High)** - Face recognition confirmed same person
- **⚠️ Known NCII Site** - Domain is in ShadowStack database

## Summary

**Before**: Just reverse image search (misses deepfakes)  
**After**: Reverse search + Face recognition (catches deepfakes) ✅

This makes DFaceSearch actually useful for finding deepfaked versions of yourself, not just exact image matches.

