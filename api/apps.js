// api/apps.js - معلومات تطبيق BIGISH-YER
module.exports = (req, res) => {
  res.status(200).json({
    id: 'bigish-yer',
    name: 'BIGISH-YER',
    description: 'طبقة التسوية المالية الأساسية ومنظومة الريال الرقمي اليمني',
    version: '1.0.0',
    status: 'ONLINE',
    endpoints: {
      health: '/api/health',
      info: '/api/apps'
    }
  });
};