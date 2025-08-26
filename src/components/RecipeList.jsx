import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Clock, ChefHat, Star, ExternalLink } from 'lucide-react';

const RecipeList = ({ ingredients }) => {
  const { getText, language } = useLanguage();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState('');
  const [localCount, setLocalCount] = useState(0);
  const [externalCount, setExternalCount] = useState(0);

  useEffect(() => {
    if (ingredients.length > 0) {
      searchRecipes();
    }
  }, [ingredients]);

  const searchRecipes = async () => {
    setIsLoading(true);
    
    try {
      const ingredientsQuery = ingredients.join(',');
      const response = await axios.get(`/api/recipes/search?ingredients=${ingredientsQuery}`);
      
      setRecipes(response.data.recipes || []);
      setSource(response.data.source || 'none');
      setLocalCount(response.data.localCount || 0);
      setExternalCount(response.data.externalCount || 0);
      
      if (response.data.recipes.length === 0) {
        toast.info(
          getText(
            'No recipes found for these ingredients. Try different ingredients.',
            'これらの材料でレシピが見つかりませんでした。別の材料を試してください。'
          )
        );
      }
    } catch (error) {
      console.error('Recipe search failed:', error);
      toast.error(
        getText(
          'Failed to search recipes. Please try again.',
          'レシピの検索に失敗しました。もう一度お試しください。'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty) => {
    if (language === 'ja') {
      switch (difficulty?.toLowerCase()) {
        case 'easy':
          return '簡単';
        case 'medium':
          return '普通';
        case 'hard':
          return '難しい';
        default:
          return '不明';
      }
    }
    return difficulty || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">
          {getText('Searching recipes...', 'レシピを検索中...')}
        </span>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <ChefHat size={64} className="mx-auto mb-6 text-gray-300" />
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          {getText(
            'No Recipes Found Yet! 🍽️',
            'レシピが見つかりませんでした！🍽️'
          )}
        </h3>
        <p className="text-lg mb-4 text-gray-500">
          {getText(
            'We\'re working hard to add more delicious Indian recipes to our database.',
            'おいしいインド料理のレシピをデータベースに追加するために一生懸命取り組んでいます。'
          )}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-700 mb-2">
            {getText(
              '💡 Try searching for these ingredients instead:',
              '💡 代わりにこれらの材料で検索してみてください：'
            )}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['chicken', 'potato', 'rice', 'onion', 'tomato'].map((ingredient) => (
              <span key={ingredient} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {ingredient}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          {getText(
            'More recipes coming soon! 🚀',
            'より多くのレシピが近日公開予定です！🚀'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Source Indicator */}
      {source && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          source === 'mixed' 
            ? 'bg-gradient-to-r from-green-100 to-blue-100 text-gray-800 border border-green-200' 
            : source === 'local'
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {source === 'mixed' ? (
            <span className="flex items-center space-x-2">
              <Star size={16} className="text-green-600" />
              <span>
                {getText(
                  `Found ${localCount} Indian recipes + ${externalCount} international recipes`,
                  `インド料理${localCount}件 + 国際料理${externalCount}件が見つかりました`
                )}
              </span>
            </span>
          ) : source === 'local' ? (
            <span className="flex items-center space-x-2">
              <Star size={16} />
              <span>
                {getText(
                  'Authentic Indian recipes from our database',
                  'データベースからの本格的なインド料理レシピ'
                )}
              </span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <ExternalLink size={16} />
              <span>
                {getText(
                  'International recipes from external source',
                  '外部ソースからの国際的なレシピ'
                )}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Recipe Grid */}
      <div className="grid gap-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="card hover:shadow-xl transition-shadow duration-200">
            <div className="flex">
              {/* Recipe Image */}
              <div className="w-24 h-24 flex-shrink-0 relative">
                <img
                  src={recipe.image}
                  alt={getText(recipe.title, recipe.title_jp)}
                  className="w-full h-full object-cover rounded-l-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/96x96/f3f4f6/9ca3af?text=No+Image';
                  }}
                />
                {recipe.source === 'external' && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {getText('Ext', '外')}
                  </div>
                )}
              </div>
              
              {/* Recipe Info */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {getText(recipe.title, recipe.title_jp)}
                    </h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      {recipe.prepTime && recipe.prepTime !== 'N/A' && (
                        <span className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{recipe.prepTime}</span>
                        </span>
                      )}
                      
                      {recipe.difficulty && recipe.difficulty !== 'N/A' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                          {getDifficultyText(recipe.difficulty)}
                        </span>
                      )}
                    </div>
                    
                    {/* Ingredients Preview */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {recipe.ingredients?.slice(0, 3).map((ingredient, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {recipe.ingredients?.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{recipe.ingredients.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* View Recipe Button */}
                  <div className="ml-4">
                    <Link
                      to={`/recipe/${recipe.id}`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      {getText('View Recipe', 'レシピを見る')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;
