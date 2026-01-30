# The Ledger — Project Status

## ✅ Completed

### Project Structure
- ✅ Next.js 14 with TypeScript
- ✅ Tailwind CSS for styling
- ✅ Static export configuration
- ✅ Type definitions for all data structures

### Core Components
- ✅ `ScrollyContainer` — Main scroll narrative container
- ✅ `LedgerCanvas` — D3/Canvas visualization with force simulation
- ✅ `YearController` — Year display synchronized with scroll
- ✅ `LensController` — Active lens indicator
- ✅ `ReceiptsToggle` — Toggle receipts mode on/off
- ✅ `ReceiptOverlay` — Full-screen receipts view
- ✅ `VendorCard` — Detailed vendor payment information
- ✅ `MethodologyDrawer` — Methodology and data source documentation

### Narrative Sections
- ✅ `SectionColdOpen` — "This is how it's supposed to work"
- ✅ `SectionDrift` — Year progression with unease
- ✅ `SectionLedger` — Core visualization section
- ✅ `SectionNaming` — "These are private, for-profit providers"
- ✅ `SectionLenses` — Focused views (staffing, consulting, healthcare)
- ✅ `SectionLoss` — Emotional peak statements
- ✅ `SectionReceipts` — Receipts mode introduction
- ✅ `SectionEnding` — Final facts

### Data Pipeline
- ✅ Python processing script (`scripts/process_data.py`)
- ✅ Vendor name normalization
- ✅ Payment aggregation by year/vendor/ministry
- ✅ System composition calculation
- ✅ Lens dataset generation
- ✅ Automatic copy to `/public/data/processed/` for Next.js

### State Management
- ✅ Zustand store for global state
- ✅ Current year tracking
- ✅ Receipts mode toggle
- ✅ Active lens selection
- ✅ Scroll progress tracking
- ✅ Selected vendor for receipts

### Styling & Design
- ✅ Emotional typography scale
- ✅ Color system (public/non-profit/for-profit)
- ✅ Smooth scroll behavior
- ✅ Canvas overlay positioning
- ✅ Responsive design foundation

### Documentation
- ✅ `README.md` — Project overview
- ✅ `SETUP.md` — Detailed setup instructions
- ✅ `VENDOR_CLASSIFICATION.md` — Classification rubric
- ✅ Methodology drawer content

## 🚧 Next Steps (Manual)

### Phase 1: Data Ingestion
1. **Obtain Ontario Public Accounts data**
   - Download CSV files for fiscal years 2014-2024
   - Place in `/data/raw/` directory

2. **Run data processing**
   ```bash
   npm run process-data
   ```

3. **Classify vendors**
   - Open `/data/processed/vendors_master.json`
   - Classify top ~200 vendors using `VENDOR_CLASSIFICATION.md`
   - Update `vendor_type`, `service_category`, `confidence`, `evidence_note`
   - Re-run processing script

### Phase 2: Visualization Refinement
1. **Test with real data**
   - Verify visualization renders correctly
   - Check performance with actual vendor counts
   - Adjust force simulation parameters if needed

2. **Refine visual encoding**
   - Adjust node sizes based on actual payment distribution
   - Fine-tune color opacity and contrast
   - Test receipts mode interaction

3. **Optimize performance**
   - Consider WebGL for >1000 entities
   - Implement viewport culling if needed
   - Add loading states

### Phase 3: Narrative Polish
1. **Copy refinement**
   - Review all section copy
   - Ensure emotional beats align with data
   - Add specific examples where data supports it

2. **Lens content**
   - Update `copy_angle` in lens JSON files
   - Add specific vendor examples in lens sections
   - Create compelling narratives for each lens

3. **Methodology**
   - Add links to source data
   - Include data download dates
   - Add any additional disclaimers

### Phase 4: Testing & Launch
1. **Cross-browser testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile responsiveness
   - Performance on slower devices

2. **Accessibility**
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast verification

3. **Share preparation**
   - Generate screenshot frames
   - Create social media previews
   - Prepare press-ready materials

## 📋 Technical Notes

### Data Flow
1. Raw CSVs → `/data/raw/`
2. Processing → `/data/processed/` + `/public/data/processed/`
3. Next.js serves from `/public/data/processed/`
4. Components load via `fetch('/data/processed/...')`

### Performance Considerations
- Canvas rendering for >1k entities
- Force simulation runs to completion (not continuous)
- Pre-aggregated data (no runtime calculations)
- Lazy loading for lens datasets

### Known Limitations
- Canvas click detection requires receipts mode
- Force simulation runs once per year change (could be optimized)
- Vendor classification is manual (top ~200 only)
- Static data snapshot (no real-time updates)

## 🎯 Success Criteria

- [ ] Visualization clearly shows privatization (Americanization) drift
- [ ] Emotional narrative resonates
- [ ] Receipts mode provides credible proof
- [ ] Methodology withstands scrutiny
- [ ] Performance is smooth on standard hardware
- [ ] Mobile experience is functional
- [ ] Screenshots circulate without explanation needed
