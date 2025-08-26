import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, ChefHat, CheckCircle, ChevronLeft, ChevronRight, Star, Trophy, PartyPopper } from 'lucide-react';

const RecipeDetail = () => {
  const { id } = useParams();
  const { getText, language } = useLanguage();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      setRecipe(response.data);
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
      toast.error(
        getText(
          'Failed to load recipe. Please try again.',
          'レシピの読み込みに失敗しました。もう一度お試しください。'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStepCompletion = (stepIndex) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepIndex)) {
      newCompletedSteps.delete(stepIndex);
    } else {
      newCompletedSteps.add(stepIndex);
    }
    setCompletedSteps(newCompletedSteps);
  };

  const nextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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

  // Check if all steps are completed
  const allStepsCompleted = completedSteps.size === recipe?.instructions?.length;
  const progressPercentage = recipe ? (completedSteps.size / recipe.instructions.length) * 100 : 0;

  // Get catchy completion message
  const getCompletionMessage = () => {
    const messages = [
      {
        en: "🎉 Congratulations! You've mastered this recipe! Time to impress your taste buds!",
        ja: "🎉 おめでとうございます！このレシピをマスターしました！味覚を驚かせる時です！"
      },
      {
        en: "🌟 Amazing work! You're now a culinary wizard! This dish is going to be legendary!",
        ja: "🌟 素晴らしい仕事です！あなたは今や料理の魔法使いです！この料理は伝説的になるでしょう！"
      },
      {
        en: "🏆 Recipe Champion! You've conquered the kitchen! Time to savor your victory!",
        ja: "🏆 レシピチャンピオン！キッチンを征服しました！勝利を味わう時です！"
      },
      {
        en: "✨ You did it! Your cooking skills just leveled up! This dish is going to be incredible!",
        ja: "✨ やりました！あなたの料理スキルがレベルアップしました！この料理は信じられないほど素晴らしくなります！"
      },
      {
        en: "🎊 Bravo! You've created a masterpiece! Your taste buds are in for a treat!",
        ja: "🎊 ブラボー！傑作を作りました！あなたの味覚はご馳走を楽しむことになります！"
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-4 text-lg text-gray-600">
          {getText('Loading recipe...', 'レシピを読み込み中...')}
        </span>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {getText('Recipe not found', 'レシピが見つかりません')}
        </h2>
        <Link to="/" className="btn-primary">
          {getText('Back to Home', 'ホームに戻る')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>{getText('Back to Recipes', 'レシピ一覧に戻る')}</span>
      </Link>

      {/* Recipe Header */}
      <div className="card overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={recipe.image}
              alt={getText(recipe.title, recipe.title_jp)}
              className="w-full h-64 md:h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image';
              }}
            />
          </div>
          
          <div className="md:w-1/2 p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {getText(recipe.title, recipe.title_jp)}
                </h1>
                <p className="text-lg text-gray-600">
                  {getText(
                    `Authentic ${recipe.cuisine} cuisine`,
                    `本格的な${recipe.cuisine === 'Indian' ? 'インド' : '国際'}料理`
                  )}
                </p>
              </div>

              {/* Recipe Stats */}
              <div className="grid grid-cols-2 gap-4">
                {recipe.prepTime && recipe.prepTime !== 'N/A' && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock size={24} className="mx-auto mb-2 text-primary-600" />
                    <div className="text-sm text-gray-600">
                      {getText('Prep Time', '準備時間')}
                    </div>
                    <div className="font-semibold text-gray-900">{recipe.prepTime}</div>
                  </div>
                )}
                
                {recipe.cookTime && recipe.cookTime !== 'N/A' && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <ChefHat size={24} className="mx-auto mb-2 text-primary-600" />
                    <div className="text-sm text-gray-600">
                      {getText('Cook Time', '調理時間')}
                    </div>
                    <div className="font-semibold text-gray-900">{recipe.cookTime}</div>
                  </div>
                )}
              </div>

              {recipe.difficulty && recipe.difficulty !== 'N/A' && (
                <div className="text-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {getText('Difficulty:', '難易度：')} {getDifficultyText(recipe.difficulty)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="card p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {getText('Ingredients', '材料')}
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {recipe.ingredients?.map((ingredient, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <span className="text-gray-700">
                {language === 'ja' && recipe.ingredients_jp?.[index] 
                  ? recipe.ingredients_jp[index] 
                  : ingredient
                }
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {getText('Instructions', '調理手順')}
          </h2>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-3">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">
              {completedSteps.size}/{recipe.instructions.length}
            </span>
          </div>
        </div>

        {/* Completion Celebration */}
        {allStepsCompleted && (
          <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Trophy size={32} className="text-yellow-600" />
              <PartyPopper size={32} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">
              {getText('Recipe Complete! 🎉', 'レシピ完了！🎉')}
            </h3>
            <p className="text-yellow-700 text-lg">
              {getCompletionMessage()[language === 'ja' ? 'ja' : 'en']}
            </p>
          </div>
        )}

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            <span>{getText('Previous', '前へ')}</span>
          </button>
          
          <span className="text-lg font-medium text-gray-700">
            {getText('Step', 'ステップ')} {currentStep + 1} {getText('of', 'の')} {recipe.instructions.length}
          </span>
          
          <button
            onClick={nextStep}
            disabled={currentStep === recipe.instructions.length - 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{getText('Next', '次へ')}</span>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Current Step */}
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full text-2xl font-bold mb-4">
              {currentStep + 1}
            </div>
            <p className="text-xl text-gray-700 leading-relaxed">
              {language === 'ja' && recipe.instructions_jp?.[currentStep]
                ? recipe.instructions_jp[currentStep]
                : recipe.instructions[currentStep]
              }
            </p>
          </div>
          
          <button
            onClick={() => toggleStepCompletion(currentStep)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              completedSteps.has(currentStep)
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle size={20} />
            <span>
              {completedSteps.has(currentStep)
                ? getText('Step Completed', 'ステップ完了')
                : getText('Mark Complete', '完了としてマーク')
              }
            </span>
          </button>
        </div>

        {/* All Steps Overview */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {getText('All Steps', 'すべてのステップ')}
          </h3>
          <div className="space-y-3">
            {recipe.instructions?.map((instruction, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentStep
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  completedSteps.has(index)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {completedSteps.has(index) ? (
                    <CheckCircle size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${
                    completedSteps.has(index) ? 'text-gray-500 line-through' : 'text-gray-700'
                  }`}>
                    {language === 'ja' && recipe.instructions_jp?.[index]
                      ? recipe.instructions_jp[index]
                      : instruction
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
