import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, Camera, Loader, CheckCircle, X } from 'lucide-react';

const IngredientDetector = ({ onIngredientsDetected }) => {
  const { getText, language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [lastDetected, setLastDetected] = useState({ en: [], jp: [], confidence: null });

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);

    // Process image
    await processImage(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const processImage = async (file) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Call Gemini-backed endpoint only
      const response = await axios.post('/api/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Normalize response
      const { ingredients_jp, ingredients_en, ingredients, confidence, source } = response.data || {};

      if (source === 'fallback') {
        toast.error(
          getText(
            'AI detection is unavailable right now. Please check API key/server and try again.',
            '現在AI検出を利用できません。APIキー/サーバー設定を確認して再試行してください。'
          )
        );
        setDetectedIngredients([]);
        onIngredientsDetected([]);
        return;
      }

      // Respect UI language: prefer English when language==='en', else Japanese
      let detected = [];
      if (language === 'en') {
        detected = Array.isArray(ingredients_en) && ingredients_en.length > 0
          ? ingredients_en
          : Array.isArray(ingredients_jp) && ingredients_jp.length > 0
            ? ingredients_jp
            : Array.isArray(ingredients) && ingredients.length > 0
              ? ingredients
              : [];
      } else {
        detected = Array.isArray(ingredients_jp) && ingredients_jp.length > 0
          ? ingredients_jp
          : Array.isArray(ingredients_en) && ingredients_en.length > 0
            ? ingredients_en
            : Array.isArray(ingredients) && ingredients.length > 0
              ? ingredients
              : [];
      }

      setLastDetected({
        en: Array.isArray(ingredients_en) ? ingredients_en : [],
        jp: Array.isArray(ingredients_jp) ? ingredients_jp : [],
        confidence: confidence ?? null,
      });

      if (detected.length === 0) {
        toast.error(
          getText(
            'No ingredients detected. Try another photo or better lighting.',
            '材料が検出されませんでした。別の写真や明るい場所でお試しください。'
          )
        );
      }

      setDetectedIngredients(detected);
      onIngredientsDetected(detected);
      
      if (detected.length > 0) {
        toast.success(
          getText(
            `Detected ${detected.length} ingredients${confidence != null ? ` with ${Math.round((confidence || 0) * 100)}% confidence` : ''}`,
            `${detected.length}個の材料${confidence != null ? `（信頼度${Math.round((confidence || 0) * 100)}%）` : ''}を検出しました`
          )
        );
      }
    } catch (error) {
      console.error('Ingredient detection failed:', error);
      toast.error(
        getText(
          'Failed to detect ingredients. Please check the server and try again.',
          '材料の検出に失敗しました。サーバー設定を確認してもう一度お試しください。'
        )
      );
      setDetectedIngredients([]);
      onIngredientsDetected([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeIngredient = (index) => {
    const newIngredients = detectedIngredients.filter((_, i) => i !== index);
    setDetectedIngredients(newIngredients);
    onIngredientsDetected(newIngredients);
  };

  const addIngredient = (ingredient) => {
    if (ingredient.trim() && !detectedIngredients.includes(ingredient.trim())) {
      const newIngredients = [...detectedIngredients, ingredient.trim()];
      setDetectedIngredients(newIngredients);
      onIngredientsDetected(newIngredients);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      addIngredient(e.target.value);
      e.target.value = '';
    }
  };

  const clearAll = () => {
    setDetectedIngredients([]);
    setPreviewImage(null);
    onIngredientsDetected([]);
  };

  // When UI language changes, switch the displayed chips to the saved language list
  useEffect(() => {
    if (!lastDetected) return;
    const target = language === 'en' ? lastDetected.en : lastDetected.jp;
    if (Array.isArray(target) && target.length > 0) {
      setDetectedIngredients(target);
      onIngredientsDetected(target);
    }
  }, [language]);

  return (
    <div className="space-y-4">
      {/* Image Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {previewImage ? (
          <div className="space-y-3">
            <img
              src={previewImage}
              alt="Preview"
              className="mx-auto max-h-48 rounded-lg object-cover"
            />
            <p className="text-sm text-gray-600">
              {getText('Click or drag to replace image', 'クリックまたはドラッグして画像を置き換え')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Camera size={48} className="mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {getText('Upload Ingredient Photo', '材料の写真をアップロード')}
              </p>
              <p className="text-sm text-gray-500">
                {getText('Drag & drop or click to select', 'ドラッグ＆ドロップまたはクリックして選択')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-lg">
          <Loader size={20} className="animate-spin text-blue-600" />
          <span className="text-blue-700">
            {getText('Analyzing image...', '画像を分析中...')}
          </span>
        </div>
      )}

      {/* Detected Ingredients */}
      {detectedIngredients.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              {getText('Detected Ingredients', '検出された材料')}
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700"
            >
              {getText('Clear All', 'すべてクリア')}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {detectedIngredients.map((ingredient, index) => (
              <span
                key={index}
                className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                <CheckCircle size={16} />
                <span>{ingredient}</span>
                <button
                  onClick={() => removeIngredient(index)}
                  className="ml-1 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          {/* Add Custom Ingredient */}
          <div className="pt-2 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('Add Custom Ingredient', 'カスタム材料を追加')}
            </label>
            <input
              type="text"
              placeholder={getText('Type and press Enter', '入力してEnterを押す')}
              onKeyPress={handleKeyPress}
              className="input-field"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientDetector;
