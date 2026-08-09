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
