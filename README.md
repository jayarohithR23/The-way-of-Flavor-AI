# Ajinomichi AI – Ingredient → Indian Recipes

Find Indian recipes by typing ingredients (EN/JA) or uploading a photo. The app detects ingredients with Gemini Vision, maps Japanese kanji/katakana, and searches a MongoDB recipe DB.

## ✨ Features
- Image ingredient detection (Gemini Vision)
- Japanese/English UI toggle (chips show EN in EN mode, JP in JA mode)
- Katakana ↔ Kanji mapping for search (e.g., タマネギ/玉葱)
- 40+ curated Indian recipes with `ingredients_jp` and `instructions_jp`
- Backend: Node + Express + MongoDB (Atlas/Local)
- Frontend: React + Vite + Tailwind

## 📂 Project Structure
```
root/
  backend/          # Express API (MongoDB, detection, search)
  src/              # React app
  public/           # Static assets
```

## 🔑 Environment Variables
Create `backend/.env` (do not commit):
```
MONGODB_URI=your_mongodb_uri
GCP_GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```
Notes:
- OpenAI is not required. `/api/translate` is a no‑op and returns input as-is.

## 🚀 Run Locally
1) Backend
```
cd backend
npm install
npm run dev
```
- Health: http://localhost:5000/api/health → `{ status: 'OK' }`

2) Frontend
```
cd ..
npm install
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## 🧪 Test Ingredient Detection (PowerShell)
```
curl.exe -X POST -F "image=@C:\\path\\to\\food.jpg" http://localhost:5000/api/detect
```
Expected JSON:
```json
{
  "ingredients_en": ["chicken"],
  "ingredients_jp": ["鶏肉"],
  "confidence": 0.95,
  "source": "gemini-1.5-flash"
}
```
The UI will show English chips in EN mode and Japanese chips in JA mode.

## 🔎 Search API
- `GET /api/recipes/search?ingredients=トマト,玉葱` – supports EN and JA. JP mapping is bidirectional (katakana/kanji).
- `GET /api/recipes/:id` – recipe details (EN/JA fields available).
- `GET /api/recipes/reload` – reload DB from `backend/data/indian_recipes.json`.

## 🌐 Deployment
- Frontend: Vercel
  - Build: `npm run build`
  - Output: `dist`
  - Optional: `VITE_BACKEND_URL=https://your-backend.onrender.com`
- Backend: Render (Web Service)
  - Build: `npm install`
  - Start: `node server.js` (or `npm start`)
  - Env: set the backend `.env` vars above

## 🛠️ Troubleshooting
- Detection returns `{ error: 'Gemini API key not configured' }`
  - Ensure key is in `backend/.env`, restart backend.
- JA chips show English words
  - Hard refresh the frontend.
  - Ensure `/api/detect` returns `ingredients_jp` (backend maps common EN→JP automatically).
- No recipes found
  - Use common ingredients (e.g., 鶏肉, 米, 玉葱). You can reload DB via `/api/recipes/reload`.

## 📜 Scripts
- Backend: `npm run dev` (nodemon)
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## 🧹 Repo Hygiene
- `.gitignore` excludes `node_modules`, `dist`, logs, and env files
- Secrets live only in hosting env vars, not in the repo

Enjoy cooking with Ajinomichi AI! 🍛🇮🇳
