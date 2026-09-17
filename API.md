# BIGISH-YER Integration API

## Overview
This API allows partner applications within the Arabian Eagle Ecosystem to process payments through BIGISH-YER.

## Authentication

All integration endpoints require two headers:
- `x-app-id`: Your application ID (e.g., `gav`, `cobra`, `telcom`)
- `x-api-key`: Your secret API key

## Endpoints

### 1. Execute Payment
`POST /api/integration/pay`

**Headers:**
```

Content-Type: application/json
x-app-id: gav
x-api-key: gav-secret-xxxxx

```

**Body:**
```json
{
  "accessToken": "user_pi_access_token",
  "piAmount": 0.5,
  "yerAmount": 50,
  "orderId": "ORDER-12345",
  "memo": "Purchase from GAV"
}
```

Response:

```json
{
  "success": true,
  "transactionId": "int_gav_...",
  "appId": "gav",
  "type": "Hybrid Payment",
  "piAmount": 0.5,
  "yerAmount": 50,
  "newPiBalance": 1.5,
  "newYerBalance": 50
}
```

2. Check Transaction Status

GET /api/integration/status/:txId

Headers: Same as above.

Response:

```json
{
  "success": true,
  "transaction": { ... }
}
```

3. Register Partner App (Admin only)

POST /api/integration/register

Body:

```json
{
  "appId": "newapp",
  "name": "New App Name",
  "adminKey": "ae-admin-2026"
}
```

Response:

```json
{
  "success": true,
  "appId": "newapp",
  "apiKey": "newapp-secret-xxxxx"
}
```

4. List Partner Apps (Admin only)

GET /api/integration/apps

Headers:

```
x-admin-key: ae-admin-2026
```

Integration Flow

1. User authenticates with Pi in your app.
2. Your app sends payment request to BIGISH-YER.
3. BIGISH-YER verifies API key, checks balance, executes payment.
4. BIGISH-YER returns confirmation.
5. Your app delivers the product/service.

Pre-Registered Apps

App ID Name Status
gav GAV Incense Route ✅ Active
cobra COBRA Protocol ✅ Active
telcom Telcom Mobile Protocol ✅ Active

Security Notes

· API keys are secret — never expose them in frontend code.
· All requests must use HTTPS.
· Transaction IDs are unique and traceable.
