# Local Testing Guide

## Quick Start

```bash
cd DarkAI-consolidated
pip install -r requirements.txt
PORT=5001 python app.py
```

Then visit:
- http://localhost:5001/ - Dark-AI homepage
- http://localhost:5001/personaforge - PersonaForge
- http://localhost:5001/blackwire - BlackWire
- http://localhost:5001/shadowstack - ShadowStack

## Database Configuration

### For Local Testing (Optional)

If you want to test with databases, you can:

1. **Use Docker Compose** (if you have docker-compose files):
   ```bash
   docker-compose up -d
   ```

2. **Set Environment Variables**:
   ```bash
   export POSTGRES_HOST=localhost
   export POSTGRES_PORT=5432
   export POSTGRES_USER=personaforge_user
   export POSTGRES_PASSWORD=your_password
   export POSTGRES_DB=personaforge
   
   # For BlackWire (prefixed)
   export BLACKWIRE_POSTGRES_HOST=localhost
   export BLACKWIRE_POSTGRES_PORT=5432
   export BLACKWIRE_POSTGRES_USER=blackwire_user
   export BLACKWIRE_POSTGRES_PASSWORD=your_password
   export BLACKWIRE_POSTGRES_DB=blackwire
   
   # For ShadowStack (prefixed)
   export SHADOWSTACK_POSTGRES_HOST=localhost
   export SHADOWSTACK_POSTGRES_PORT=5432
   export SHADOWSTACK_POSTGRES_USER=shadowstack_user
   export SHADOWSTACK_POSTGRES_PASSWORD=your_password
   export SHADOWSTACK_POSTGRES_DB=shadowstack
   ```

### Database Client Updates

✅ **Updated**: Both BlackWire and ShadowStack database clients now support:
- Prefixed environment variables (for consolidated app): `BLACKWIRE_POSTGRES_*`, `SHADOWSTACK_POSTGRES_*`
- Standard environment variables (for backward compatibility): `POSTGRES_*`

The clients will check for prefixed variables first, then fall back to standard ones.

## Testing Checklist

- [ ] App starts without errors
- [ ] Homepage loads at `/`
- [ ] PersonaForge loads at `/personaforge`
- [ ] BlackWire loads at `/blackwire`
- [ ] ShadowStack loads at `/shadowstack`
- [ ] Navigation links work correctly
- [ ] Static files load (CSS, JS, images)
- [ ] API endpoints respond (if databases are configured)

## Common Issues

### Port Already in Use
```bash
# Use a different port
PORT=5001 python app.py
```

### Import Errors
- Make sure you're in the `DarkAI-consolidated` directory
- Check that all dependencies are installed: `pip install -r requirements.txt`

### Database Connection Errors
- Databases are optional - the app will work without them
- Check that environment variables are set correctly
- For local testing, you can skip database setup

## Next Steps After Testing

1. Verify all routes work
2. Test with actual databases if needed
3. Deploy to Render.com
4. Configure custom domain `darkai.ca`

