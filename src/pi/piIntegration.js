/**
 * Pi Network integration boundary.
 *
 * STATUS: SANDBOX ONLY. Mainnet is intentionally NOT activated.
 * The real Pi Platform API calls are kept below as commented reference code and
 * must stay disabled until every step in PI_INTEGRATION.md is completed.
 */

const config = require('../../lib/config');

/**
 * True only when the service is explicitly switched to mainnet with a server
 * API key present. In every other case the integration reports "not ready".
 */
function isReady() {
  return config.pi.sandbox === false && Boolean(process.env.PI_API_KEY);
}

function getMode() {
  return {
    sandbox: config.pi.sandbox,
    network: config.pi.network,
    apiUrl: config.pi.apiUrl,
    ready: isReady(),
  };
}

/**
 * Verifies a Pi access token against the Pi Platform API.
 * Disabled until mainnet activation.
 */
async function verifyAccessToken(/* accessToken */) {
  throw new Error('Pi authentication is disabled while PI_SANDBOX=true');

  /*
  const response = await fetch(`${config.pi.apiUrl}/v2/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`Pi /v2/me failed with ${response.status}`);
  return response.json(); // { uid, username, ... }
  */
}

/**
 * Server-side approval of a payment created by the Pi client SDK.
 * Disabled until mainnet activation.
 */
async function approvePayment(/* paymentId */) {
  throw new Error('Pi payments are disabled while PI_SANDBOX=true');

  /*
  const response = await fetch(`${config.pi.apiUrl}/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Key ${process.env.PI_API_KEY}` },
  });
  if (!response.ok) throw new Error(`Pi approve failed with ${response.status}`);
  return response.json();
  */
}

/**
 * Server-side completion of a payment after the blockchain txid is known.
 * Disabled until mainnet activation.
 */
async function completePayment(/* paymentId, txid */) {
  throw new Error('Pi payments are disabled while PI_SANDBOX=true');

  /*
  const response = await fetch(`${config.pi.apiUrl}/v2/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${process.env.PI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txid }),
  });
  if (!response.ok) throw new Error(`Pi complete failed with ${response.status}`);
  return response.json();
  */
}

module.exports = { isReady, getMode, verifyAccessToken, approvePayment, completePayment };
