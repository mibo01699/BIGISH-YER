-- schema.sql for BIGISH-YER (Yemen Clearing & Stabilization Core Node)
-- PostgreSQL 15+ compliant, using BIGINT for monetary values with fixed decimals.

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers KYB registry
CREATE TABLE IF NOT EXISTS suppliers_kyb_registry (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    business_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    kyb_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clearings and transfers
CREATE TABLE IF NOT EXISTS clearings_and_transfers (
    id BIGSERIAL PRIMARY KEY,
    transaction_id UUID DEFAULT gen_random_uuid() UNIQUE,
    from_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    to_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    supplier_kyb_id BIGINT REFERENCES suppliers_kyb_registry(id) ON DELETE SET NULL,
    amount_pi_stroops BIGINT NOT NULL CHECK (amount_pi_stroops >= 0), -- 10^7 stroops per Pi
    amount_yer_subunits BIGINT NOT NULL CHECK (amount_yer_subunits >= 0), -- 10^10 subunits per YER
    transaction_type VARCHAR(50) NOT NULL, -- 'clearing', 'transfer', 'swap', etc.
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    description TEXT,
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users mining ledger
CREATE TABLE IF NOT EXISTS users_mining_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    pi_mined_stroops BIGINT NOT NULL DEFAULT 0 CHECK (pi_mined_stroops >= 0),
    yer_earned_subunits BIGINT NOT NULL DEFAULT 0 CHECK (yer_earned_subunits >= 0),
    clearing_id BIGINT REFERENCES clearings_and_transfers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dex liquidity pool state (single row)
CREATE TABLE IF NOT EXISTS dex_liquidity_pool_state (
    pool_pair_id VARCHAR(50) PRIMARY KEY DEFAULT 'Pi/YER',
    reserve_pi_stroops BIGINT NOT NULL CHECK (reserve_pi_stroops >= 0),
    reserve_yer_subunits BIGINT NOT NULL CHECK (reserve_yer_subunits >= 0),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial pool state with given reserves
INSERT INTO dex_liquidity_pool_state (pool_pair_id, reserve_pi_stroops, reserve_yer_subunits)
VALUES ('Pi/YER', 5000000000000, 10000000000000000000)
ON CONFLICT (pool_pair_id) DO UPDATE SET
    reserve_pi_stroops = EXCLUDED.reserve_pi_stroops,
    reserve_yer_subunits = EXCLUDED.reserve_yer_subunits,
    last_updated = NOW();

-- Indexes for performance
CREATE INDEX idx_clearings_from_user ON clearings_and_transfers(from_user_id);
CREATE INDEX idx_clearings_to_user ON clearings_and_transfers(to_user_id);
CREATE INDEX idx_clearings_status ON clearings_and_transfers(status);
CREATE INDEX idx_clearings_created ON clearings_and_transfers(created_at);
CREATE INDEX idx_mining_user ON users_mining_ledger(user_id);
CREATE INDEX idx_mining_period ON users_mining_ledger(period_start, period_end);
CREATE INDEX idx_suppliers_user ON suppliers_kyb_registry(user_id);