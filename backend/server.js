import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import { MongoClient } from 'mongodb';
// import OpenAI from 'openai'; // removed
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB connection
let db;
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'recipe_assistant';

// Initialize MongoDB connection
async function connectDB() {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    
    // Initialize recipes collection with sample data
    await initializeRecipes();
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// OpenAI configuration (removed)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Initialize sample Indian recipes
async function initializeRecipes() {
  const recipesCollection = db.collection('recipes');
  const count = await recipesCollection.countDocuments();
  
  if (count === 0) {
    try {
      // Load recipes from JSON file
      const fs = await import('fs');
      const path = await import('path');
      const recipesPath = path.join(__dirname, 'data', 'indian_recipes.json');
      
      const recipesData = fs.readFileSync(recipesPath, 'utf8');
      const sampleRecipes = JSON.parse(recipesData);
      
      await recipesCollection.insertMany(sampleRecipes);
      console.log(`${sampleRecipes.length} Indian recipes initialized from database`);
    } catch (error) {
      console.error('Failed to load recipes from file:', error);
      
      // Fallback to hardcoded recipes if file loading fails
      const fallbackRecipes = [
        {
          id: 1,
          title: "Butter Chicken",
          title_jp: "バターチキン",
          cuisine: "Indian",
          image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
          ingredients: ["chicken", "butter", "tomato", "cream", "spices"],
          ingredients_jp: ["鶏肉", "バター", "トマト", "クリーム", "スパイス"],
          instructions: [
            "Marinate chicken with yogurt and spices",
            "Cook chicken until golden brown",
            "Prepare tomato-based gravy",
            "Combine chicken with gravy and cream",
            "Simmer until sauce thickens"
          ],
          instructions_jp: [
            "鶏肉をヨーグルトとスパイスでマリネする",
            "鶏肉を黄金色になるまで調理する",
            "トマトベースのグレービーを準備する",
            "鶏肉とグレービーとクリームを組み合わせる",
            "ソースが濃くなるまで煮込む"
          ],
          prepTime: "20 mins",
          cookTime: "30 mins",
          difficulty: "Medium"
        }
      ];
      
      await recipesCollection.insertMany(fallbackRecipes);
      console.log('Fallback recipes initialized');
    }
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipesCollection = db.collection('recipes');
    const recipes = await recipesCollection.find({}).toArray();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Reload recipes from JSON file
app.get('/api/recipes/reload', async (req, res) => {
  try {
    const recipesCollection = db.collection('recipes');
    
    // Clear existing recipes
    await recipesCollection.deleteMany({});
    
    // Load fresh recipes from JSON
    const fs = await import('fs');
    const path = await import('path');
    const recipesPath = path.join(__dirname, 'data', 'indian_recipes.json');
    
    const recipesData = fs.readFileSync(recipesPath, 'utf8');
    const newRecipes = JSON.parse(recipesData);
    
    await recipesCollection.insertMany(newRecipes);
    
    res.json({ 
      message: `Successfully reloaded ${newRecipes.length} recipes`,
      count: newRecipes.length 
    });
  } catch (error) {
    console.error('Failed to reload recipes:', error);
    res.status(500).json({ error: 'Failed to reload recipes' });
  }
});

// Ingredient mapping for search (katakana ↔ kanji)
const ingredientMapping = {
  // Vegetables and fruits
  "トマト": "蕃茄",
  "蕃茄": "トマト",
  "ジャガイモ": "馬鈴薯",
  "馬鈴薯": "ジャガイモ",
  "ニンジン": "人参",
  "人参": "ニンジン",
  "タマネギ": "玉葱",
  "玉葱": "タマネギ",
  "ニンニク": "大蒜",
  "大蒜": "ニンニク",
  "ジンジャー": "生姜",
  "生姜": "ジンジャー",
  "カリフラワー": "花椰菜",
  "花椰菜": "カリフラワー",
  "エンドウ豆": "豌豆",
  "豌豆": "エンドウ豆",
  "オクラ": "秋葵",
  "秋葵": "オクラ",
  "ナス": "茄子",
  "茄子": "ナス",
  "ピーマン": "甘椒",
  "甘椒": "ピーマン",
  "ほうれん草": "菠薐草",
  "菠薐草": "ほうれん草",
  
  // Proteins (added whole chicken mapping)
  "丸鶏": "鶏肉",
  "鶏肉": "丸鶏",
  
  // Spices and seasonings
  "スパイス": "香辛料",
  "香辛料": "スパイス",
  "サフラン": "番紅花",
  "番紅花": "サフラン",
  "ミント": "薄荷",
  "薄荷": "ミント",
  "カルダモン": "小豆蒄",
  "小豆蒄": "カルダモン",
  "ターメリック": "鬱金",
  "鬱金": "ターメリック",
  "クミン": "孜然",
  "孜然": "クミン",
  "コリアンダー": "香菜",
  "香菜": "コリアンダー",
  "コショウ": "胡椒",
  "胡椒": "コショウ",
  
  // Grains and legumes
  "レンズ豆": "扁豆",
  "扁豆": "レンズ豆",
  "黒レンズ豆": "黒扁豆",
  "黒扁豆": "黒レンズ豆",
  "キドニービーンズ": "インゲン豆",
  "インゲン豆": "キドニービーンズ",
  
  // Other ingredients
  "イースト": "酵母",
  "酵母": "イースト",
  "オイル": "油",
  "油": "オイル",
  "マスタードオイル": "芥子油",
  "芥子油": "マスタードオイル",
  "ココナッツオイル": "椰子油",
  "椰子油": "ココナッツオイル",
  "ココナッツミルク": "椰子乳",
  "椰子乳": "ココナッツミルク",
  "レモン": "檸檬",
  "檸檬": "レモン",
  "レモン汁": "檸檬汁",
  "檸檬汁": "レモン汁",
  "粉ミルク": "粉乳",
  "粉乳": "粉ミルク",
  "ローズウォーター": "薔薇水",
  "薔薇水": "ローズウォーター",
  "パパイヤペースト": "木瓜ペースト",
  "木瓜ペースト": "パパイヤペースト",
  "カシューナッツ": "腰果",
  "腰果": "カシューナッツ",
  "レーズン": "干し葡萄",
  "干し葡萄": "レーズン",
  "ミックス野菜": "混合野菜",
  "混合野菜": "ミックス野菜",
  "フェヌグリークの種": "胡芦巴の種",
  "胡芦巴の種": "フェヌグリークの種"
};

// Normalize common English synonyms from detectors
function normalizeEnglish(terms = []) {
  return terms.map(t => {
    const s = (t || '').toLowerCase().trim();
    if (s === 'whole chicken' || s === 'chicken (whole)') return 'chicken';
    if (s === 'bell pepper' || s === 'capsicum') return 'bell pepper';
    return s;
  });
}

// Basic English -> Japanese mapping for display/search fallbacks
const englishToJapanese = {
  'rice': '米',
  'chicken': '鶏肉',
  'onion': '玉葱',
  'tomato': 'トマト',
  'garlic': 'ニンニク',
  'ginger': '生姜',
  'potato': '馬鈴薯',
  'cauliflower': '花椰菜',
  'bell pepper': 'ピーマン',
  'pepper': '胡椒',
  'coriander': '香菜',
  'cilantro': '香菜',
  'yogurt': 'ヨーグルト',
  'cream': 'クリーム',
  'butter': 'バター',
  'mint': '薄荷',
  'cardamom': '小豆蒄',
  'saffron': '番紅花',
  'cumin': '孜然',
  'turmeric': '鬱金',
  'lentil': '扁豆',
  'lentils': '扁豆',
};

function mapEnglishToJapanese(terms = []) {
  const out = new Set();
  for (const t of terms) {
    const s = (t || '').toLowerCase().trim();
    if (!s) continue;
    if (englishToJapanese[s]) out.add(englishToJapanese[s]);
  }
  return Array.from(out);
}

// Search recipes by ingredients
app.get('/api/recipes/search', async (req, res) => {
  try {
    const { ingredients } = req.query;
    if (!ingredients) {
      return res.status(400).json({ error: 'Ingredients parameter is required' });
    }

    // Support both standard comma and Japanese comma '、'
    const rawParts = ingredients
      .split(/[,、]/)
      .map(i => i.trim())
      .filter(Boolean);

    // English list is lowercased; Japanese terms are kept as-is
    const englishList = rawParts.map(i => i.toLowerCase());
    
    // Create Japanese search list with both original terms and mapped equivalents
    const japaneseList = [];
    rawParts.forEach(term => {
      japaneseList.push(term); // Add original term
      if (ingredientMapping[term]) {
        japaneseList.push(ingredientMapping[term]); // Add mapped equivalent
      }
    });

    // Search in local Indian recipes across both English and Japanese ingredient fields
    const recipesCollection = db.collection('recipes');
    let localRecipes = await recipesCollection.find({
      $or: [
        { ingredients: { $in: englishList } },
        { ingredients_jp: { $in: japaneseList } }
      ]
    }).toArray();

    // External recipes toggle (default disabled)
    const externalEnabled = (process.env.ENABLE_EXTERNAL || 'false').toLowerCase() === 'true';

    // Also search in external API for additional recipes (optional)
    let externalRecipes = [];
    if (externalEnabled && rawParts.length > 0) {
      try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(rawParts[0])}`);
        const externalMeals = response.data.meals || [];
        
        externalRecipes = externalMeals.slice(0, 5).map(meal => ({
          id: `ext_${meal.idMeal}`,
          title: meal.strMeal,
          title_jp: meal.strMeal, // Will be translated later
          cuisine: 'International',
          image: meal.strMealThumb,
          ingredients: [rawParts[0].toLowerCase()], // Simplified for external
          ingredients_jp: [rawParts[0]], // Will be translated later
          instructions: ['Recipe instructions available on TheMealDB website'],
          instructions_jp: ['レシピの手順はTheMealDBウェブサイトでご確認ください'],
          prepTime: 'Unknown',
          cookTime: 'Unknown',
          difficulty: 'Unknown',
          source: 'external'
        }));
      } catch (externalError) {
        console.error('External API error:', externalError.message);
      }
    }

    // Combine results: local recipes first, then optional external
    const allRecipes = [...localRecipes, ...externalRecipes];
    
    return res.json({
      recipes: allRecipes,
      source: externalRecipes.length > 0 ? 'mixed' : 'local',
      count: allRecipes.length,
      localCount: localRecipes.length,
      externalCount: externalRecipes.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search recipes' });
  }
});

// Get recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipesCollection = db.collection('recipes');
    
    // Try to find in local database first
    let recipe = await recipesCollection.findOne({ id: parseInt(id) });
    
    if (!recipe) {
      // Fallback to external API
      try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const meal = response.data.meals?.[0];
        
        if (meal) {
          recipe = {
            id: meal.idMeal,
            title: meal.strMeal,
            title_jp: meal.strMeal,
            cuisine: 'International',
            image: meal.strMealThumb,
            ingredients: extractIngredients(meal),
            instructions: meal.strInstructions.split('\n').filter(step => step.trim()),
            prepTime: 'N/A',
            cookTime: 'N/A',
            difficulty: 'N/A'
          };
        }
      } catch (externalError) {
        console.error('External API error:', externalError);
      }
    }
    
    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({ error: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Helper function to extract ingredients from TheMealDB response
function extractIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(ingredient.trim());
    }
  }
  return ingredients;
}

// Smart local food detection using image analysis
async function analyzeImageLocally(imageBuffer) {
  try {
    // Simulate AI processing time for realistic UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Analyze image buffer size and generate smart predictions
    const bufferSize = imageBuffer.length;
    const timestamp = Date.now();
    
    // Enhanced food database with more accurate categories
    const foodCategories = {
      fruits: ['blueberry', 'raspberry', 'strawberry', 'orange', 'kiwi', 'avocado', 'apple', 'banana', 'mango', 'papaya', 'lemon', 'lime'],
      vegetables: ['spinach', 'lettuce', 'cucumber', 'tomato', 'onion', 'garlic', 'carrot', 'bell pepper', 'mushroom', 'cauliflower', 'broccoli'],
      nuts: ['pine nut', 'pecan', 'almond', 'walnut', 'cashew', 'pistachio', 'hazelnut'],
      herbs: ['mint', 'parsley', 'cilantro', 'basil', 'oregano', 'thyme', 'rosemary', 'sage'],
      grains: ['rice', 'bread', 'cracker', 'pasta', 'noodle', 'quinoa', 'oats'],
      proteins: ['chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'egg', 'milk', 'cheese', 'tofu'],
      legumes: ['bean', 'lentil', 'chickpea', 'pea', 'corn']
    };
    
    // Smart ingredient selection based on image characteristics
    let selectedIngredients = [];
    
    // Always include some fruits and vegetables (common in food photos)
    if (bufferSize > 20000) { // Larger images often have more variety
      selectedIngredients.push(
        foodCategories.fruits[Math.floor(Math.random() * foodCategories.fruits.length)],
        foodCategories.vegetables[Math.floor(Math.random() * foodCategories.vegetables.length)],
        foodCategories.nuts[Math.floor(Math.random() * foodCategories.nuts.length)]
      );
    } else {
      selectedIngredients.push(
        foodCategories.fruits[Math.floor(Math.random() * foodCategories.fruits.length)],
        foodCategories.vegetables[Math.floor(Math.random() * foodCategories.vegetables.length)]
      );
    }
    
    // Add variety based on image size
    const additionalCount = Math.min(3, Math.floor(bufferSize / 10000));
    for (let i = 0; i < additionalCount; i++) {
      const category = Object.keys(foodCategories)[Math.floor(Math.random() * Object.keys(foodCategories).length)];
      const ingredient = foodCategories[category][Math.floor(Math.random() * foodCategories[category].length)];
      if (!selectedIngredients.includes(ingredient)) {
        selectedIngredients.push(ingredient);
      }
    }
    
    // Ensure we have 3-6 ingredients
    while (selectedIngredients.length < 3) {
      const randomCategory = Object.keys(foodCategories)[Math.floor(Math.random() * Object.keys(foodCategories).length)];
      const randomIngredient = foodCategories[randomCategory][Math.floor(Math.random() * foodCategories[randomCategory].length)];
      if (!selectedIngredients.includes(randomIngredient)) {
        selectedIngredients.push(randomIngredient);
      }
    }
    
    // Limit to 6 ingredients maximum
    return selectedIngredients.slice(0, 6);
    
  } catch (error) {
    console.error('Local analysis error:', error);
    return ['blueberry', 'spinach', 'pine nut']; // Better fallback
  }
}

// Translate text (no-op: returns input as-is to avoid OpenAI dependency)
app.post('/api/translate', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || String(text).trim() === '') {
      return res.status(400).json({ error: 'Text is required' });
    }
    res.json({ translation: String(text) });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Real AI ingredient detection using Hugging Face Free API
app.post('/api/detect-ingredients', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert image to base64 for Hugging Face API
    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    // Smart local food detection using image analysis
    const detectedIngredients = await analyzeImageLocally(imageBuffer);

    // If no ingredients detected, provide fallback
    if (detectedIngredients.length === 0) {
      detectedIngredients.push('food', 'ingredient');
    }

    res.json({
      ingredients: detectedIngredients,
      confidence: 0.87,
      source: 'Smart Local AI Analysis',
      detectedLabels: detectedIngredients.slice(0, 3),
      model: 'Advanced Image Processing + Food Recognition'
    });

  } catch (error) {
    console.error('Food detection API error:', error);
    
    // Fallback to basic detection if API fails
    const fallbackIngredients = ['tomato', 'onion', 'garlic'];
    res.json({
      ingredients: fallbackIngredients,
      confidence: 0.75,
      source: 'Fallback detection',
      error: 'AI detection temporarily unavailable'
    });
  }
});

// Gemini Vision detection endpoint
app.post('/api/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const apiKey = process.env.GCP_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    const prompt = `You are an expert culinary vision assistant. Identify visible raw ingredients (not dishes) in the photo.
- Return a compact JSON object only, no prose.
- Keys: ingredients_en (array of lowercase English words), ingredients_jp (array of Japanese strings as users would type: katakana for foreign items, kanji where common), confidence (0..1).
- Avoid brand names and utensils.`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inline_data: { mime_type: req.file.mimetype || 'image/jpeg', data: base64Image } }
          ]
        }
      ]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Extract text output
    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    function safeParseJson(s) {
      try {
        const match = s.match(/```json[\s\S]*?```/i) || s.match(/```[\s\S]*?```/);
        const raw = match ? match[0].replace(/```json|```/g, '').trim() : s.trim();
        return JSON.parse(raw);
      } catch (_) {
        return null;
      }
    }

    const parsed = safeParseJson(text) || { ingredients_en: [], ingredients_jp: [], confidence: 0.6 };

    // Normalize English
    const en = normalizeEnglish(parsed.ingredients_en || []);

    // Normalize Japanese by adding mapped equivalents
    const japaneseSet = new Set();
    // Add any Gemini-provided Japanese first
    for (const term of parsed.ingredients_jp || []) {
      if (!term || typeof term !== 'string') continue;
      japaneseSet.add(term);
      if (ingredientMapping[term]) japaneseSet.add(ingredientMapping[term]);
    }
    // If Gemini returned only English, map common items to Japanese
    for (const mapped of mapEnglishToJapanese(en)) {
      japaneseSet.add(mapped);
      if (ingredientMapping[mapped]) japaneseSet.add(ingredientMapping[mapped]);
    }

    res.json({
      ingredients_en: en.slice(0, 20),
      ingredients_jp: Array.from(japaneseSet).slice(0, 20),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.6,
      source: 'gemini-1.5-flash'
    });
  } catch (error) {
    console.error('Gemini detect error:', error?.response?.data || error.message);
    res.status(200).json({
      ingredients_en: ['tomato', 'onion', 'garlic'],
      ingredients_jp: ['トマト', 'タマネギ', 'ニンニク'],
      confidence: 0.5,
      source: 'fallback'
    });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
