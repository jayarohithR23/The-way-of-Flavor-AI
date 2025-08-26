import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import IngredientDetector from './IngredientDetector';
import RecipeList from './RecipeList';
import { Search, Camera, Utensils, Sparkles } from 'lucide-react';

const Home = () => {
  const { language, getText } = useLanguage();
  const [ingredients, setIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleIngredientsDetected = (detectedIngredients) => {
    setIngredients(detectedIngredients);
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const queryIngredients = searchQuery.split(',').map(i => i.trim());
    setIngredients(queryIngredients);
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setIngredients([]);
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Hero Section */}
      <div className="text-center space-y-6 bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-3xl border border-orange-100">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-full">
            <Sparkles className="text-white text-2xl" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          {getText(
            'Discover Authentic Indian Recipes',
            '本格的なインド料理を発見しよう'
          )}
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          {getText(
            'Upload a photo of your ingredients or type them manually to find the perfect Indian recipe',
            '材料の写真をアップロードするか、手動で入力して完璧なインド料理レシピを見つけましょう'
          )}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Ingredient Input */}
        <div className="space-y-6">
          <div className="card p-8 bg-gradient-to-br from-white to-orange-50 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Camera className="text-white" size={24} />
              </div>
              <span>
                {getText('Ingredient Detection', '材料検出')}
              </span>
            </h2>
            <IngredientDetector onIngredientsDetected={handleIngredientsDetected} />
          </div>

          <div className="card p-8 bg-gradient-to-br from-white to-amber-50 border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Search className="text-white" size={24} />
              </div>
              <span>
                {getText('Manual Search', '手動検索')}
              </span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {getText('Enter ingredients (comma-separated)', '材料を入力してください（カンマ区切り）')}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getText('e.g., chicken, rice, tomato', '例：鶏肉、米、トマト')}
                  className="input-field border-2 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleManualSearch}
                  className="btn-primary bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 flex-1 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {getText('Search Recipes', 'レシピを検索')}
                </button>
                <button
                  onClick={handleClearSearch}
                  className="btn-secondary bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {getText('Clear', 'クリア')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recipe Results */}
        <div className="space-y-6">
          <div className="card p-8 bg-gradient-to-br from-white to-orange-50 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Utensils className="text-white" size={24} />
              </div>
              <span>
                {getText('Recipe Suggestions', 'レシピ提案')}
              </span>
            </h2>
            
            {ingredients.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-6 rounded-2xl border border-orange-200">
                  <h3 className="font-bold text-orange-800 mb-4 text-lg">
                    {getText('Detected Ingredients:', '検出された材料：')}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
                <RecipeList ingredients={ingredients} />
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Utensils size={48} className="text-orange-500" />
                </div>
                <p className="text-lg font-medium">
                  {getText(
                    'Upload a photo or enter ingredients to get started',
                    '写真をアップロードするか、材料を入力して開始してください'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
