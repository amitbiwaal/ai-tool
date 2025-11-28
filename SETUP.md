# Setup Guide for AI Tools Directory

This guide will walk you through setting up the AI Tools Directory from scratch.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- npm or yarn package manager
- A Supabase account (free tier works fine)
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

If you encounter any issues, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Set Up Supabase

#### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project
5. Wait for the project to be provisioned (takes 1-2 minutes)

#### 2.2 Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

#### 2.3 Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `lib/supabase/schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute

This will create all necessary tables, indexes, and security policies.

#### 2.4 Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure "Email" is enabled
3. Configure email templates if desired (optional)

#### 2.5 Configure OTP Email Template (Important for OTP Verification)

Agar aapko email me OTP code chahiye (Magic Link ke bajay), to:

1. Go to **Authentication** → **Email Templates**
2. Select **"Magic Link"** template
3. Update template to display OTP code prominently:

```html
<h2>Your OTP Code</h2>
<p>Use this 6-digit code to verify your email:</p>
<div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
  <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937; margin: 0;">
    {{ .Token }}
  </h1>
</div>
<p>Or click this link: <a href="{{ .ConfirmationURL }}">Log In</a></p>
```

4. Save the template
5. **{{ .Token }}** automatically contains the 6-digit OTP code

**Note:** Detailed instructions available in `OTP_EMAIL_SETUP.md`

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=AI Tools Directory

# Razorpay Configuration (for payment processing)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

**Important:** Replace the placeholder values with your actual Supabase credentials.

### 4. Seed the Database (Optional but Recommended)

To populate your database with sample data:

```bash
npm run seed
```

This will create:
- 12 categories (AI Writing, AI Art, AI Coding, etc.)
- 15 tags
- 6 sample AI tools (ChatGPT, Midjourney, GitHub Copilot, etc.)
- Relationships between tools, categories, and tags

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your Admin Account

1. Go to [http://localhost:3000/auth/register](http://localhost:3000/auth/register)
2. Create an account
3. Check your email for verification (in Supabase, go to **Authentication** → **Users** to see test emails)

#### 6.1 Make Your Account an Admin

1. In Supabase, go to **Table Editor** → **profiles**
2. Find your user record
3. Edit the `role` field and change it from `user` to `admin`
4. Save the change

Now you can access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

## Common Issues & Solutions

### Issue: "Invalid API Key" or Connection Errors

**Solution:** Double-check your `.env.local` file:
- Ensure there are no extra spaces
- Verify the keys are correct in Supabase dashboard
- Make sure you restarted the dev server after changing `.env.local`

### Issue: Database Tables Don't Exist

**Solution:** Re-run the SQL schema:
1. Go to Supabase SQL Editor
2. Run the entire `lib/supabase/schema.sql` file again
3. Check for any error messages

### Issue: Can't See Seeded Data

**Solution:** 
1. Check if the seed script ran successfully: `npm run seed`
2. In Supabase, go to **Table Editor** and manually verify the data
3. Make sure tools have `status = 'approved'`

### Issue: Authentication Not Working

**Solution:**
1. Verify email authentication is enabled in Supabase
2. Check that your environment variables are set correctly
3. Clear browser cookies and try again

### Issue: Row Level Security Errors

**Solution:** The RLS policies are included in the schema. If you're getting permission errors:
1. Ensure you ran the complete schema.sql file
2. Check that your user has the correct role in the profiles table

## Next Steps

Once everything is running:

1. **Explore the Site**
   - Browse tools at `/tools`
   - View categories at `/categories`
   - Try the search and filters

2. **Test User Features**
   - Create an account
   - Favorite some tools
   - Submit a new tool
   - Write a review

3. **Test Admin Features**
   - Access admin panel at `/admin`
   - Approve/reject tool submissions
   - Manage categories
   - View analytics

4. **Customize**
   - Update branding in `app/layout.tsx`
   - Modify colors in `tailwind.config.ts`
   - Add your own categories and tools

## Production Deployment

When you're ready to deploy:

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables (same as `.env.local`)
6. Deploy!

### Environment Variables for Production

Make sure to add these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (your production URL)
- `NEXT_PUBLIC_SITE_NAME`
- `RAZORPAY_KEY_ID` (your Razorpay Key ID)
- `RAZORPAY_KEY_SECRET` (your Razorpay Key Secret)

## Additional Configuration

### Email Templates

Customize authentication emails in Supabase:
1. Go to **Authentication** → **Email Templates**
2. Customize "Confirm signup", "Reset password", etc.

### Payment Gateway Setup (Razorpay)

To enable payment processing:

1. **Create a Razorpay Account**
   - Go to [razorpay.com](https://razorpay.com)
   - Sign up for a free account
   - Complete KYC verification (required for live payments)

2. **Get Your API Keys**
   - Go to **Settings** → **API Keys** in Razorpay Dashboard
   - Generate test keys (for development) or live keys (for production)
   - Copy your **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - Copy your **Key Secret**

3. **Add to Environment Variables**
   - Add `RAZORPAY_KEY_ID` to your `.env.local`
   - Add `RAZORPAY_KEY_SECRET` to your `.env.local`
   - **Important:** Never commit these keys to version control!

4. **Test Payments**
   - Use Razorpay test cards for testing
   - Test card: `4111 1111 1111 1111` (any CVV, any future expiry)
   - More test cards: [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)

### Storage (For Image Uploads)

If you want to allow users to upload images:
1. Go to **Storage** in Supabase
2. Create a new bucket (e.g., "tool-images")
3. Set appropriate policies
4. Update the file upload code in your forms

### Analytics

Consider adding:
- Google Analytics
- Plausible Analytics
- Or build custom analytics using Supabase

## Getting Help

If you encounter issues:
1. Check the README.md for detailed documentation
2. Review error messages in the browser console
3. Check Supabase logs in the dashboard
4. Open an issue on GitHub

## Success Checklist

- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables configured
- [ ] Development server running
- [ ] Database seeded
- [ ] Admin account created and role set
- [ ] Can view homepage
- [ ] Can see seeded tools
- [ ] Can login/register
- [ ] Can access admin panel

Once all items are checked, you're ready to go! 🚀

