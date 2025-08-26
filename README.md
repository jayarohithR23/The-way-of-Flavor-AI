# The Way of Flavor AI (味の道AI)

Modern, minimal recipe assistant for non-cooks. Detect ingredients, find authentic Indian recipes first, and view step‑by‑step instructions with English ↔ Japanese support.

## Features
- Local-first: recipes stored in MongoDB (`recipe_assistant.recipes`)
- Ingredient detection (simple local heuristic, no external API)
- Search by detected or typed ingredients
- Bilingual UI (EN/JA) with instant toggle
- Clean React + Tailwind UI with landing page

## Tech
- Frontend: React 18, Vite, Tailwind, Framer Motion
- Backend: Node.js + Express, MongoDB
- Optional: OpenAI for on‑the‑fly translation (disabled by default)

## Quick Start
1) Install deps
   ```bash
   npm install
cd backend && npm install && cd ..
```

2) Create backend/.env
   ```env
# Required
MONGODB_URI=mongodb://localhost:27017/recipe_assistant
   PORT=5000

# Optional (only needed if you will call /api/translate)
OPENAI_API_KEY=your_openai_api_key

# External international recipes (TheMealDB). Default off.
ENABLE_EXTERNAL=false
```
Tip: You can use your MongoDB Atlas URI. The app uses DB name `recipe_assistant` unless you change it in `backend/server.js` (`dbName`).

3) Run
```bash
# Backend
cd backend
npm run dev
# Frontend (new terminal)
cd ..
npm run dev
```
- Frontend: http://localhost:3000
- Backend:  http://localhost:5000

## Useful Commands
```bash
# Production build (frontend)
npm run build && npm run preview
# Start backend in prod mode
cd backend && npm start
```

## Configuration Notes
- External recipes (international) are fetched from TheMealDB only when `ENABLE_EXTERNAL=true`. Otherwise only Indian recipes from your MongoDB are shown.
- Translations work without OpenAI because many recipes already include Japanese fields. `/api/translate` uses OpenAI only if you provide `OPENAI_API_KEY`.

## Project Structure
```
./
├── src/                # React app
│   ├── components/     # HomePage, Home, Navbar, etc.
│   ├── contexts/       # LanguageContext
│   └── main.jsx
├── backend/
│   ├── server.js       # Express API
│   ├── data/indian_recipes.json  # seed used on first run
│   └── env.example
└── README.md
```

## API (brief)
- `GET /api/health` – server status
- `GET /api/recipes` – all local recipes
- `GET /api/recipes/search?ingredients=a,b,c` – search (local + optional external)
- `GET /api/recipes/:id` – recipe by id (local; falls back to external if enabled)
- `POST /api/translate` – translate text (requires `OPENAI_API_KEY`)
- `POST /api/detect-ingredients` – detect ingredients from image (local heuristic)

## Contributing
PRs welcome. Keep code simple, accessible, and consistent with the current style.

## License
MIT
