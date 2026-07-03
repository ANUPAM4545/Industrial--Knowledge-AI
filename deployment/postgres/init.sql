-- ═══════════════════════════════════════════════════════════════
-- ForgeMind AI — PostgreSQL Initialization
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'UTC';

-- ─── Schemas ──────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS forgemind;

-- ─── Roles ────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'forgemind_app') THEN
        CREATE ROLE forgemind_app LOGIN PASSWORD 'forgemind_secure_password';
    END IF;
END $$;

GRANT ALL PRIVILEGES ON DATABASE forgemind_db TO forgemind;
GRANT USAGE ON SCHEMA public TO forgemind;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO forgemind;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO forgemind;

-- ─── Comments ─────────────────────────────────────────────────
COMMENT ON DATABASE forgemind_db IS 'ForgeMind AI — Industrial Knowledge Intelligence Platform';
