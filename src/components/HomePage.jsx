import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Sparkles, Utensils, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();

  const handleStartCooking = () => {
    navigate('/app');
  };

  const handleLogoClick = () => {
    // Refresh the homepage or navigate to root
    navigate('/');
  };

  // Floating background shapes with new color scheme
  const FloatingShape = ({ delay, position, size, opacity }) => (
    <motion.div
      className={`absolute rounded-full bg-orange-500/20 ${position} ${size}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ opacity }}
    />
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Animated Background Shapes */}
      <FloatingShape delay={0} position="top-20 left-20" size="w-32 h-32" opacity={0.3} />
      <FloatingShape delay={2} position="top-40 right-32" size="w-24 h-24" opacity={0.2} />
      <FloatingShape delay={4} position="bottom-32 left-32" size="w-40 h-40" opacity={0.25} />
      <FloatingShape delay={1} position="bottom-20 right-20" size="w-28 h-28" opacity={0.2} />
      <FloatingShape delay={3} position="top-1/2 left-10" size="w-20 h-20" opacity={0.15} />
      <FloatingShape delay={5} position="top-1/2 right-10" size="w-16 h-16" opacity={0.18} />

      {/* Top Navbar - Simplified with Language Toggle */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center space-x-2 text-black cursor-pointer hover:opacity-80 transition-opacity duration-300"
          onClick={handleLogoClick}
        >
          <Utensils className="text-2xl md:text-3xl text-orange-500" />
          <span className="text-xl md:text-2xl font-bold text-black">
            {language === 'en' ? 'The Way of Flavor AI' : '味の道AI'}
          </span>
        </motion.div>

        {/* Language Toggle Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onClick={toggleLanguage}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium">{language === 'en' ? '日本語' : 'English'}</span>
        </motion.button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="max-w-5xl mx-auto space-y-8"
        >
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-black leading-tight tracking-tight"
          >
            {language === 'en' ? 'ANYBODY CAN COOK' : '誰でも料理できる'}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            {language === 'en' 
              ? 'Cook Like a Pro, Even if You\'ve Never Tried Before.'
              : '今まで試したことがなくても、プロのように料理できるようになります。'
            }
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="pt-8"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 40px rgba(249, 115, 22, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartCooking}
              className="group relative px-12 py-4 bg-orange-500 text-white rounded-full text-xl font-bold shadow-2xl hover:bg-orange-600 hover:shadow-orange-500/30 transition-all duration-300 cursor-pointer"
            >
              <span className="relative z-10 flex items-center space-x-3">
                <ChefHat className="text-2xl" />
                <span>{language === 'en' ? 'Start Cooking' : '料理を始める'}</span>
                <Sparkles className="text-xl" />
              </span>
            </motion.button>
          </motion.div>

          {/* Food Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="pt-8"
          >
            <div className="flex justify-center space-x-4 text-6xl">
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                className="text-orange-500"
              >
                🍛
              </motion.span>
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="text-orange-600"
              >
                🥘
              </motion.span>
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="text-orange-700"
              >
                🌶️
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm text-center"
      >
        🍲 {language === 'en' ? 'Powered by AI • Made with Love' : 'AI搭載 • 愛を込めて作成'}
      </motion.div>
    </div>
  );
};

export default HomePage;
