# DFaceSearch - Free Reverse Image Search Methods

## Overview
Since SerpAPI only provides 100 searches/month on the free tier, we've implemented **completely free alternatives** with no limits.

## Free Methods Implemented

### 1. **Yandex Images** ✅ (Best for faces)
- **Cost**: FREE
- **Limits**: None (reasonable use)
- **Method**: Web scraping
- **Pros**: 
  - Excellent for facial recognition
  - No API key needed
  - Good results quality
- **Cons**: 
  - Requires HTML parsing (may break if Yandex changes layout)
  - Slightly slower than API

### 2. **Google Lens** ✅
- **Cost**: FREE
- **Limits**: None (reasonable use)
- **Method**: Web scraping
- **Pros**:
  - Largest database
  - Best overall results
- **Cons**:
  - More likely to get blocked/rate-limited
  - Requires HTML parsing
  - May need CAPTCHA handling in future

### 3. **Bing Visual Search** ✅
- **Cost**: FREE
- **Limits**: None
- **Method**: Web scraping
- **Pros**:
  - Good alternative to Google
  - Less likely to block
- **Cons**:
  - Smaller database than Google
  - Requires HTML parsing

### 4. **SerpAPI** (Fallback)
- **Cost**: FREE (100/month), then paid
- **Limits**: 100 searches/month on free tier
- **Method**: Official API
- **Pros**:
  - Most reliable (official API)
  - No parsing needed
- **Cons**:
  - Limited free tier
  - Requires API key

## How It Works

```
User uploads image
    ↓
Face detection (DeepFace) ✅
    ↓
Upload to Imgur → Get public URL (FREE) ✅
    ↓
┌─────────────────────────────────────┐
│  Parallel Free Searches (No Limits!)│
├─────────────────────────────────────┤
│ 1. Yandex Images    (FREE) ✅       │
│ 2. Google Lens      (FREE) ✅       │
│ 3. Bing Visual      (FREE) ✅       │
│ 4. SerpAPI          (100/month) ⚠️  │
└─────────────────────────────────────┘
    ↓
Combine & deduplicate results ✅
    ↓
Cross-reference with ShadowStack ✅
    ↓
Delete local image (privacy) ✅
```

## Cost Breakdown

| Method | Cost | Limits | Reliability |
|--------|------|--------|-------------|
| Yandex | $0 | None | High |
| Google | $0 | None | Medium (may block) |
| Bing | $0 | None | High |
| SerpAPI | $0 (then paid) | 100/month | Very High |
| **Total** | **$0/month** | **Unlimited** | **High** |

## Implementation Details

### Web Scraping Approach
- Uses `requests` + `BeautifulSoup` to parse HTML
- Extracts result URLs from search pages
- Handles redirects and timeouts gracefully
- Removes duplicates across all sources

### Fallback Strategy
1. Try all free methods first (Yandex, Google, Bing)
2. If SerpAPI key available, use as additional source
3. Combine and deduplicate all results
4. Return top matches

## Future Improvements

### If Scraping Gets Blocked:
1. **Rotate User-Agents**: Use different browser signatures
2. **Add Delays**: Rate limiting to avoid detection
3. **Use Selenium/Playwright**: Full browser automation (slower but more reliable)
4. **Proxy Rotation**: Use proxies to avoid IP blocks

### Alternative Free APIs:
1. **Pixabay API**: Free, but limited to their database
2. **Unsplash API**: Free, but limited to their database
3. **Pexels API**: Free, but limited to their database

## Notes

- **Privacy**: All images uploaded to Imgur are temporary and can be deleted
- **Rate Limiting**: Free methods may slow down if used excessively
- **Reliability**: Web scraping is more fragile than APIs, but completely free
- **Results Quality**: Yandex is best for faces, Google is best overall

