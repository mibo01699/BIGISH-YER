# Human Support & Ticketing System

When the Smart AI Support confidence score is low, tickets are seamlessly escalated to human agents without breaking the secure Pi Browser sandbox loop.

## 1. Ticket Data Schema
```javascript
{
  ticket_id: "TKT_123456",
  pi_username: "pi_pioneer_user", // Fetched via Pi.authenticate()
  subject: "Pi Payment unresolved timeout",
  status: "OPEN", // OPEN, IN_PROGRESS, RESOLVED
  priority: "HIGH",
  assigned_agent_id: "agent_007"
}
```

## 2. API Routes for Human Intervention
```javascript
// server/routes/humanSupport.js
const express = require('express');
const router = express.Router();

let activeTickets = [];

// Create Ticket (Escalation)
router.post('/api/support/tickets', (req, res) => {
    const { piUsername, subject, initialMessage } = req.body;

    const newTicket = {
        ticket_id: "TKT_" + Date.now(),
        pi_username: piUsername,
        subject: subject,
        messages: [{ sender: "user", text: initialMessage, time: new Date() }],
        status: "OPEN",
        priority: "HIGH"
    };

    activeTickets.push(newTicket);
    res.status(201).json({ success: true, message: "Ticket escalated to human agents successfully.", ticket: newTicket });
});

// Fetch Tickets for Admin/Agent View
router.get('/api/support/admin/tickets', (req, res) => {
    // secure this route behind admin authorization checks
    res.status(200).json({ success: true, data: activeTickets });
});

module.exports = router;
```
