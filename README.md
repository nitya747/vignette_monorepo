# Vignette.ai 🎨🎥

> **AI-Powered YouTube Thumbnail Director**

Vignette.ai is a modern web application designed for YouTube creators to generate high-performing thumbnails. By blending AI-driven image generation and real-time template testing, Vignette.ai acts as a virtual art director to help creators stand out in the crowded YouTube feed.

---

## 🌟 Key Features

*   **Interactive 3D Mascot (`Three.js`)**: A procedural 3D camera mascot on the landing page that dynamically tracks the user's cursor, floats organically, and projects interactive drop shadows to create a playful, high-depth visual introduction.
*   **AI-Powered Thumbnail Generation**: Generate custom thumbnails powered by high-fidelity image models (via `fal.ai`).
*   **YouTube Live Preview Canvas**: Toggle mockup mock templates to preview exactly how your thumbnail appears on the real YouTube Home Feed, Watch Page sidebar, search results, and mobile layouts before downloading.
*   **Credit-Based Access**: Operates on a credit-based system, providing 5 free credits for non-premium users.
*   **User Library & Sandbox History**: Keep track of generated assets using a local fallback database or a production Supabase project schema.

---

## 🏗️ Monorepo Structure

Vignette.ai is organized as a private monorepo to separate concerns clearly while simplifying local development:

```text
vignette_monorepo/
├── frontend/               # React + Vite client-side app
│   ├── src/
│   │   ├── components/     # UI components (ThreeMascot, YoutubePreview, Generator, etc.)
│   │   ├── lib/            # Specs, prompt generators, image services
│   │   ├── App.jsx         # App router and central workspace UI
│   │   └── globals.css     # Dark mode, glassmorphism, and color system CSS
│   └── package.json
│
├── backend/                # Express + TypeScript server
│   ├── src/
│   │   ├── config/         # Environment variables & configurations
│   │   ├── middleware/     # Rate limiter, auth parser, error handlers, Zod validation
│   │   ├── providers/      # External client wrappers (OpenAI, Fal, Mock fallback)
│   │   ├── routes/         # Router mounts (generate, history)
│   │   └── services/       # Image generation logic
│   ├── Dockerfile
│   ├── railway.json
│   └── package.json
│
├── package.json            # Root configuration for workspace orchestrations
└── .env.local              # Local credentials overrides
```

---

## 🛠️ Technology Stack

### Frontend
*   **Core**: React 19, Vite (High-performance HMR bundling)
*   **Styling**: Vanilla CSS (Tailored glassmorphism design system, dark mode tokens, and Outfit typography)
*   **3D Graphics**: Three.js (Procedural geometries, custom drop shadow canvas textures, and animation loops)
*   **Icons**: Lucide React
*   **Backend Integration**: Supabase JS Client & React Router

### Backend
*   **Core**: Node.js, Express, TypeScript (running ESModules via `tsx` watch)
*   **Validation**: Zod (Statically typed request body validation schemas)
*   **Caching & Rate Limiting**: Upstash Redis & `@upstash/ratelimit`
*   **Logging**: Pino HTTP (with `pino-pretty` console colors)
*   **AI Integrations**:
    *   **Fal.ai**: Prompt-to-image and image-to-image Generation (Flux / SDXL models)

---

## 🚀 Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Clone & Install Dependencies
Run the installation script from the monorepo root to set up both `frontend` and `backend` projects:
```bash
# Install dependencies across all packages
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env.local` file at the **root** of the monorepo, or place individual configurations within the respective directory.

#### Backend variables:
```env
PORT=5000
NODE_ENV=development

# 1. AI APIs
FAL_KEY=your_fal_api_key

# 2. Redis Cache & Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# 3. Supabase Credentials
SUPABASE_URL=your_supabase_web_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

#### Frontend variables (`frontend/.env.local`):
```env
# If left empty, the client runs in local offline sandbox mode!
VITE_SUPABASE_URL=your_supabase_web_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> [!NOTE]
> **Graceful Failbacks**: If API keys or databases are omitted, the application runs in a local sandbox mode using mocks. The generation will use high-quality placeholder layouts, remaining 100% usable for local debugging.

### 3. Run Locally
Start the server and frontend concurrently from the root directory:
```bash
npm run dev
```
*   **Frontend client**: [http://localhost:5173](http://localhost:5173)
*   **Backend API**: [http://localhost:5000](http://localhost:5000)
*   **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🚢 Production Deployment

The backend contains a production-ready `Dockerfile` and `railway.json` schema configuration for instant cloud deployment (e.g. on [Railway](https://railway.app)).

To deploy:
1.  Push the monorepo to GitHub.
2.  Connect the repository to Railway.
3.  Ensure the environment variables listed in the Setup section are injected in the Railway Dashboard.
4.  Railway will detect the `Dockerfile` in the `backend` folder and run `node dist/server.js` following a successful TypeScript compilation build script (`tsc`).

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
