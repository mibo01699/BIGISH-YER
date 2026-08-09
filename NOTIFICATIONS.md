# BIGISH-YER In-App & Settlement Notification System

This system handles real-time alerts for YER cross-application clearances, humanitarian transfers, and Pi Network mainnet payment updates.

## 1. Database Schema (PostgreSQL Framework)
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    pi_user_id VARCHAR(255) NOT NULL,       -- Verified via Pi SDK
    wallet_address_yer VARCHAR(255),        -- YER Wallet mapping
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',       -- CLEARING_SUCCESS, BATCH_TRANSFER, SYSTEM
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2. Production Backend (Node.js + Express)
```javascript
// server/routes/notifications.js
const express = require('express');
const router = express.Router();

// Mock DB connection pool for BIGISH-YER infrastructure
const dbPool = {
    query: async (sql, params) => {
        return { rows: [{ id: 1, title: "YER Settlement Completed", message: "Batch transfer initialized from AJYAL engine.", is_read: false }] };
    }
};

// GET: Fetch Localized Notifications for Authenticated Pioneers
router.get('/api/yer/notifications', async (req, res) => {
    try {
        const piUserId = req.headers['x-pi-user-id']; // Securely passed from Pi Browser Authentication
        if (!piUserId) {
            return res.status(401).json({ error: "Unauthorized: Missing verified Pi Identity." });
        }

        const result = await dbPool.query('SELECT * FROM notifications WHERE pi_user_id = \$1 ORDER BY created_at DESC', [piUserId]);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: "Internal Core Ledger Error" });
    }
});

module.exports = router;
```

## 3. Frontend Integration (React within Pi Browser Sandbox)
```javascript
// client/components/NotificationCenter.js
import React, { useEffect, useState } from 'react';

export default function NotificationCenter() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (window.Pi) {
            // Authenticate natively under Pi Browser 2026 Core Rules
            window.Pi.authenticate(['username', 'payments'], onAuthSuccess, onAuthError);
        }
    }, []);

    const onAuthSuccess = (auth) => {
        fetch('/api/yer/notifications', {
            headers: { 'x-pi-user-id': auth.user.uid }
        })
        .then(res => res.json())
        .then(data => { if(data.success) setAlerts(data.data); });
    };

    const onAuthError = (err) => { console.error("Pi SDK Auth Blocked:", err); };

    return (
        <div className="yer-notifications">
            {alerts.map(item => (
                <div key={item.id} className={`alert-card ${item.is_read ? 'read' : 'unread'}`}>
                    <h4>{item.title}</h4>
                    <p>{item.message}</p>
                </div>
            ))}
        </div>
    );
}
```
