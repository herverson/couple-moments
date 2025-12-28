# Quick Reference Guide

Quick commands and configurations for the Couple Moments project.

---

## 🚀 Common Commands

### Development
```bash
pnpm dev              # Start development server
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier
pnpm test             # Run tests
pnpm test --watch     # Run tests in watch mode
```

### Building
```bash
pnpm build            # Build for production
pnpm preview          # Preview production build
```

### Database
```bash
pnpm db:push          # Apply database migrations
```

---

## 📁 Project Structure

```
couple-moments/
├── client/src/
│   ├── components/      # React components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom hooks
│   ├── contexts/       # React contexts
│   └── lib/            # Utilities
├── server/
│   ├── _core/          # Core server logic
│   └── api/            # API routes
└── docs/               # Documentation
```

---

## 🔧 Environment Variables

### Required Variables
Create a `.env` file in the project root:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OAuth Configuration (optional, for Manus OAuth)
OAUTH_SERVER_URL=

# Node Environment
NODE_ENV=development

# Application URL (optional)
VITE_APP_URL=http://localhost:5173
```

### Where to Set
- **Development**: `.env` file in project root
- **Production**: Platform settings (Vercel, Netlify, etc.)

### First Time Setup
1. Copy the template above to a new `.env` file
2. Get your Supabase credentials from https://supabase.com/dashboard
3. Replace `your-project` and `your-anon-key-here` with your actual values
4. Leave `OAUTH_SERVER_URL` empty if not using Manus OAuth

---

## 🎨 Key Components

### PhotoGallery
```typescript
<PhotoGallery
  photos={photos}
  coupleId={coupleId}
  onPhotoAdded={() => fetchPhotos()}
  onPhotoDeleted={() => fetchPhotos()}
  isLoading={loading}
/>
```

### YoutubeGallery
```typescript
<YoutubeGallery
  videos={videos}
  coupleId={coupleId}
  onVideoAdded={() => fetchVideos()}
  onVideoDeleted={() => fetchVideos()}
  isLoading={loading}
/>
```

### RelationshipTimer
```typescript
<RelationshipTimer startDate={couple.relationship_start_date} />
```

### RomanticPhrases
```typescript
<RomanticPhrases />
```

---

## 🗄️ Supabase

### Tables
- `couples` - Couple profiles
- `photos` - Photo metadata
- `youtube_videos` - Video links
- `romantic_phrases` - Romantic quotes

### Storage Buckets
- `couple-photos` - Photo storage

### Authentication
- Google OAuth provider

---

## 🚢 Deployment

### Quick Deploy to Vercel
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Quick Deploy to Netlify
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 📊 Performance

### Check Bundle Size
```bash
pnpm build
ls -lh dist/public/assets/
```

### Run Lighthouse
```bash
npx lighthouse http://localhost:4173 --view
```

---

## 🧪 Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Test
```bash
pnpm test src/path/to/test.test.ts
```

### Test Coverage
```bash
pnpm test --coverage
```

---

## 🐛 Debugging

### Check TypeScript Errors
```bash
pnpm check
```

### View Build Output
```bash
pnpm build --debug
```

### Check for Security Issues
```bash
pnpm audit
```

---

## 📚 Documentation

- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `CROSS_BROWSER_TESTING.md` - Testing guide
- `PERFORMANCE_OPTIMIZATIONS.md` - Performance details
- `SUPABASE_SETUP.md` - Database setup
- `CHANGELOG.md` - Version history

---

## 🔑 Important URLs

### Development
- Local: http://localhost:5173
- Preview: http://localhost:4173

### Supabase
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs

### Deployment
- Vercel: https://vercel.com/dashboard
- Netlify: https://app.netlify.com

---

## 💡 Pro Tips

### Fast Type Check
```bash
pnpm check --watch
```

### Auto Format on Save
Add to VS Code settings.json:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Faster Builds
```bash
pnpm build --mode production
```

---

## 🆘 Common Issues

### Port Already in Use
```bash
lsof -ti:5173 | xargs kill
pnpm dev
```

### Clear Cache
```bash
rm -rf node_modules/.vite
pnpm dev
```

### TypeScript Errors After Update
```bash
rm -rf node_modules
pnpm install
pnpm check
```

---

## 📞 Need Help?

1. Check documentation in project root
2. Search existing issues
3. Create new issue with details
4. Include:
   - Error message
   - Steps to reproduce
   - Environment details

---

**Last Updated**: December 28, 2025

