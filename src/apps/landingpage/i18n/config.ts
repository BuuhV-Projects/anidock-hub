import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from '../locales/pt-BR.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import legalPtBR from '../locales/legal-pt-BR.json';
import legalEn from '../locales/legal-en.json';
import legalEs from '../locales/legal-es.json';

const resources = {
  'pt-BR': { 
    translation: ptBR,
    legal: legalPtBR
  },
  en: { 
    translation: en,
    legal: legalEn
  },
  es: { 
    translation: es,
    legal: legalEs
  },
};

const savedLanguage = localStorage.getItem('anidock-language') || 'pt-BR';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'pt-BR',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
