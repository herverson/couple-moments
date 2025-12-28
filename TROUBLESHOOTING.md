# Troubleshooting Guide

Common issues and their solutions for the Couple Moments project.

---

## 🔧 Setup Issues

### Issue: "OAUTH_SERVER_URL is not configured"

**Error Message:**
```
[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable.
```

**Solution:**
This is an optional configuration for Manus OAuth integration. Add to your `.env` file:
```bash
OAUTH_SERVER_URL=
```
Leave it empty if you're not using Manus OAuth.

---

### Issue: "Cannot apply unknown utility class `romantic-border`"

**Error Message:**
```
[plugin:@tailwindcss/vite:generate:serve] Cannot apply unknown utility class `romantic-border`
```

**Solution:**
This was caused by a circular reference in Tailwind CSS classes. **Already fixed** in the latest version.

If you still see this:
1. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   pnpm dev
   ```

2. If problem persists, reinstall dependencies:
   ```bash
   rm -rf node_modules
   pnpm install
   pnpm dev
   ```

---

### Issue: "import.meta.dirname undefined"

**Error Message:**
```
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
```

**Solution:**
This is caused by using Node.js version that doesn't support `import.meta.dirname`. **Already fixed** using `fileURLToPath`.

Recommended:
- Use Node.js 20+ (LTS)
- If you must use Node 18, the fix is already in place

Check your Node version:
```bash
node --version
```

Update Node if needed:
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from https://nodejs.org/
```

---

### Issue: "Port 5173 already in use"

**Solution:**
Kill the process using the port:
```bash
# On macOS/Linux
lsof -ti:5173 | xargs kill

# Or specify a different port
pnpm dev -- --port 5174
```

---

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution:**
Dependencies not installed. Run:
```bash
pnpm install
```

If the issue persists:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 🗄️ Supabase Issues

### Issue: "Failed to fetch couple data"

**Possible Causes:**
1. Supabase credentials not configured
2. RLS policies not set up
3. Database tables not created

**Solution:**

1. **Check environment variables** in `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Verify Supabase setup**:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Check that tables exist: `couples`, `photos`, `youtube_videos`, `romantic_phrases`

3. **Run SQL setup script**:
   - Open SQL Editor in Supabase Dashboard
   - Run the contents of `supabase-setup.sql`

4. **Check RLS policies**:
   - Go to Database > Tables
   - Select a table
   - Click "Policies" tab
   - Ensure RLS is enabled and policies are configured

---

### Issue: "Photo upload fails"

**Possible Causes:**
1. Storage bucket not created
2. Storage policies not configured
3. File size too large

**Solution:**

1. **Create storage bucket**:
   - Go to Storage in Supabase Dashboard
   - Create bucket named `couple-photos`
   - Set to Public

2. **Check bucket policies**:
   ```sql
   -- Should be in supabase-setup.sql
   CREATE POLICY "Couples can upload photos"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'couple-photos');
   ```

3. **Check file size**:
   - Default limit is usually 50MB
   - Compress images before upload if needed

---

### Issue: "Authentication not working"

**Possible Causes:**
1. OAuth not configured in Supabase
2. Redirect URLs not set up

**Solution:**

1. **Configure Google OAuth**:
   - Supabase Dashboard > Authentication > Providers
   - Enable Google provider
   - Add Client ID and Secret
   - Add redirect URLs:
     - Development: `http://localhost:5173/auth/callback`
     - Production: `https://your-domain.com/auth/callback`

2. **Check redirect URLs**:
   - Must match exactly (including http/https)
   - No trailing slashes

---

## 🎨 Build Issues

### Issue: "Build fails with TypeScript errors"

**Solution:**

1. **Run type check**:
   ```bash
   pnpm check
   ```

2. **If errors appear**, fix them in the source files

3. **Clear cache and rebuild**:
   ```bash
   rm -rf node_modules/.vite dist
   pnpm install
   pnpm build
   ```

---

### Issue: "Build output too large"

**Solution:**
This shouldn't happen with the optimizations in place, but if it does:

1. **Check bundle size**:
   ```bash
   pnpm build
   ls -lh dist/public/assets/
   ```

2. **Analyze bundle**:
   ```bash
   pnpm build --stats
   npx vite-bundle-visualizer
   ```

3. **Remove unused dependencies**:
   ```bash
   pnpm prune
   ```

---

## 🌐 Runtime Issues

### Issue: "Images not loading"

**Possible Causes:**
1. Supabase Storage not configured
2. Wrong S3 URL
3. CORS issues

**Solution:**

1. **Check Storage bucket**:
   - Verify `couple-photos` bucket exists
   - Check bucket is set to Public

2. **Check image URLs**:
   - Should start with your Supabase URL
   - Format: `https://your-project.supabase.co/storage/v1/object/public/couple-photos/...`

3. **Check browser console** for CORS errors

---

### Issue: "YouTube videos not showing"

**Possible Causes:**
1. Invalid video ID
2. Video is private/deleted
3. iframe blocked by CSP

**Solution:**

1. **Verify video ID**:
   - Test URL: `https://www.youtube.com/watch?v={video_id}`
   - Should be exactly 11 characters

2. **Check video accessibility**:
   - Open video in incognito mode
   - Ensure it's not private or region-restricted

3. **Check Content Security Policy** (if using custom headers)

---

### Issue: "Timer not updating"

**Solution:**
This is usually a React render issue:

1. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

2. **Clear browser cache**

3. **Check browser console** for JavaScript errors

---

## 💻 Development Issues

### Issue: "Hot reload not working"

**Solution:**

1. **Restart dev server**:
   ```bash
   # Press Ctrl+C to stop
   pnpm dev
   ```

2. **Clear Vite cache**:
   ```bash
   rm -rf node_modules/.vite
   pnpm dev
   ```

3. **Check file watchers** (Linux):
   ```bash
   # Increase limit
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

---

### Issue: "TypeScript not detecting changes"

**Solution:**

1. **Restart TypeScript server** in VS Code:
   - Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
   - Type "TypeScript: Restart TS Server"

2. **Check tsconfig.json** is valid

3. **Reinstall TypeScript**:
   ```bash
   pnpm add -D typescript
   ```

---

## 🚀 Deployment Issues

### Issue: "Build succeeds locally but fails on Vercel/Netlify"

**Possible Causes:**
1. Environment variables not set
2. Node version mismatch
3. Build command incorrect

**Solution:**

1. **Set environment variables** in platform dashboard

2. **Check Node version**:
   - Vercel/Netlify should use Node 20
   - Set in project settings or `.nvmrc`

3. **Verify build command**:
   ```bash
   pnpm build
   ```

4. **Check build logs** for specific errors

---

### Issue: "Deployed app shows blank page"

**Solution:**

1. **Check browser console** for errors

2. **Verify environment variables** are set in production

3. **Check Supabase URL**:
   - Should use production Supabase URL
   - Not localhost

4. **Check build output**:
   - Files should be in `dist/public`
   - `index.html` should exist

---

## 🔍 Debugging Tips

### Enable Verbose Logging

Add to `.env`:
```bash
VITE_DEBUG=true
```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Check for failed requests

### React DevTools

Install React DevTools browser extension:
- Chrome: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org/firefox

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click on "Logs" in sidebar
3. Filter by "Database" or "API"
4. Look for errors

---

## 📞 Getting Help

If your issue isn't covered here:

1. **Check documentation**:
   - README.md
   - DEPLOYMENT.md
   - CROSS_BROWSER_TESTING.md

2. **Search existing issues** on GitHub

3. **Create a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Error messages (full stack trace)
   - Environment details:
     - Node version: `node --version`
     - pnpm version: `pnpm --version`
     - OS: macOS/Windows/Linux

4. **Provide context**:
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?

---

## 🛠️ Maintenance Commands

### Clean Everything
```bash
# Nuclear option - start fresh
rm -rf node_modules pnpm-lock.yaml .vite dist
pnpm install
pnpm dev
```

### Update Dependencies
```bash
# Check for updates
pnpm outdated

# Update all
pnpm update

# Update specific package
pnpm update <package-name>
```

### Check for Security Issues
```bash
pnpm audit

# Fix automatically
pnpm audit --fix
```

---

**Last Updated**: December 28, 2025  
**Version**: 1.0.0

For more help, consult the [Quick Reference Guide](QUICK_REFERENCE.md).

