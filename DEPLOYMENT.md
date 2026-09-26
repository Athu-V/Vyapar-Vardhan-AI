# 🚀 Live Deployment Guide - व्यापार वर्धन AI

This project is audited, hardened, and ready to go live.

---

## ⚡ Quick Deploy Options

### 1. Render.com (Recommended for `server.js` + Full Platform)
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New > Web Service**.
3. Select your GitHub repository.
4. Set configuration:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Health Check Path:** `/api/health`
5. Add Environment Variables:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API key)*
   - `GEMINI_MODEL`: `gemini-2.5-flash`

### 2. Railway.app
1. Go to [Railway](https://railway.app) and create a **New Project from GitHub Repo**.
2. Under **Variables**, add `GEMINI_API_KEY`.
3. Under **Networking**, click **Generate Domain**.

### 3. Vercel (For Next.js frontend in `src/app`)
1. Import repository on [Vercel](https://vercel.com).
2. Framework: Next.js.
3. Add Environment Variables and Deploy.

---

## 🧪 Verification Commands

```bash
# Run unit tests
npm test

# Verify TypeScript
npm run typecheck

# Build Next.js
npm run build

# Start local server
npm start
```
