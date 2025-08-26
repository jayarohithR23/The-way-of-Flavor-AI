import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Utensils, Globe } from 'lucide-react';

const Navbar = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand - Clickable */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
            onClick={handleLogoClick}
          >
            <Utensils className="text-2xl text-orange-500" />
            <span className="text-xl font-bold text-gray-800">
              {language === 'ja' ? '味の道AI' : 'The Way of Flavor AI'}
            </span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{language === 'en' ? '日本語' : 'English'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
