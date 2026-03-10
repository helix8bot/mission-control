# Mission Control Dashboard Architecture

## Design intent
Mobile-first premium dark dashboard aligned to SpawnOS-style visual language: glassy dark cards, clear hierarchy, color-coded health states, and compact at-a-glance decision surfaces.

## Removed
- Accountability chart section removed entirely.
- Deleted route/component: `app/accountability/page.tsx`
- Deleted orphan file: `NEW_ACCOUNTABILITY_CHART.tsx`

## Existing sections kept as-is functionally

### 1) AI token costs and usage
- UI section: top KPI cards
- Data source: `public/data/usage.json`
- Update frequency: every 5 minutes
- Feed / cron: `scripts/update-usage.js`
- Data quality: real

### 2) Team task board
- UI section: `Team task board`
- Data source: `public/data/tasks.json`
- Update frequency: midday check
- Feed / cron: midday check workflow
- Data quality: real

### 3) Top signals / market intel
- UI section: `Top signals / market intel`
- Data source: `public/data/social.json`
- Update frequency: nightly
- Feed / cron: nightly intel workflow
- Data quality: real

## New sections added

### 4) Revenue by brand (daily / weekly / monthly)
- UI section: `Revenue by brand`
- Data source: `public/data/revenue.json`
- Verified source(s):
  - Google Sheet `1l7gSFaZtaN56xDvvUi82CGXjgvD-zx3LTKnvgtN7280`
  - Tab: `Monthly Revenue`
  - Local customer files in `/Users/psimac/.openclaw/workspace/elixser_analysis/*_customers.csv`
- Update frequency: whenever JSON is regenerated; currently static snapshot from verified source pull
- Feed / cron: not yet automated
- Data quality:
  - Elixser: real monthly revenue; daily/weekly derived from verified monthly revenue
  - Parlay: placeholder
  - Amino Mastery: placeholder

### 5) Inventory levels and reorder alerts
- UI section: `Inventory levels & reorder alerts`
- Data source: `public/data/inventory.json`
- Verified source(s):
  - `/Users/psimac/.openclaw/workspace/elixser_analysis/inventory.csv`
  - Google Sheet `Monthly Revenue` tab for Jan/Feb unit velocity
- Update frequency: whenever JSON is regenerated; currently static snapshot
- Feed / cron: not yet automated
- Logic:
  - `daysSupply = stockUnits / avgDailyUnitsLast59Days`
  - alert critical if `< 14 days`
- Data quality: partial real (Elixser stock + Jan/Feb velocity), no Parlay/Amino inventory source connected

### 6) Funnel metrics
- UI section: `Funnel metrics`
- Data source: `public/data/funnels.json`
- Verified source(s):
  - Elixser Feb AOV derived from verified revenue + verified order count
- Update frequency: static until live sources are connected
- Feed / cron: not yet automated
- Data quality:
  - Elixser AOV: real derived metric
  - Conversion rate: placeholder
  - CAC: placeholder
  - Parlay + Amino: placeholder

### 7) Cash position and burn rate
- UI section: `Cash position & burn`
- Data source: `public/data/cash.json`
- Verified source(s): none current enough for live display
- Update frequency: static placeholder
- Feed / cron: not yet automated
- Data quality: placeholder
- Notes:
  - Historical cash references were found in financial analysis, but not shown as live because they are stale.

### 8) Active cron job health status
- UI section: `Cron job health status`
- Data source: `public/data/cron-health.json`
- Verified source(s):
  - `/Users/psimac/.openclaw/workspace/CRON_JOBS.md`
  - `/Users/psimac/.openclaw/workspace/.cron-monitor-state.json`
- Update frequency: static snapshot until automated
- Feed / cron: OpenClaw gateway cron / local state files
- Data quality: real snapshot with one warning state (`Gateway pending executions`)

### 9) Customer count by brand
- UI section: `Customer count by brand`
- Data source: `public/data/customers.json`
- Verified source(s):
  - `/Users/psimac/.openclaw/workspace/elixser_analysis/*_customers.csv`
- Update frequency: static snapshot until automated
- Feed / cron: not yet automated
- Data quality:
  - Elixser: real
  - Parlay: placeholder
  - Amino Mastery: placeholder

### 10) Ad spend vs revenue (ROAS)
- UI section: `Ad spend vs revenue (ROAS)`
- Data source: `public/data/roas.json`
- Verified source(s):
  - Revenue side only for Elixser from Google Sheet
- Update frequency: static until ad source connected
- Feed / cron: not yet automated
- Data quality:
  - Revenue: partial real for Elixser
  - Ad spend: placeholder
  - ROAS: placeholder

## JSON files created
- `public/data/revenue.json`
- `public/data/inventory.json`
- `public/data/funnels.json`
- `public/data/cash.json`
- `public/data/cron-health.json`
- `public/data/customers.json`
- `public/data/roas.json`

## Verified revenue search trail
1. Searched `/Users/psimac/.openclaw/workspace/financial/`
2. Searched `/Users/psimac/.openclaw/workspace/sales/`
3. Queried Google Sheet metadata for `Helix Financial Data`
4. Read `Monthly Revenue` tab
5. Cross-checked customer/order counts with `/Users/psimac/.openclaw/workspace/elixser_analysis/*_customers.csv`

## Verified numbers used
- Elixser revenue:
  - Nov 2025: `$4,593`
  - Dec 2025: `$35,345.5`
  - Jan 2026: `$65,725.2`
  - Feb 2026: `$14,168.9`
- Elixser customers / orders for Feb 2026 from local CSVs:
  - Customers: `44`
  - Orders: `47`
- Elixser Feb AOV (derived): `~$301.47`

## Placeholder policy
Any missing metric is stored as:
- `[PLACEHOLDER — needs real data]`

This is deliberate so the UI cannot silently present fiction as fact.

## Mobile responsiveness
- Primary layout uses `repeat(auto-fit, minmax(...))` and breakpoint collapse to 1 column under tablet widths.
- Explicit `overflow-x: hidden` on page.
- Cards, metric grids, and pills tested for narrow layout compatibility at 375px target viewport.
