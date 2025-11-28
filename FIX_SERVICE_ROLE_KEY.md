# Fix "Invalid API key" Error - Add New User

## Problem
"Invalid API key" error आ रहा है जब आप "Add New User" करने की कोशिश करते हैं।

## Solution

यह error `SUPABASE_SERVICE_ROLE_KEY` missing या invalid होने की वजह से आता है।

### Step 1: Get Service Role Key from Supabase

1. **Supabase Dashboard** में जाएं: https://app.supabase.com
2. अपना **project** select करें
3. **Settings** (⚙️) → **API** पर जाएं
4. **Project API keys** section में:
   - `service_role` key (secret) copy करें
   - ⚠️ **Important**: यह key secret है, इसे publicly share न करें

### Step 2: Add to .env.local File

Project root में `.env.local` file में add करें:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (for admin operations like creating users)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Verify

1. Browser में `/admin/users` page पर जाएं
2. "Add New User" button click करें
3. Form fill करें और create करें

## Important Notes

⚠️ **Security Warning:**
- `SUPABASE_SERVICE_ROLE_KEY` को **NEVER** commit करें Git में
- `.env.local` file को `.gitignore` में add करें
- यह key bypasses Row Level Security (RLS), इसलिए keep it secret

## Troubleshooting

### Error persists after adding key?

1. **Check .env.local file location:**
   - File project root में होनी चाहिए (same level as `package.json`)

2. **Check key format:**
   - Key में spaces नहीं होने चाहिए
   - Quotes की जरूरत नहीं है
   - Example: `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Restart server:**
   - Environment variables load करने के लिए server restart जरूरी है

4. **Check Supabase Dashboard:**
   - Service role key valid है या नहीं verify करें
   - Project active है या नहीं check करें

5. **Check console logs:**
   - Server terminal में error messages देखें
   - Browser console (F12) में network errors check करें

## Alternative: Use Anon Key (Not Recommended)

अगर service role key use नहीं कर सकते, तो आप Supabase Dashboard में:
1. **Authentication** → **Policies** में
2. Admin users के लिए special RLS policy add कर सकते हैं

लेकिन **recommended approach** service role key use करना है क्योंकि:
- More secure
- Better control
- Admin operations के लिए designed है

