import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './en.json';
import ko from './ko.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ko: { translation: ko } },
  lng: getLocales()[0]?.languageCode === 'ko' ? 'ko' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

export function foodLabel(f: { isCustom: boolean; name: string }): string {
  return f.isCustom ? f.name : i18n.t(f.name);
}
