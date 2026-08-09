# BIGISH-YER: Production Deployment & Infrastructure Guide

This document outlines the deployment protocols for the BIGISH-YER Macroeconomic Stabilization platform, compiled under the Pi Network Ecosystem Framework (v2.0 SDK Guide) and core academic requirements for cross-application clearing (AJYAL & GAV).

---

## 1. Prerequisites & Host Requirements

Before executing deployment scripts, ensure your cloud host meets the following infrastructure dependencies:
- **Node.js**: v20.x or higher (LTS recommended)
- **Python**: v3.10+ (for running the macroeconomic stability simulation model)
- **Database**: PostgreSQL 15+ or MongoDB Atlas instance
- **Network Access**: SSL/TLS certificate enabled (Pi Browser sandbox mandates HTTPS endpoints for app authentication)

---

## 2. Environment Configuration

1. Clone the repository into your local system or production server.
2. Duplicate the env reference file into production states:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file and populate your secure developer credentials fetched from the **Pi Developer Portal**:
   - `PI_API_KEY`: Your official Core Team authorization bearer credential.
   - `DATABASE_URL`: Production endpoint matching your secure local ledger configuration.

---

## 3. Backend Deployment Sequence (Express Node Engine)

Execute the following commands in sequence within the repository root directory to build the system dependencies and bind micro-services:

```bash
# Step 1: Install core package and security dependencies
npm install

# Step 2: Set up required test frameworks for the ledger validation checks
npm install mocha chai chai-http nock --save-dev

# Step 3: Run comprehensive automated test assertions
npm test
```

### Process Manager Integration (PM2 Integration)
To keep the stabilization clearance pipeline running permanently in background mode, wrap the process tree under `PM2`:
```bash
npm install pm2 -g
pm2 start app.js --name "bigish-yer-backend"
pm2 save
```

---

## 4. Registering App inside the Pi Browser (Pi Sandbox Configuration)

To enable Pioneers to access the **YER Mining Dashboard** and interact with the **AI Support Engine**, map your deployment with the Pi Network architecture:

1. Open the official **Pi Browser** app on your device.
2. Navigate to `develop.pi` (The Pi Developer Portal).
3. Click on **Create App** and input the following configuration properties:
   - **App Name**: BIGISH-YER Ecosystem Core
   - **App URL**: `https://yourdomain.com` (Must be HTTPS)
   - **Sandbox URL**: `https://localhost:5000` (For local network diagnostics)
4. Extract your App ID and update your internal front-end configuration array headers.

---

## 5. Running the Python Macroeconomic Simulation

To spin up the inflation mitigation simulation engine and monitor the liquidity indices:
```bash
python simulation.py
```
This logs live telemetry verifying that the current `AntiDoubleDippingEngine` block parameters are operating without latency spikes.

---

## 6. Live Infrastructure Sanity Check Matrix

Post-deployment, monitor the logs to verify all 5 newly configured modules are synchronized:
1. `GET /api/yer/notifications` ── Ensures real-time clearance pushes are responsive.
2. `POST /api/support/smart-ai` ── Validates RAG confidence vectors are properly weighted.
3. `GET /api/yer/mining/status` ── Confirms countdown session locks reset smoothly every 24 hours.
