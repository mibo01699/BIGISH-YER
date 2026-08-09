# In-App Translation & Internationalization (i18n) Guide

Pi Network is a global community. This project uses structured JSON translation keys to serve users in English, Arabic, and other standard languages natively inside the Pi Browser.

## 1. Directory Structure
```text
client/
└── src/
    └── locales/
        ├── en.json (English)
        └── ar.json (Arabic)
```

## 2. Translation Dictionaries

### `en.json`
```json
{
  "welcome_msg": "Welcome to BIGISH-YER Platform",
  "pay_button": "Pay with Pi",
  "support_smart": "AI Smart Assistant",
  "support_human": "Talk to an Agent"
}
```

### `ar.json`
```json
{
  "welcome_msg": "مرحباً بك في منصة BIGISH-YER",
  "pay_button": "ادفع بواسطة عملة Pi",
  "support_smart": "المساعد الذكي الآلي",
  "support_human": "التحدث مع موظف دعم"
}
```

## 3. Implementation Utility Code (React Translation Hook Example)
```javascript
// client/src/hooks/useTranslation.js
import { useState } from 'react';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const translations = { en, ar };

export function useTranslation() {
    const [locale, setLocale] = useState('en'); // default language

    const t = (key) => {
        return translations[locale][key] || key;
    };

    return { t, locale, changeLanguage: setLocale };
}
```
