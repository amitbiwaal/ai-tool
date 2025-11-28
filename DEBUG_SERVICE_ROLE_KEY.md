# Debug "Invalid API key" Error

अगर आपकी `.env.local` file में key सही है, फिर भी error आ रहा है, तो ये steps follow करें:

## Step 1: Verify Key Format

Service Role Key:
- ✅ Should start with `eyJ` (JWT token format)
- ✅ Should be long (usually 200+ characters)
- ✅ Should NOT have quotes around it
- ✅ Should NOT have extra spaces

Check करें:
```powershell
# PowerShell में run करें
Get-Content .env.local | Select-String "SERVICE_ROLE"
```

## Step 2: Verify You're Using Service Role Key

⚠️ **Important**: Make sure you're using **service_role** key, NOT **anon** key!

Supabase Dashboard में:
1. Settings → API
2. **Project API keys** section में:
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` के लिए
   - `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY` के लिए

## Step 3: Check .env.local File Format

File में ये format होना चाहिए:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTg3NjgwMCwiZXhwIjoxOTYxNDUyODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1ODc2ODAwLCJleHAiOjE5NjE0NTI4MDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

❌ **Wrong:**
```env
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."  # Quotes नहीं होने चाहिए
SUPABASE_SERVICE_ROLE_KEY= eyJhbGci...    # Space नहीं होना चाहिए
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...    # ✅ Correct
```

## Step 4: Restart Development Server

**CRITICAL**: Environment variables load करने के लिए server restart जरूरी है!

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Check Server Console

Server terminal में check करें:
- Key length log होगा
- Key के first 20 characters log होंगे
- अगर error आएगा, detailed logs दिखेंगे

## Step 6: Verify in Supabase Dashboard

1. Supabase Dashboard → Settings → API
2. Service Role Key को regenerate करें (if needed)
3. New key copy करें
4. `.env.local` में update करें
5. Server restart करें

## Common Issues:

### Issue 1: Wrong Key Type
- ❌ Using `anon` key instead of `service_role` key
- ✅ Solution: Use `service_role` key from Supabase Dashboard

### Issue 2: Key Not Loaded
- ❌ Server not restarted after adding key
- ✅ Solution: Restart server with `npm run dev`

### Issue 3: Format Issues
- ❌ Quotes, spaces, or newlines in key
- ✅ Solution: Remove all quotes and extra spaces

### Issue 4: Key Expired/Invalid
- ❌ Key was regenerated in Supabase but not updated in .env.local
- ✅ Solution: Get fresh key from Supabase and update .env.local

## Test Key Validity

Server console में ये logs दिखने चाहिए:
```
Using Supabase URL: https://xxxxx.supabase.co
Service Role Key (first 20 chars): eyJhbGciOiJIUzI1NiIs...
Service Role Key length: 200+
```

अगर ये logs नहीं दिख रहे, तो key properly load नहीं हो रहा।

