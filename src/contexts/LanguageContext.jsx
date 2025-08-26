import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async (text, targetLang = null) => {
    if (!text || text.trim() === '') return text;
    
    const targetLanguage = targetLang || (language === 'en' ? 'ja' : 'en');
    
    try {
      setIsTranslating(true);
      const response = await axios.post('/api/translate', {
        text: text.trim(),
        targetLanguage: targetLanguage
      });
      
      return response.data.translation;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text if translation fails
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ja' : 'en');
  };

  const getText = (englishText, japaneseText) => {
    if (language === 'ja' && japaneseText) {
      return japaneseText;
    }
    return englishText;
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    translateText,
    getText,
    isTranslating
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
