# Deployment Decisions - What to Reuse vs. Create New

## ✅ REUSE EXISTING (No Need to Create)

### 1. PostgreSQL Database
**REUSE:** ShadowStack's `ncii-postgres` database
- **Why:** The consolidated `render.yaml` is already configured to use `ncii-postgres`
- **Database Name:** `ncii-postgres` (already exists in Render)
- **Connection:** Auto-configured from `render.yaml` - you don't need to do anything
- **All services share this database** (they use different table names, so no conflicts)

### 2. Neo4j Database
**REUSE:** BlackWire's Neo4j Aura instance
- **Why:** It's already set up and working
- **URI:** `neo4j+s://e4e27046.databases.neo4j.io`
- **Credentials:** Use BlackWire's credentials (already in your list)

## 🆕 CREATE NEW

### 1. Web Service (Required)
**CREATE:** New web service in Render
- **Name:** `darkai-consolidated` (or whatever you want)
- **Type:** Web Service
- **Source:** Your GitHub repository
- **Config:** Uses `render.yaml` automatically

## 📋 Summary

| Resource | Action | Details |
|----------|--------|---------|
| PostgreSQL DB | ✅ REUSE | ShadowStack's `ncii-postgres` (auto-configured) |
| Neo4j | ✅ REUSE | BlackWire's Neo4j Aura instance |
| Web Service | 🆕 CREATE | New service for consolidated app |

## ⚠️ Important Notes

1. **Database Sharing:** All three services (PersonaForge, BlackWire, ShadowStack) will use the same PostgreSQL database (`ncii-postgres`). This is fine because:
   - Each service uses different table names
   - No conflicts or data mixing

2. **Neo4j Sharing:** All services can use the same Neo4j instance. Neo4j handles multiple apps on the same instance.

3. **No Data Loss:** Reusing existing databases means:
   - ShadowStack data stays in `ncii-postgres`
   - BlackWire data stays in `blackwire` database (but won't be used by consolidated app)
   - Consolidated app will use `ncii-postgres` for all services

