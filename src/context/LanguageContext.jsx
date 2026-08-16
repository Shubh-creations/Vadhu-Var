import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../lib/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('vadhu_var_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('vadhu_var_lang', lang);
  }, [lang]);

  const t = (key, params) => {
    let text = translations[lang]?.[key] || translations.en?.[key] || key;
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
