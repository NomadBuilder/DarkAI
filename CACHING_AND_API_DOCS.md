# Caching and API Documentation Implementation

## Summary

Implemented two major improvements to ShadowStack:
1. **Enrichment Result Caching** - Avoids redundant API calls and speeds up repeated domain checks
2. **Swagger/OpenAPI Documentation** - Interactive API documentation for all endpoints

## 1. Caching Implementation

### Features
- **In-memory cache** for enrichment results (24-hour TTL by default)
- **Automatic cache checking** before enrichment
- **Cache statistics endpoint** to monitor cache performance
- **Cache clearing endpoint** for manual cache management

### Files Created/Modified

#### New Files:
- `shadowstack/src/utils/__init__.py` - Utils package init
- `shadowstack/src/utils/config.py` - Configuration management
- `shadowstack/src/utils/cache.py` - Caching utilities

#### Modified Files:
- `shadowstack/src/enrichment/enrichment_pipeline.py` - Added cache check/save logic
- `shadowstack/blueprint.py` - Added cache stats and clear endpoints

### How It Works

1. **Before enrichment**: The `enrich_domain()` function checks the cache first
2. **Cache hit**: Returns cached data immediately (marked with `_cached: true`)
3. **Cache miss**: Performs full enrichment, then caches the result
4. **TTL**: Results are cached for 24 hours by default (configurable via `CACHE_TTL_HOURS`)

### Configuration

Environment variables:
- `CACHE_ENABLED=true` (default: true) - Enable/disable caching
- `CACHE_TTL_HOURS=24` (default: 24) - Cache time-to-live in hours

### API Endpoints

#### GET `/shadowstack/api/cache/stats`
Get cache statistics:
```json
{
  "enabled": true,
  "total_entries": 10,
  "valid_entries": 8,
  "expired_entries": 2,
  "ttl_hours": 24
}
```

#### POST `/shadowstack/api/cache/clear`
Clear the cache (optional body to clear specific entity type):
```json
{
  "entity_type": "domain"  // Optional
}
```

### Benefits

- **Faster responses**: Cached results return instantly
- **Reduced API costs**: Avoids redundant external API calls
- **Better performance**: 30-60 second enrichment reduced to <1 second for cached domains
- **Rate limit protection**: Reduces risk of hitting API rate limits

## 2. Swagger/OpenAPI Documentation

### Features
- **Interactive API documentation** at `/shadowstack/api-docs`
- **OpenAPI 3.0 spec** at `/shadowstack/static/api-docs.yaml`
- **All endpoints documented** with request/response schemas
- **Try it out** functionality (when Swagger UI is installed)

### Files Created

- `shadowstack/static/api-docs.yaml` - OpenAPI 3.0 specification
- Updated `shadowstack/blueprint.py` - Added `/api-docs` route

### Documentation Includes

- **POST /api/check** - Check/enrich a domain (cached)
- **POST /api/enrich** - Enrich and store a domain
- **GET /api/domains** - Get all domains
- **GET /api/graph** - Get graph data
- **GET /api/stats** - Get statistics
- **GET /api/cache/stats** - Get cache statistics
- **POST /api/cache/clear** - Clear cache

### Accessing Documentation

1. **Interactive UI**: Visit `https://darkai.ca/shadowstack/api-docs`
2. **OpenAPI Spec**: Visit `https://darkai.ca/shadowstack/static/api-docs.yaml`
3. **JSON fallback**: Visit `/shadowstack/api/docs` for a simple JSON view

### Dependencies

Added to `requirements.txt`:
- `flask-swagger-ui==4.11.1` - For interactive Swagger UI (optional)

Note: The documentation works even without flask-swagger-ui installed (shows JSON view).

## Testing

### Test Cache Locally

```bash
# Test cache import
python3 -c "
import sys
sys.path.insert(0, 'shadowstack')
from src.utils.cache import get_cached, set_cached, get_cache_stats
stats = get_cache_stats()
print(f'Cache enabled: {stats.get(\"enabled\")}')
"
```

### Test Enrichment with Caching

1. First request: Takes 30-60 seconds (full enrichment)
2. Second request: Returns instantly (from cache)
3. Check cache stats: `GET /shadowstack/api/cache/stats`

## Deployment Notes

1. **No database changes required** - Cache is in-memory
2. **Environment variables** - Set `CACHE_ENABLED` and `CACHE_TTL_HOURS` if needed
3. **Cache is per-instance** - Each Render instance has its own cache (not shared)
4. **Cache clears on restart** - In-memory cache doesn't persist

## Future Enhancements

- **Redis cache**: Replace in-memory cache with Redis for shared cache across instances
- **Cache persistence**: Save cache to database for persistence across restarts
- **Cache warming**: Pre-populate cache for frequently accessed domains
- **Cache invalidation**: Smart cache invalidation based on domain changes

## Files Changed

- ✅ `requirements.txt` - Added flask-swagger-ui
- ✅ `shadowstack/src/utils/__init__.py` - Created
- ✅ `shadowstack/src/utils/config.py` - Created
- ✅ `shadowstack/src/utils/cache.py` - Created
- ✅ `shadowstack/src/enrichment/enrichment_pipeline.py` - Added caching
- ✅ `shadowstack/blueprint.py` - Added cache endpoints and API docs
- ✅ `shadowstack/static/api-docs.yaml` - Created OpenAPI spec

