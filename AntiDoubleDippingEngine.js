// AntiDoubleDippingEngine.js
class AntiDoubleDippingEngine {
  constructor() {
    this.locks = new Map();
  }

  isLocked(entityId, claimNonce) {
    const key = `${entityId}:${claimNonce}`;
    if (this.locks.has(key)) {
      return true;
    }
    this.locks.set(key, true);
    // تنظيف القفل بعد فترة (مهلة 5 دقائق)
    setTimeout(() => this.locks.delete(key), 300000);
    return false;
  }
}

module.exports = new AntiDoubleDippingEngine();