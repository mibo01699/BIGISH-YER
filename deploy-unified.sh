#!/bin/bash
echo "======================================================"
echo "⚡ Starting Unified Deployment Engine for BIGISH-YER"
echo "======================================================"

# 1. فحص ملف البيئة الافتراضي والتأكد من وجوده
if [ ! -f .env ]; then
    echo "⚠️ .env file not found, creating from .env.example..."
    cp .env.example .env 2>/dev/null || echo "PORT=3000" > .env
fi

# 2. تنصيب الحزم البرمجية النظيفة والموحدة
echo "📦 Installing clean ecosystem dependencies..."
npm install

# 3. فحص بيئة بايثون لملف المحاكاة
echo "📊 Checking Python environment for macroeconomic simulation..."
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 is available."
else
    echo "⚠️ Python 3 is missing. Simulation script requires Python 3.10+."
fi

echo "======================================================"
echo "✅ Deployment structure is ready! Run 'npm start' to boot."
echo "======================================================"
