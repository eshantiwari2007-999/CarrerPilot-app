<div align="center">

<img src="https://img.shields.io/badge/CareerPilot-AI%20Career%20Companion-6366f1?style=for-the-badge&logo=rocket&logoColor=white" alt="CareerPilot" height="60"/>

# CareerPilot ✈️

### AI-Powered Career Companion — Resume Builder · Interview Coach · Career Roadmaps

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://carrer-pilot-app.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://careerpilot-api-kowl.onrender.com/api/)
[![License](https://img.shields.io/badge/License-MIT-6366f1?style=for-the-badge)](LICENSE)
[![Made with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

<br/>

> **CareerPilot** is a full-stack AI SaaS application that acts as your personal career mentor.
> Chat with an AI coach, build ATS-optimized resumes, prep for interviews, get personalized career paths, and generate skill roadmaps — all in one place.

<br/>

[**🚀 Try Live Demo**](https://carrer-pilot-app.vercel.app) · [**📡 API Docs**](#-api-endpoints) · [**⚙️ Setup Guide**](#-getting-started) · [**🤝 Contribute**](CONTRIBUTING.md)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Career Chat** | Real-time chat with "Peter" — your AI career mentor powered by Google Gemini |
| 📄 **Resume Builder** | Generate ATS-optimized resumes from your profile data with one click |
| 🎤 **Interview Coach** | Submit interview Q&A and get structured feedback with STAR method guidance |
| 🗺️ **Career Roadmaps** | Personalized week-by-week learning roadmaps based on your goal and level |
| 🧭 **Career Suggestions** | AI-driven career path recommendations with salary ranges and top companies |
| 🔐 **Token Auth** | Secure JWT-style token authentication with email or username login |
| 📜 **Request History** | Full history of all your AI interactions, sorted newest-first |
| 🌙 **Premium UI** | Cinematic intro, smooth animations, glassmorphism dark theme |
| 🔄 **Smart Fallback** | Rule-based AI engine kicks in when Gemini quota is exceeded — zero downtime |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 6.3 | Build Tool & Dev Server |
| TailwindCSS | 4.x | Utility Styling |
| Framer Motion | 12.x | Animations |
| Radix UI | latest | Accessible Primitives |
| Axios | 1.x | HTTP Client |
| React Router | 7.x | Client-side Routing |
| Lucide React | latest | Icons |
| Sonner | 2.x | Toast Notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Language |
| Django | 5.2 | Web Framework |
| Django REST Framework | 3.15 | API Layer |
| django-cors-headers | 4.3 | CORS Handling |
| WhiteNoise | 6.6 | Static File Serving |
| Gunicorn | 21.x | Production WSGI Server |
| PostgreSQL | 15+ | Production Database |
| SQLite | - | Development Database |
| dj-database-url | 2.x | Database URL Parsing |

### AI & DevOps
| Technology | Purpose |
|---|---|
| Google Gemini 1.5 Flash | AI Chat, Resume Gen, Interview Feedback, Roadmaps |
| Vercel | Frontend Deployment (CDN + Edge) |
| Render | Backend Deployment (Auto-scaling) |
| GitHub Actions | Keep-alive cron to prevent Render sleep |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CareerPilot                              │
├────────────────────────┬────────────────────────────────────────┤
│     FRONTEND           │         BACKEND                        │
│  React + Vite + TS     │      Django + DRF                      │
│  Deployed: Vercel      │      Deployed: Render                  │
│                        │                                        │
│  ┌──────────────────┐  │  ┌─────────────────────────────────┐  │
│  │   CinematicIntro │  │  │  REST API (Token Auth)          │  │
│  │   MainProduct    │  │  │                                 │  │
│  │   ResumePage     │──┼──│  /api/generate/                 │  │
│  │   InterviewPage  │  │  │  /api/generate-resume/          │  │
│  │   CareerPage     │  │  │  /api/interview-feedback/       │  │
│  │   RoadmapPage    │  │  │  /api/career-suggestions/       │  │
│  └────────┬─────────┘  │  │  /api/generate-roadmap/         │  │
│           │            │  │  /api/history/                  │  │
│  ┌────────▼─────────┐  │  └──────────────┬──────────────────┘  │
│  │  Axios + Token   │  │                 │                      │
│  │  Interceptors    │  │  ┌──────────────▼──────────────────┐  │
│  │  Auth Context    │  │  │    Google Gemini 1.5 Flash      │  │
│  └──────────────────┘  │  │    Smart Fallback Engine        │  │
│                        │  └──────────────┬──────────────────┘  │
│                        │                 │                      │
│                        │  ┌──────────────▼──────────────────┐  │
│                        │  │  PostgreSQL (Prod)              │  │
│                        │  │  SQLite (Dev)                   │  │
│                        │  └─────────────────────────────────┘  │
└────────────────────────┴────────────────────────────────────────┘
```

**Key Design Decisions:**
- **Token Authentication** — DRF Token auth stored in `localStorage`, injected via Axios interceptor
- **Smart AI Fallback** — When Gemini quota is exceeded, a rule-based career engine responds intelligently with no user-visible errors
- **Dual DB Strategy** — SQLite for local dev (zero config), PostgreSQL for production via `DATABASE_URL` env var
- **CORS + CSRF** — Properly configured for cross-origin frontend-backend communication

---

## 🖥 Screenshots

> **Live app:** [carrer-pilot-app.vercel.app](https://carrer-pilot-app.vercel.app)

| Cinematic Intro | AI Chat Interface |
|---|---|
| ![Intro](https://carrer-pilot-app.vercel.app/og-intro.png) | ![Chat](https://carrer-pilot-app.vercel.app/og-chat.png) |

| Resume Builder | Career Roadmap |
|---|---|
| ![Resume](https://carrer-pilot-app.vercel.app/og-resume.png) | ![Roadmap](https://carrer-pilot-app.vercel.app/og-roadmap.png) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and **pnpm** (or npm)
- **Python** 3.11+
- **Git**

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/eshantiwari2007-999/CarrerPilot-app.git
cd CarrerPilot-app

# 2. Go to the backend directory
cd Backend

# 3. Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)

# 6. Run migrations
python manage.py migrate

# 7. (Optional) Create a superuser for the admin panel
python manage.py createsuperuser

# 8. Start the development server
python manage.py runserver
```

The backend API will be running at **http://127.0.0.1:8000/api/**

> **Tip:** Visit `http://127.0.0.1:8000/api/` in your browser to see the interactive DRF API root with all available endpoints.

---

### Frontend Setup

```bash
# From the repo root
cd "Frontend 2/CareerPilot AI Web App UI"

# Install dependencies (using pnpm — recommended)
pnpm install
# or with npm:
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local — set VITE_API_URL to your backend URL

# Start the development server
pnpm dev
# or: npm run dev
```

The frontend will be running at **http://localhost:5173**

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `SECRET_KEY` | ✅ | Django secret key — generate a strong random string | `your-secret-key-here` |
| `DEBUG` | ✅ | `True` for dev, `False` for production | `True` |
| `ALLOWED_HOSTS` | ✅ | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `DATABASE_URL` | ⚠️ Prod only | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `CORS_ALLOWED_ORIGINS` | ✅ | Comma-separated allowed frontend origins | `http://localhost:5173` |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key — get free at [ai.google.dev](https://ai.google.dev) | `AIzaSy...` |

### Frontend (`Frontend 2/CareerPilot AI Web App UI/.env.local`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | ✅ | Full URL to the Django backend API | `https://careerpilot-api-kowl.onrender.com/api/` |

---

## 📡 API Endpoints

**Base URL:** `https://careerpilot-api-kowl.onrender.com/api/`

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health/` | Public | Liveness probe |
| `POST` | `/signup/` | Public | Register new user, returns token |
| `POST` | `/login/` | Public | Login with username/email + password, returns token |
| `POST` | `/logout/` | 🔐 Token | Invalidate current token |
| `GET` | `/me/` | 🔐 Token | Get current user profile |

### AI Features

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/generate/` | 🔐 Token | AI career chat (prompt mode) or structured resume analysis |
| `POST` | `/generate-resume/` | 🔐 Token | Generate ATS-optimized resume from profile data |
| `POST` | `/interview-feedback/` | 🔐 Token | Evaluate interview answer with STAR feedback |
| `POST` | `/career-suggestions/` | 🔐 Token | Personalized career path recommendations |
| `POST` | `/generate-roadmap/` | 🔐 Token | Week-by-week learning roadmap |
| `GET` | `/history/` | 🔐 Token | All AI requests by the current user |

### Authentication Header
```
Authorization: Token <your-token-here>
```

### Example: Chat with AI
```bash
curl -X POST https://careerpilot-api-kowl.onrender.com/api/generate/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "How do I prepare for a senior software engineer interview?"}'
```

### Example: Generate Resume
```bash
curl -X POST https://careerpilot-api-kowl.onrender.com/api/generate-resume/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "role": "Full Stack Engineer",
    "skills": "React, Node.js, Python, PostgreSQL, Docker",
    "experience": "3 years at TechStartup Inc, built payment processing module",
    "education": "B.Tech Computer Science, XYZ University 2022"
  }'
```

---

## 🚢 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Set **Root Directory** to: `Frontend 2/CareerPilot AI Web App UI`
4. Set **Framework Preset** to: `Vite`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api/`
6. Click **Deploy**

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service** → Connect your GitHub repo
2. Set **Root Directory** to: `Backend`
3. Set **Build Command**: `./build.sh`
4. Set **Start Command**: `gunicorn CareerPilot_backend.wsgi`
5. Add environment variables (all from `Backend/.env.example`)
6. Add a **PostgreSQL** database on Render and set `DATABASE_URL`
7. Click **Deploy**

> **Keep-Alive:** A GitHub Action (`.github/workflows/keep_alive.yml`) pings the Render API every 14 minutes to prevent the free-tier sleep.

---

## 🗺 Roadmap

- [ ] **OAuth Login** — Google / GitHub social authentication
- [ ] **PDF Export** — Download AI-generated resumes as styled PDFs
- [ ] **Job Tracker** — Kanban board for tracking job applications
- [ ] **ATS Score** — Real-time resume scoring against a job description
- [ ] **Mock Interviews** — Structured 5-question interview sessions with scoring
- [ ] **Profile Builder** — Rich user profiles with skills, experience, education
- [ ] **Notifications** — Email follow-ups and weekly career tips
- [ ] **Mobile App** — React Native companion app

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

**Eshan Tiwari** — Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-eshantiwari2007--999-181717?style=flat-square&logo=github)](https://github.com/eshantiwari2007-999)

---

<div align="center">

Built with ❤️ using React, Django, and Google Gemini AI

⭐ **Star this repo** if CareerPilot helped you or if you find it useful!

</div>
