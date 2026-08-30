# BIGISH-YER In-App & Settlement Notification System

This system handles real-time alerts for YER cross-application clearances, humanitarian transfers, and supported adapter payment updates. All operations are designed for **Sandbox/Testnet-first validation**.

## 1. Database Schema (PostgreSQL Framework)
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,          -- Internal user ID (via supported adapter)
    wallet_address_yer VARCHAR(255),        -- YER Wallet mapping
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',        -- CLEARING_SUCCESS, BATCH_TRANSFER, SYSTEM
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. Production Backend (Node.js + Express)

```javascript
// routes/notifications.js (Sandbox)
const express = require('express');
const router = express.Router();

// Mock DB connection pool for BIGISH-YER infrastructure (Sandbox)
const dbPool = {
    query: async (sql, params) => {
        // Mock response for Sandbox testing
        return { rows: [{ id: 1, title: "YER Settlement Completed", message: "Batch transfer initialized from AJYAL engine.", is_read: false }] };
    }
};

// GET: Fetch Localized Notifications for Authenticated Users
router.get('/api/yer/notifications', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Internal user ID (not Pi-specific)
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing user identity." });
        }

        const result = await dbPool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: "Internal Core Ledger Error" });
    }
});

module.exports = router;
```

3. Frontend Integration (React within Sandbox Environment)

```javascript
// client/components/NotificationCenter.js
import React, { useEffect, useState } from 'react';

export default function NotificationCenter() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Sandbox authentication (no Pi SDK used)
        const mockUserId = "sandbox_user_123";
        fetch('/api/yer/notifications', {
            headers: { 'x-user-id': mockUserId }
        })
        .then(res => res.json())
        .then(data => { if(data.success) setAlerts(data.data); })
        .catch(err => console.error("Notification Fetch Error:", err));
    }, []);

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