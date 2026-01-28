import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import zhTW from './locales/zh-TW';
import zhCN from './locales/zh-CN';
import vi from './locales/vi';

const resources = {
    en: en,
    'zh-TW': zhTW,
    'zh-CN': zhCN,
    vi: vi,
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'zh-TW',
        lng: localStorage.getItem('language') || 'zh-TW',

        debug: false, // 設為 true 可以看到詳細日誌

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false, // 避免 Suspense 問題
        },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'language',
        },
    });

// 監聽語言變更
i18n.on('languageChanged', (lng) => {
    console.log('Language changed to:', lng);
    localStorage.setItem('language', lng);
    // 強制更新 document 語言屬性
    document.documentElement.lang = lng;
});

export default i18n;
