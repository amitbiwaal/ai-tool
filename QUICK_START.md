# 🚀 Quick Start Guide

## ✅ Updated to Next.js 15 + React 19

The project is now running the latest versions!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create `.env.local` File

Create a file named `.env.local` in the root directory with this content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=AI Tools Directory

# Google Analytics & Verification (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
```

## Step 3: Get Supabase Credentials

### Option A: Already Have Supabase? 
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Option B: New to Supabase?
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Click **"New Project"**
4. Fill in:
   - Project name: `ai-tools-directory`
   - Database password: (save this!)
   - Region: Choose closest to you
5. Wait 1-2 minutes for setup
6. Follow "Option A" above to get credentials

## Step 4: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `lib/supabase/schema.sql` in your editor
4. Copy **all** the contents
5. Paste into Supabase SQL editor
6. Click **"Run"**

✅ This creates all tables, security policies, and indexes

## Step 5: Seed Sample Data (Optional)

```bash
npm run seed
```

This adds:
- 12 categories (AI Writing, AI Art, etc.)
- 15 tags
- 6 sample tools (ChatGPT, Midjourney, etc.)

## Step 6: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## What's New in Next.js 15?

✅ **Turbopack** - Super fast dev server (run with `npm run dev`)
✅ **React 19** - Latest React features
✅ **@supabase/ssr** - New Supabase package for better Next.js integration
✅ **Improved performance** - Faster builds and hot reload
✅ **Better TypeScript** - Enhanced type safety

---

## Troubleshooting

### Error: "Supabase URL required"
- Make sure `.env.local` exists in the root folder
- Check that all 3 Supabase variables are filled in
- Restart the dev server: `Ctrl+C` then `npm run dev`

### Error: "Table doesn't exist"
- Run the database schema in Supabase SQL Editor
- Make sure you ran the **entire** `schema.sql` file

### Still Having Issues?
1. Delete `node_modules` and `.next` folders
2. Run `npm install` again
3. Make sure Supabase project is active
4. Check the detailed **SETUP.md** file

---

## Next Steps

Once running:

1. **Create Admin Account**
   - Register at `/auth/register`
   - In Supabase: **Table Editor** → **profiles** → change `role` to `admin`

2. **Access Admin Panel**
   - Go to `/admin`
   - Approve/manage tools

3. **Explore Features**
   - Browse tools: `/tools`
   - Categories: `/categories`
   - Submit a tool: `/submit`

---

Need more help? Check **SETUP.md** for detailed instructions!

