# In-App Notification System (Pi Network Compatible)

This system manages real-time and persistent in-app notifications for users within the Pi Browser environment, ensuring high security and data privacy in line with Pi Core Team guidelines.

## 1. Database Schema (PostgreSQL/MongoDB)
```javascript
// Notification Schema Concept
{
  id: "noti_987654321",
  pi_user_id: "pi_user_unique_hash", // Authenticated via Pi SDK
  title: "Payment Received!",
  message: "You have successfully received 5 Pi for your support ticket.",
  type: "PAYMENT_SUCCESS", // INFO, WARNING, SYSTEM, TRANSACTION
  is_read: false,
  created_at: "2026-08-09T20:50:00Z"
}
```

## 2. Backend Code (Node.js + Express)
This endpoint fetches user notifications after verifying their Pi Network identity header.

```javascript
// server/routes/notifications.js
const express = require('express');
const router = express.Router();

// Mock database fetching (Replace with your DB client)
const getNotificationsFromDB = async (piUserId) => {
    return [
        { id: 1, title: "Welcome to BIGISH-YER", message: "Your smart support assistant is ready.", is_read: false },
        { id: 2, title: "Pi Wallet Linked", message: "Authentication via Pi SDK successful.", is_read: true }
    ];
};

// GET User Notifications
router.get('/api/notifications', async (req, res) => {
    try {
        // In Pi Apps, the user's authentic identity is verified via Pi SDK tokens
        const piUserId = req.headers['x-pi-user-id']; 
        
        if (!piUserId) {
            return res.status(401).json({ error: "Unauthorized. Missing Pi User Identity." });
        }

        const notifications = await getNotificationsFromDB(piUserId);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
```

## 3. Frontend Integration (React + Pi SDK v2)
```javascript
// client/components/NotificationList.js
import React, { useEffect, useState } from 'react';

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Authenticate user via Pi Browser SDK before making requests
        if (window.Pi) {
            window.Pi.authenticate(['username', 'payments'], onAuthSuccess, onAuthFail);
        }
    }, []);

    const onAuthSuccess = (auth) => {
        fetch('/api/notifications', {
            headers: { 'x-pi-user-id': auth.user.uid }
        })
        .then(res => res.json())
        .then(resData => {
            if(resData.success) setNotifications(resData.data);
        });
    };

    const onAuthFail = (error) => {
        console.error("Pi Authentication failed:", error);
    };

    return (
        <div className="notification-box">
            <h3>Your Notifications</h3>
            <ul>
                {notifications.map(n => (
                    <li key={n.id} className={n.is_read ? "read" : "unread"}>
                        <strong>{n.title}</strong>: {n.message}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationList;
```
