# Clean .env.local File Guide

## Current Status
✅ Only one `.env.local` file found in project root
✅ No duplicate variables found in the file

## If You See Duplicate Files

### Check 1: File Explorer में Duplicate दिख रहा है?
- Windows File Explorer कभी-कभी files को duplicate दिखाता है
- Solution: File Explorer refresh करें (F5)

### Check 2: Different Locations में Files?
```powershell
# Check all .env files in project
Get-ChildItem -Path . -Recurse -Filter ".env*" -File -Force
```

### Check 3: Duplicate Variables in Same File?
अगर same variable दो बार define है, तो:
1. `.env.local` file खोलें
2. Duplicate lines find करें
3. एक line delete करें (latest value रखें)

## Recommended .env.local Structure

```env
# =====================================================
# SUPABASE CONFIGURATION
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# =====================================================
# SITE CONFIGURATION
# =====================================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=AI Tools Directory
```

## Clean Up Steps

### Step 1: Check for Duplicates
```powershell
# PowerShell में run करें
Get-Content .env.local | Select-String "^[A-Z_]+=" | Group-Object | Where-Object { $_.Count -gt 1 }
```

### Step 2: Remove Duplicates
अगर duplicates मिलें:
1. `.env.local` file खोलें
2. Duplicate lines find करें
3. Old/incorrect line delete करें
4. Latest/correct value रखें

### Step 3: Verify File
```powershell
# Check file content
Get-Content .env.local
```

## Important Notes

⚠️ **Only One .env.local File Should Exist:**
- Location: Project root (same level as `package.json`)
- Name: Exactly `.env.local` (not `.env.local.txt` or `.env.local (1)`)

❌ **Don't Have:**
- `.env` (use `.env.local` instead)
- `.env.local (1)` or `.env.local - Copy`
- Multiple `.env.local` files in different folders

✅ **Should Have:**
- One `.env.local` file in project root
- All required variables (no duplicates)

## If You Need to Recreate File

1. **Backup current file:**
```powershell
Copy-Item .env.local .env.local.backup
```

2. **Create clean file:**
```powershell
# Create new .env.local with template
@"
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=AI Tools Directory
"@ | Out-File -FilePath .env.local -Encoding utf8
```

3. **Add your actual values** from backup file

4. **Restart server:**
```bash
npm run dev
```

