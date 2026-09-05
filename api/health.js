// api/health.js - نقطة نهاية صحية لتطبيق BIGISH-YER
module.exports = (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    app: 'BIGISH-YER'
  });
};