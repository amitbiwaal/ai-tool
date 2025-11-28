# Fix Next.js Chunk Loading Error

## Error: Failed to load chunk /_next/static/chunks/_d65ea870._.js

यह error usually development server के cache issue की वजह से होता है।

## Quick Fix Steps:

### 1. Stop Development Server
```powershell
# Ctrl+C press करें terminal में
# या PowerShell में:
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 2. Clear Next.js Cache
```powershell
# .next folder delete करें
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue

# node_modules cache clear करें
Remove-Item -Path node_modules\.cache -Recurse -Force -ErrorAction SilentlyContinue
```

### 3. Clear Browser Cache
- Browser में `Ctrl+Shift+Delete` press करें
- या Hard Refresh: `Ctrl+Shift+R` या `Ctrl+F5`

### 4. Restart Development Server
```bash
npm run dev
```

## Alternative Solutions:

### If error persists:

1. **Delete node_modules and reinstall:**
```powershell
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue
npm install
npm run dev
```

2. **Check Next.js version compatibility:**
```bash
npm list next react react-dom
```

3. **Disable Turbopack temporarily:**
Edit `package.json`:
```json
"dev": "next dev"
```
Instead of:
```json
"dev": "next dev --turbo"
```

4. **Clear all caches:**
```powershell
# Clear all Next.js related caches
Remove-Item -Path .next -Recurse -Force
Remove-Item -Path node_modules\.cache -Recurse -Force
Remove-Item -Path $env:TEMP\next-* -Recurse -Force -ErrorAction SilentlyContinue
```

## Why This Happens:

- **Hot Module Replacement (HMR) issues** - Development server cache corruption
- **Turbopack cache issues** - Next.js 15 Turbopack beta में कभी-कभी cache issues होते हैं
- **Browser cache** - Old chunks browser में cached हो सकते हैं
- **File system issues** - Windows file locking issues

## Prevention:

1. Regularly clear `.next` folder during development
2. Use `npm run dev` instead of `--turbo` if issues persist
3. Keep Next.js updated: `npm update next`

