# 😀 Patent Tracking - Free Cloud Deployment Guide

This guide explains how to deploy **Patent Tracking** (FastAPI Backend + React Frontend) to **100% Free Cloud Hosting** in less than 5 minutes.

---

## 🎯 Recommended Deployment Architecture

| Component | Platform | Free Tier Features |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** (or Render Static Site) | Unlimited free bandwidth, automatic HTTPS, global CDN, instant Git deploys |
| **Backend** | **Render.com** (or Railway / Koyeb) | Free Python Web Service, automatic HTTPS, automatic DB seeding on startup |

---

## 📋 STEP 1: Push Code to GitHub

Make sure all your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Prepare production cloud deployment"
git push origin main
```
*Your repository URL: `https://github.com/naga-akshya-k/patent-tracking`*

---

## 🐽 STEP 2: Deploy Backend to Render.com (Free)
1. Go to [https://render.com](https://render.com) and **Sign In with GitHub**.
2. Click **New ++* -> **Web Service**.
3. Select your GitHub repository: `patent-tracking`.
4. Configure the Web Service:
   * **Name**: `patent-tracking-backend`
   * **Region**: Choose closest to you (e.g. *Singapore* or *Oregon*)
   * **Root Directory**: `backend`
   * **Environment**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Instance Type**: **Free**
5. Under **Environment Variables**, add:
   * `SECRET_KEY` = (Click Generate or type a random string like `super_secret_patent_key_2026`)J   * `PYTHON_VERSION` = `3.10.12`
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://patent-tracking-backend.onrender.com`).

---

## ⚡ STEP 3: Deploy Frontend to Vercel (Free)
1. Go to [https://vercel.com](https://vercel.com) and **Sign In with GitHub**.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `patent-tracking`.
4. Configure the Project:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Click *Edit* and select **`frontend`**
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist` 
5. Expand **Environment Variables** and add:
   * **Key**: `VITE_API_URL`
   * **Value**: Your Render Backend URL from Step 2 (e.g., `https://patent-tracking-backend.onrender.com`)
6. Click **Deploy**.
7. In ~30 seconds, Vercel will give you a live production URL (e.g., `https://patent-tracking.vercel.app`)!

---

## 🔄 Alternative: 1-Click Render Blueprint (Deploy Both Together)

We have pre-configured `render.yaml` at the root of your project:
1. In [Render Dashboard](https://dashboard.render.com), click **New ++* -> **Blueprint**.
2. Connect your `patent-tracking` repository.
3. Render will automatically detect `render.yaml` and create both the Backend API and Frontend Static Site together!
4. Click **Apply** to deploy both in one click.

---

## 🔑 Production Login Credentials (Auto-Seeded)

when the backend starts up on Render, it automatically seeds the initial 13-department institutional database:

| Role | Username | Password |
| :--- | :--- | :--- |
| **IP Cell Admin / Super Admin** | `admin` | `admin123` |
| **CSE Department Coordinator** | `cse_coordinator` | `coord123` |
| **Management / IQAC Auditor** | `auditor` | `auditor123` |
| **Student Innovator** | `student` | `student123` |

*(You can also use the one-click demo login selector on the live login page!)*
