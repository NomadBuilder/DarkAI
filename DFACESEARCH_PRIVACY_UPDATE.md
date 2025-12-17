# DFaceSearch - Privacy Update

## Problem
Previously, images were uploaded to Imgur (public image hosting), making them publicly accessible and searchable. This was a privacy concern.

## Solution
**Self-hosted temporary image serving** - Images are now served from our own server temporarily, then immediately deleted.

## How It Works Now

### Before (Privacy Issue):
```
User uploads image
    ↓
Upload to Imgur (public hosting)
    ↓
Image publicly accessible forever
    ↓
Use Imgur URL for searches
```

### After (Privacy-Friendly):
```
User uploads image
    ↓
Save to local server: dfacesearch/static/uploads/
    ↓
Serve temporarily via: /dfacesearch/temp/{filename}
    ↓
Use self-hosted URL for searches
    ↓
Delete image immediately after search completes
```

## Privacy Improvements

✅ **No Public Uploads**: Images never leave our server  
✅ **Temporary Access**: Only accessible during search (seconds)  
✅ **Auto-Delete**: Deleted immediately after search completes  
✅ **No-Cache Headers**: Browsers won't cache the temporary images  
✅ **Private URLs**: Only accessible if you know the exact filename  

## Technical Details

### Temporary URL Format
```
http://localhost:5001/dfacesearch/temp/20241209_161530_photo.jpg
```

### Security Features
1. **Filename Validation**: Prevents path traversal (`..`, `/`, `\`)
2. **File Existence Check**: Returns 404 if file already deleted
3. **No-Cache Headers**: Prevents browser caching
4. **Immediate Deletion**: File deleted right after search

### Search Process
1. Image saved locally with timestamped filename
2. Temporary URL generated pointing to our server
3. Reverse image searches use this temporary URL
4. Image deleted immediately after all searches complete
5. URL becomes invalid (404) after deletion

## Limitations

⚠️ **External Search Engines**: 
- Yandex, Google, Bing may need publicly accessible URLs
- If they can't access our self-hosted URL, searches may fail
- **Solution**: Could add fallback to Imgur only if self-hosted fails

⚠️ **Production Deployment**:
- Need to ensure server is publicly accessible for search engines
- Or use a hybrid approach (self-hosted first, Imgur fallback)

## Future Improvements

1. **Hybrid Approach**: Try self-hosted first, fallback to Imgur if needed
2. **Expiring URLs**: Add time-based expiration (e.g., 5 minutes)
3. **Access Logging**: Track who accessed temporary URLs
4. **Image Encryption**: Encrypt images at rest (if storing longer)
5. **IP Whitelist**: Only allow search engines to access temp URLs

## Comparison

| Aspect | Imgur (Old) | Self-Hosted (New) |
|--------|------------|-------------------|
| Privacy | ❌ Public forever | ✅ Private, temporary |
| Deletion | ❌ Manual only | ✅ Auto-delete |
| Control | ❌ External service | ✅ Our server |
| Reliability | ✅ High | ⚠️ Depends on server |
| Search Engine Access | ✅ Always works | ⚠️ May need public IP |

## Current Status

✅ **Implemented**: Self-hosted temporary image serving  
✅ **Implemented**: Auto-deletion after search  
✅ **Implemented**: Security validation  
⚠️ **Testing Needed**: Verify search engines can access self-hosted URLs  

If search engines can't access the self-hosted URLs, we can implement a hybrid approach that tries self-hosted first, then falls back to Imgur only if needed.

