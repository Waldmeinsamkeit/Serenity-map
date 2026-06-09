# Serenity Local Store

This directory contains canvas snapshot data and backups.

## Structure

```
store/
├── canvas-default.json           # Current canvas (122 cards, 137 edges)
├── snapshots/                    # Timestamped backups
├── milestones/                   # Named milestone backups
│   ├── before-improvements.json  # Before 2026-06-09 improvements
│   └── after-improvements.json   # After 2026-06-09 improvements
├── archive/                      # Deprecated pages (reserved)
├── IMPROVEMENTS.md               # Detailed improvement log
└── SUMMARY.md                    # Quick summary
```

## Recent Improvements (2026-06-09)

✅ Added page metadata (3 pages)
✅ Added evidence nodes (8 nodes)
✅ Added risk nodes (5 nodes)
✅ Added next-check nodes (9 nodes)
✅ Standardized tag taxonomy (122 nodes)
✅ Optimized backup strategy

**Result**: Transformed from "node pile" to "verifiable research graph"

See `IMPROVEMENTS.md` and `SUMMARY.md` for details.

## Backup Usage

Use the automated backup script:
```bash
# Timestamped snapshot
node scripts/backup-canvas.mjs

# Named milestone
node scripts/backup-canvas.mjs --milestone="research-phase-1"
```

## Legacy Files (deprecated)
- `canvas-default-before-page2-shenghe.json`
- `canvas-default-before-page3-photoresist.json`

**Note**: Local data is saved via the store API (port 8787).
