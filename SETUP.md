# StudentBoard - Setup & Deployment Guide

> **Study smarter. Pass your exams.**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Supabase Setup](#supabase-setup)
4. [Google OAuth Setup](#google-oauth-setup)
5. [PostHog Analytics Setup](#posthog-analytics-setup)
6. [Running Locally](#running-locally)
7. [Deploy to Digital Ocean](#deploy-to-digital-ocean)

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (comes with Node.js)
- **Git**
- A **Supabase** account (free tier: https://supabase.com)
- A **Google Cloud** account (for Google OAuth)
- A **Digital Ocean** account (for deployment)
- (Optional) A **PostHog** account (free tier: https://posthog.com)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url> studentboard
cd studentboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual keys (see Supabase Setup below).

---

## Supabase Setup

### 1. Create a Supabase project

1. Go to https://supabase.com/dashboard
2. Click **"New project"**
3. Choose a name (e.g., `studentboard`), set a strong database password, select a region
4. Wait for the project to be created

### 2. Get your API keys

Go to **Settings → API** in your Supabase dashboard:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

Paste these into your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 3. Run the database schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Open `supabase/schema.sql` from this project
3. Copy the entire contents and paste into the SQL Editor
4. Click **"Run"**
5. You should see "Success. No rows returned" — that's correct

### 4. Seed the template data

1. Still in the SQL Editor, open a new query
2. Open `supabase/seed.sql` from this project
3. Copy the entire contents and paste into the SQL Editor
4. Click **"Run"**
5. Verify: run `SELECT count(*) FROM subjects;` — should return **14** (7 subjects × 2 grades)
6. Verify: run `SELECT count(*) FROM template_cards;` — should return **112** (14 templates × 8 cards)

### 5. Enable Email/Password auth

1. Go to **Authentication → Providers** in Supabase dashboard
2. **Email** provider should be enabled by default
3. Under Email provider settings:
   - Disable **"Confirm email"** for MVP (so users don't need to verify email)
   - Or keep it enabled if you prefer email confirmation

---

## Google OAuth Setup

### 1. Create a Google Cloud project

1. Go to https://console.cloud.google.com
2. Create a new project (e.g., `StudentBoard`)
3. Go to **APIs & Services → OAuth consent screen**
4. Select **External**, fill in app name, support email, etc.
5. Add scopes: `email`, `profile`, `openid`
6. Add test users (your email) if in testing mode

### 2. Create OAuth credentials

1. Go to **APIs & Services → Credentials**
2. Click **"Create Credentials" → "OAuth 2.0 Client ID"**
3. Application type: **Web application**
4. Authorized JavaScript origins:
   - `http://localhost:3000` (for local dev)
   - `https://your-domain.com` (for production)
5. Authorized redirect URIs:
   - `https://<your-supabase-project>.supabase.co/auth/v1/callback`
6. Copy the **Client ID** and **Client Secret**

### 3. Configure Google provider in Supabase

1. Go to **Authentication → Providers → Google** in Supabase dashboard
2. Enable Google provider
3. Paste your **Client ID** and **Client Secret**
4. Save

---

## PostHog Analytics Setup

(Optional but recommended for user validation)

### 1. Create a PostHog account

1. Go to https://posthog.com and sign up (free tier)
2. Create a new project

### 2. Get your project API key

1. Go to **Settings → Project** in PostHog
2. Copy the **Project API Key**

### 3. Add to environment variables

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

If you skip PostHog, the app will work fine — analytics calls are no-ops when the key is missing.

---

## Running Locally

```bash
# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser (use mobile dev tools for best experience).

### What to test

1. **Sign up** with email/password or Google
2. **Create a board**: Select Grade 10 → Mathematics → Create
3. **View the board**: Cards should appear in "Not Started"
4. **Move cards**: Tap "Start" to move to "In Progress"
5. **Open a card**: Tap to see checklist + notes
6. **Check items**: Toggle checklist items
7. **Dashboard**: Go Home to see progress and "Today's Tasks"
8. **Reset board**: Go to board Settings → Reset Board

---

## Deploy to Digital Ocean

### Option A: App Platform (Recommended - easiest)

Digital Ocean App Platform auto-deploys from your Git repo.

#### 1. Push code to GitHub/GitLab

```bash
git init
git add .
git commit -m "Initial commit - StudentBoard MVP"
git remote add origin <your-repo-url>
git push -u origin main
```

#### 2. Create an App on Digital Ocean

1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Select your **GitHub repo**
4. Digital Ocean will detect the Dockerfile automatically

#### 3. Configure environment variables

In the App settings, add these environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_POSTHOG_KEY` | Your PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g., `https://studentboard-xxxxx.ondigitalocean.app`) |

**Important**: For `NEXT_PUBLIC_*` variables, mark them as **Build-time** environment variables (since Next.js inlines them at build time).

#### 4. Configure build settings

- **Dockerfile path**: `Dockerfile`
- **Port**: `3000`

#### 5. Deploy

Click **"Create Resources"**. Digital Ocean will:
1. Pull your code
2. Build the Docker image
3. Deploy it

Your app will be live at `https://studentboard-xxxxx.ondigitalocean.app`.

#### 6. Update Google OAuth redirect URI

Add your production URL to:
- Google Cloud Console → Authorized JavaScript origins
- Google Cloud Console → Authorized redirect URIs (the Supabase callback URL stays the same)

### Option B: Droplet with Docker (more control)

#### 1. Create a Droplet

1. Go to Digital Ocean → Create → Droplets
2. Choose **Ubuntu 24.04**
3. Plan: **Basic $6/mo** (1 vCPU, 1GB RAM) is enough for MVP
4. Add your SSH key

#### 2. SSH into the Droplet

```bash
ssh root@<your-droplet-ip>
```

#### 3. Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

#### 4. Clone and build

```bash
git clone <your-repo-url> /app/studentboard
cd /app/studentboard
```

#### 5. Build the Docker image

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb... \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY=phc_xxx \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com \
  --build-arg NEXT_PUBLIC_APP_URL=https://yourdomain.com \
  -t studentboard .
```

#### 6. Run the container

```bash
docker run -d \
  --name studentboard \
  -p 3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY=eyJhb... \
  --restart unless-stopped \
  studentboard
```

#### 7. Set up a reverse proxy (optional but recommended)

Install Nginx + Certbot for SSL:

```bash
apt install nginx certbot python3-certbot-nginx -y
```

Create `/etc/nginx/sites-available/studentboard`:

```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and get SSL:

```bash
ln -s /etc/nginx/sites-available/studentboard /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d yourdomain.com
```

---

## Estimated Costs (MVP)

| Service | Plan | Monthly Cost |
|---|---|---|
| Supabase | Free tier | $0 |
| Digital Ocean App Platform | Basic | ~$5 |
| PostHog | Free tier | $0 |
| Domain (optional) | .com | ~$1/mo |
| **Total** | | **$5-6/month** |

---

## Post-Deployment Checklist

- [ ] Schema and seed data loaded in Supabase
- [ ] Google OAuth configured and working
- [ ] Test signup + login (email + Google)
- [ ] Test board creation (Grade 10 + Grade 11)
- [ ] Test card movement (Not Started → In Progress → Done)
- [ ] Test checklist toggling
- [ ] Test board reset
- [ ] PostHog receiving events
- [ ] Mobile UI tested on actual phone

---

## Common Issues

### "No template found" when creating a board
→ Make sure you ran `supabase/seed.sql` in the SQL Editor.

### Google login redirects to error page
→ Check that the Supabase callback URL is added to Google Cloud Console redirect URIs:
`https://<your-project>.supabase.co/auth/v1/callback`

### Cards not showing after board creation
→ Check the browser console for errors. Verify RLS policies are correctly applied by running `SELECT * FROM cards LIMIT 5;` in Supabase SQL Editor.

### Environment variables not working in production
→ `NEXT_PUBLIC_*` variables must be available at **build time** (not just runtime). Make sure they're set as build-time env vars in Digital Ocean, or passed as `--build-arg` in Docker.
