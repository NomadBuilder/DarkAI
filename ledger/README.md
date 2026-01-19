# The Ledger

An interactive, cinematic visualization of Ontario's quiet privatization during the Ford era.

## Development

### Quick Start

```bash
# Install dependencies
npm install

# Start dev server (with build validation)
npm run dev:safe

# Or use the reset script if you encounter issues
npm run dev:reset
```

### Available Scripts

- `npm run dev` - Start dev server (no validation)
- `npm run dev:safe` - Build with validation, then start dev server
- `npm run dev:clean` - Clear cache and start dev server
- `npm run dev:reset` - Kill existing server, clear cache, validate build, then start
- `npm run build` - Build for production
- `npm run build:validate` - Build and validate build artifacts
- `npm run build:static` - Build for static export
- `npm run lint` - Run ESLint
- `npm run process-data` - Process raw data files

### Build Validation

The `build:validate` script checks that all required build artifacts are present:
- `.next` directory exists
- `build-manifest.json` is valid
- Static chunks are generated
- Server app directory exists

This prevents runtime errors from corrupted or incomplete builds.

### Troubleshooting

If you encounter module errors or missing chunks:

1. **Clear the build cache:**
   ```bash
   rm -rf .next
   ```

2. **Rebuild with validation:**
   ```bash
   npm run build:validate
   ```

3. **Use the reset script:**
   ```bash
   npm run dev:reset
   ```

4. **Check for port conflicts:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

## Data Processing

Process raw Ontario Public Accounts data:

```bash
npm run process-data
```

This will:
1. Ingest raw CSV files from `data/raw/`
2. Normalize vendor names
3. Aggregate payments by vendor and year
4. Generate processed JSON files in `data/processed/`
5. Copy files to `public/data/processed/` for Next.js

## Project Structure

```
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── sections/          # Narrative sections
│   └── ...
├── data/
│   ├── raw/               # Raw CSV files
│   └── processed/         # Processed JSON files
├── scripts/               # Data processing scripts
├── store/                 # Zustand state management
└── types/                 # TypeScript type definitions
```

## License

MIT
