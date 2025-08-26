import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './components/Home';
import RecipeDetail from './components/RecipeDetail';
import HomePage from './components/HomePage';
import { LanguageProvider } from './contexts/LanguageContext';

export const LanguageContext = createContext();

// Conditional Navbar component
const ConditionalNavbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  if (isHomePage) return null;
  return <Navbar />;
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <ConditionalNavbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/app" element={
                <div className="container mx-auto px-4 py-8">
                  <Home />
                </div>
              } />
              <Route path="/recipe/:id" element={
                <div className="container mx-auto px-4 py-8">
                  <RecipeDetail />
                </div>
              } />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
