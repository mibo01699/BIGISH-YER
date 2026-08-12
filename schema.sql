-- schema.sql
-- BIGISH-YER: Core Ledger & Financial Inclusion Database Schema
-- Aligned with Pi Network v2.0 Sandbox Protocols & Security Guidelines (2026)
-- Built for PostgreSQL 15+

-- تفعيل إضافات الأمان وحسابات الـ UUID إذا دعت الحاجة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--- 1. جدول توثيق وإدارة حسابات المستخدمين وجلسات التعدين (10% Allocation)
CREATE TABLE IF NOT EXISTS users_mining_ledger (
    id SERIAL PRIMARY KEY,
    pi_user_uid VARCHAR(255) UNIQUE NOT NULL,      -- المعرف الفريد المشفر القادم من Pi.authenticate()
    yer_wallet_address TEXT NOT NULL,              -- عنوان محفظة المستخدم (مخزن كـ Ciphertext مشفر عبر cryptoEngine.js)
    is_mining_active BOOLEAN DEFAULT FALSE,
    base_rate NUMERIC(10, 4) DEFAULT 0.1000,       -- معدل التعدين الأساسي لكل ساعة
    team_bonus_rate NUMERIC(10, 4) DEFAULT 0.0500, -- مكافأة الإحالة والتكامل مع AJYAL/GAV
    last_click_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unclaimed_balance NUMERIC(18, 6) DEFAULT 0.000000, -- الرصيد المتاح للمطالبة والتحويل للمحفظة
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--- 2. جدول تسوية المقاصة والتحويلات الهجينة الموازية (AJYAL <-> GAV)
CREATE TABLE IF NOT EXISTS clearings_and_transfers (
    id SERIAL PRIMARY KEY,
    pi_payment_id VARCHAR(255) UNIQUE NOT NULL,    -- المعرف الفريد للدفع لمنع الإنفاق المزدوج والتكرار
    pi_user_uid VARCHAR(255) NOT NULL,
    encrypted_sender_yer TEXT NOT NULL,            -- محفظة المرسل مشفرة بالكامل لحماية الخصوصية
    encrypted_receiver_pos TEXT NOT NULL,          -- محفظة التاجر/نقطة البيع مشفرة بالكامل
    amount_yer NUMERIC(18, 2) NOT NULL,            -- القيمة المسواة برمز YER الموازي كلياً
    pi_blockchain_txid VARCHAR(255),               -- معرف المعاملة الحقيقي على بلوكشين Pi Mainnet
    settlement_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SETTLED, FAILED_ESCALATED
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- ربط العلاقات لضمان سلامة البيانات ومنع الحسابات الوهمية
    FOREIGN KEY (pi_user_uid) REFERENCES users_mining_ledger(pi_user_uid) ON DELETE RESTRICT
);

--- 3. جدول نظام الإشعارات الداخلية والتنبيهات الفورية (NOTIFICATIONS.md)
CREATE TABLE IF NOT EXISTS system_notifications (
    id SERIAL PRIMARY KEY,
    pi_user_uid VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'INFO',  -- CLEARING_SUCCESS, MINING_ALERT, SYSTEM_WARNING


    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pi_user_uid) REFERENCES users_mining_ledger(pi_user_uid) ON DELETE CASCADE
);

--- 4. فهرسة الجداول (Indexing) لتسريع عمليات البحث عبر الـ API ومنع اختناق السيرفر
CREATE INDEX IF NOT EXISTS idx_mining_user ON users_mining_ledger(pi_user_uid);
CREATE INDEX IF NOT EXISTS idx_clearing_payment ON clearings_and_transfers(pi_payment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON system_notifications(pi_user_uid, is_read);


-- BIGISH-YER & Suppliers Auction - Sovereign Database Schema
-- Architecture Specification: Strict Integer Storage (No Floating Points)
-- Compliance: Pi Network 2026 Registry Rules & UNICEF Digital Public Goods

-- Enable strict execution constraints
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Table for Verified Suppliers & KYB Profile Status (Chained with Pi KYC)
CREATE TABLE IF NOT EXISTS suppliers_kyb_registry (
    supplier_wallet VARCHAR(255) PRIMARY KEY,
    pi_username VARCHAR(150) NOT NULL UNIQUE,
    business_registration_id VARCHAR(100) NOT NULL UNIQUE,
    compliance_level_code BIGINT NOT NULL DEFAULT 1, -- 1=Registered, 2=Kyc Passed, 3=Full KYB Approved
    is_active_lock_status BIGINT NOT NULL DEFAULT 0, -- 0=Unlocked, 1=Locked by AntiDoubleDipping
    registered_at_timestamp BIGINT NOT NULL,
    updated_at_timestamp BIGINT NOT NULL
);

-- 2. Table for Managing Hybrid Core Wallets (10 Decimals YER, 7 Decimals Pi)
CREATE TABLE IF NOT EXISTS sovereign_balances (
    wallet_address VARCHAR(255) PRIMARY KEY,
    pi_balance_stroops BIGINT NOT NULL DEFAULT 0, -- Stored as pure Integer (Scaled by 10^7)
    yer_balance_subunits BIGINT NOT NULL DEFAULT 0, -- Sovereign Local Currency (Scaled by 10^10)
    last_clearing_timestamp BIGINT NOT NULL
);

-- 3. Table for Suppliers Procurement Auctions Settlement Logs
CREATE TABLE IF NOT EXISTS hybrid_auction_settlements (
    auction_id VARCHAR(150) PRIMARY KEY,
    vendor_wallet VARCHAR(255) NOT NULL,
    total_nominal_fiat_scaled BIGINT NOT NULL, -- Total value scaled by YER_SCALE (10^10)
    allocated_pi_stroops BIGINT NOT NULL, -- 50% GCV component transferred to Pi Node
    allocated_yer_subunits BIGINT NOT NULL, -- 50% Local DEX component processed via batch-transfer
    dex_rate_snapshot BIGINT NOT NULL, -- The instant DEX price ratio at execution time
    clearing_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, AUTHORIZED, SETTLED, FAILED
    settled_at_timestamp BIGINT NOT NULL,
    FOREIGN KEY (vendor_wallet) REFERENCES suppliers_kyb_registry(supplier_wallet)
);

-- 4. Table for Replit DEX Liquidity Pool State Cache
CREATE TABLE IF NOT EXISTS dex_liquidity_pool_state (
    pool_pair_id VARCHAR(50) PRIMARY KEY, -- Default 'Pi/YER'
    reserve_pi_stroops BIGINT NOT NULL,
    reserve_yer_subunits BIGINT NOT NULL,
    last_update_timestamp BIGINT NOT NULL
);

-- Initializing the sovereign liquidity pool with core reserve values
INSERT INTO dex_liquidity_pool_state (pool_pair_id, reserve_pi_stroops, reserve_yer_subunits, last_update_timestamp)
VALUES ('Pi/YER', 5000000000000, 10000000000000000000, 1771120000000)
ON DUPLICATE KEY UPDATE last_update_timestamp = VALUES(last_update_timestamp);


