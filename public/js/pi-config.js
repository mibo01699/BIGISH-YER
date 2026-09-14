// ============================================
// BIGISH-YER Wallet — Pi SDK Configuration
// ============================================

Pi.init({
    version: "2.0",
    sandbox: true  // Testnet (غيّر إلى false عند الانتقال إلى Mainnet)
});

console.log("✅ Pi SDK initialized (Sandbox/Testnet)");