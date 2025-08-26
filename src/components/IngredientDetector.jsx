import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, Camera, Loader, CheckCircle, X } from 'lucide-react';

const IngredientDetector = ({ onIngredientsDetected }) => {
  const { getText } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

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

      const response = await axios.post('/api/detect-ingredients', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { ingredients, confidence } = response.data;
      setDetectedIngredients(ingredients);
      onIngredientsDetected(ingredients);
      
      toast.success(
        getText(
          `Detected ${ingredients.length} ingredients with ${Math.round(confidence * 100)}% confidence`,
          `${ingredients.length}個の材料を${Math.round(confidence * 100)}%の信頼度で検出しました`
        )
      );
    } catch (error) {
      console.error('Ingredient detection failed:', error);
      toast.error(
        getText(
          'Failed to detect ingredients. Please try again.',
          '材料の検出に失敗しました。もう一度お試しください。'
        )
      );
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
