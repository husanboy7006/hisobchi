import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cookies from 'js-cookie';

import uzTranslation from './locales/uz/translation.json';
import ruTranslation from './locales/ru/translation.json';

const resources = {
    uz: {
        translation: uzTranslation,
    },
    ru: {
        translation: ruTranslation,
    },
};

const savedLanguage = Cookies.get('i18nextLng') || 'uz';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'uz',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
