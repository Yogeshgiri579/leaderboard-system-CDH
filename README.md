# CloudDevOpsHub LinkedIn Community Leaderboard Platform 🚀

A full-stack, enterprise-grade community engagement and leaderboard platform designed for the **CloudDevOpsHub** community mentored by **Vikas Ratnawat**.

The platform automatically indexes members' LinkedIn contributions using the **Apify LinkedIn Post Scraper**, audits post semantics and mentor mentions using **AI Content Analysis**, calculates ranked points, awards **Module Expert Badges**, and displays a real-time leaderboard with an interactive UI.

---

## 🌟 Features

- **🏆 Dynamic Real-time Leaderboard**:
  - Top 3 Podium Cards with Gold, Silver, and Bronze spotlights.
  - Search members by name or LinkedIn URL.
  - Filter rankings by Cohort Batch (e.g., Batch 1 - Alpha, Batch 2 - Superstars, Batch 3 - Rising Stars).
- **📋 Community Participation & Points Rules**:
  - Top instructions detailing how posts are verified and scored.
  - Mandatory mention validation: Mentor **Vikas Ratnawat** & `#CloudDevOpsHub`.
  - Base points (+50 pts) + Mentorship tag (+30 pts) + AI depth bonus (up to +25 pts) + Engagement boost.
- **🧭 How to Become a Module Expert Roadmap**:
  - Step-by-step guidance on publishing architecture write-ups and repos.
  - Automated badges: *K8s & Container Master*, *IaC & Infrastructure Architect*, *GitOps & CI/CD Pioneer*, *AWS Cloud Solutions Pro*.
- **🌐 Apify Profile Post Scraper Integration**:
  - Scrapes public posts using Apify (`apify-client`).
  - Safe, realistic simulator fallback for zero-downtime local testing without consuming credits.
- **🤖 AI Post Analyzer**:
  - Evaluates DevOps technical content (Kubernetes, AWS, Docker, Terraform, CI/CD, Observability).
  - Verifies presence of mentor tags for Vikas Ratnawat.
  - Generates transparent reasoning and confidence score for every post.
- **🔍 Inspect Scraped Posts Modal**:
  - Inspect any member's scraped LinkedIn posts, AI verification status, and earned points.

---

## 🏗️ Project Structure

```
Leadboard/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── InstructionBanner.jsx   # Top guidelines & points
│   │   │   ├── LeaderboardTable.jsx    # Top 3 podium + ranked list
│   │   │   ├── ModuleExpertGuide.jsx   # Roadmap to become Module Expert
│   │   │   ├── StatsOverview.jsx       # High-level stats counters
│   │   │   ├── UserSubmitModal.jsx     # Profile submission modal
│   │   │   └── UserPostsModal.jsx      # AI post inspector modal
│   │   ├── services/
│   │   │   └── api.js                  # Axios client
│   │   ├── App.jsx
│   │   ├── index.css                   # Glassmorphism dark-mode styling
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                   # MongoDB connection with graceful offline mode
│   │   ├── models/
│   │   │   ├── User.js                 # User schema (points, rank, badges)
│   │   │   └── Post.js                 # Scraped posts schema (AI analysis, scores)
│   │   ├── services/
│   │   │   ├── apifyScraper.js         # Apify post scraper service + simulator
│   │   │   ├── aiAnalyzer.js           # AI Post Auditor (Vikas Ratnawat & DevOps tags)
│   │   │   └── pointsEngine.js         # Points & Module Expert evaluation engine
│   │   ├── controllers/
│   │   │   ├── userController.js       # Submit, sync, and inspect user posts
│   │   │   └── leaderboardController.js# Leaderboard rankings & statistics
│   │   ├── routes/
│   │   │   ├── userRoutes.js
│   │   │   └── leaderboardRoutes.js
│   │   ├── utils/
│   │   │   └── seedData.js             # Initial cohort sample data & in-memory cache
│   │   └── server.js                   # API entry point
│   ├── .env.example
│   └── package.json
│
├── package.json                # Root concurrent runner scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
In the root directory, install dependencies across both server and client:
```bash
npm run install:all
```
Or install individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/clouddevopshub_leaderboard
APIFY_API_TOKEN=your_apify_api_token_here     # (Optional: Leave empty for built-in simulator)
GEMINI_API_KEY=your_gemini_api_key_here       # (Optional: Leave empty for built-in NLP heuristics)
```

### 3. Run Development Servers
From the root directory:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/leaderboard` | Get ranked leaderboard (supports `?batch=` and `?search=`) |
| `GET` | `/api/leaderboard/stats` | Get community statistics (total members, verified posts, points) |
| `POST` | `/api/users/submit` | Submit / sync LinkedIn profile, scrape posts, and run AI analysis |
| `GET` | `/api/users/:userId/posts` | Retrieve all scraped and AI-analyzed posts for a member |
