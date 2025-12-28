# 💕 Couple Moments

A beautiful, modern web application for couples to celebrate their relationship, share memories, and cherish special moments together.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-green.svg)
![Performance](https://img.shields.io/badge/lighthouse-90+-brightgreen.svg)

---

## ✨ Features

### 📸 Photo Gallery
- Upload and share your favorite photos together
- Beautiful grid layout with hover effects
- Lazy loading for optimal performance
- Secure storage with Supabase Storage

### 🎵 YouTube Playlist
- Share your favorite songs and music videos
- Embedded video player
- Easy URL or video ID input
- Create your couple's soundtrack

### ⏱️ Relationship Timer
- Real-time countdown from your relationship start date
- Beautiful animated display
- Shows days, hours, minutes, and seconds together

### 💌 Romantic Phrases
- Curated collection of romantic quotes
- Category filtering (Love, Inspiration, Commitment, etc.)
- Random phrase generator
- Copy to clipboard functionality

### 👫 Couple Management
- Secure couple pairing system
- Invite codes for partner connection
- Relationship start date tracking
- Private, couple-exclusive data

### 🔐 Authentication
- Secure Google OAuth integration
- Supabase Auth powered
- Session management
- Protected routes

### 🎨 Modern UI/UX
- Elegant, romantic design
- Responsive layout (mobile, tablet, desktop)
- Dark/light theme support (configurable)
- Smooth animations and transitions
- Touch-friendly mobile interface

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (LTS recommended)
- pnpm 10+ (package manager)
- Supabase account
- Google OAuth credentials

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd couple-moments
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy the environment template
   cp env.template .env
   
   # Edit .env and add your Supabase credentials
   # Get them from: https://supabase.com/dashboard
   ```
   
   Required variables in `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   OAUTH_SERVER_URL=  # Leave empty if not using Manus OAuth
   NODE_ENV=development
   ```

4. **Set up Supabase**:
   - Create a Supabase account at https://supabase.com
   - Create a new project
   - Follow instructions in `SUPABASE_SETUP.md`
   - Run the SQL script `supabase-setup.sql` in the SQL Editor

5. **Start development server**:
   ```bash
   pnpm dev
   ```

6. **Open your browser**:
   Navigate to `http://localhost:5173`

### Troubleshooting Setup

**Issue: "OAUTH_SERVER_URL is not configured"**
- This is optional. Add `OAUTH_SERVER_URL=` (empty) to your `.env` file

**Issue: "Cannot apply unknown utility class"**
- Clear Vite cache: `rm -rf node_modules/.vite && pnpm dev`

**Issue: "import.meta.dirname undefined"**
- Ensure you're using Node.js 18+ (recommended: Node 20+)

---

## 📦 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Wouter** - Lightweight routing
- **Radix UI** - Accessible components
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication (OAuth)
  - Storage (photos)
  - Row Level Security (RLS)
- **Express** - API server
- **tRPC** - Type-safe API

### Developer Tools
- **Vitest** - Unit testing
- **Drizzle ORM** - Database migrations
- **ESBuild** - Fast bundling
- **Prettier** - Code formatting

---

## 🎯 Performance

### Optimizations Implemented
- ✅ **Route-based code splitting** with React.lazy()
- ✅ **Component memoization** (React.memo)
- ✅ **Hook optimizations** (useCallback, useMemo)
- ✅ **Image lazy loading** (native browser support)
- ✅ **iframe lazy loading** for YouTube videos
- ✅ **Manual code chunks** for better caching
- ✅ **CSS code splitting** for faster loads
- ✅ **Build optimizations** with Vite

### Performance Metrics
- **Initial Bundle Size**: ~150-200 KB (gzipped)
- **Time to Interactive**: ~1.5-2s
- **Lighthouse Performance Score**: 90+
- **Core Web Vitals**: All green

See `PERFORMANCE_OPTIMIZATIONS.md` for detailed information.

---

## 📖 Documentation

Comprehensive documentation is available:

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Complete deployment guide with multiple platform options |
| [CROSS_BROWSER_TESTING.md](CROSS_BROWSER_TESTING.md) | Testing checklist and browser compatibility guide |
| [PERFORMANCE_OPTIMIZATIONS.md](PERFORMANCE_OPTIMIZATIONS.md) | Detailed performance optimization documentation |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Supabase configuration instructions |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Summary of all implementation tasks |
| [todo.md](todo.md) | Project task list and progress tracker |

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Test Coverage
- ✅ Couple management
- ✅ Photo operations
- ✅ YouTube video operations
- ✅ Phrase retrieval
- ✅ Authentication flow

### Cross-Browser Testing
See `CROSS_BROWSER_TESTING.md` for comprehensive testing guide.

---

## 🚢 Deployment

### Supported Platforms
1. **Vercel** (Recommended)
2. **Netlify**
3. **Railway**
4. **Docker + Any Cloud Provider**

### Quick Deploy

#### Vercel
```bash
npm i -g vercel
vercel login
vercel --prod
```

#### Netlify
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

See `DEPLOYMENT.md` for detailed deployment instructions.

---

## 🏗️ Project Structure

```
couple-moments/
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       ├── pages/         # Route pages
│       ├── hooks/         # Custom hooks
│       ├── contexts/      # React contexts
│       ├── lib/           # Utilities and configs
│       └── App.tsx        # Main app component
├── server/                # Backend API
│   ├── _core/            # Core server functionality
│   ├── api/              # API routes
│   └── routers.ts        # tRPC routers
├── shared/               # Shared types and constants
├── drizzle/             # Database schema and migrations
├── docs/                # Additional documentation
└── vite.config.ts       # Vite configuration
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm check            # Type checking
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run tests

# Building
pnpm build            # Build for production
pnpm preview          # Preview production build

# Database
pnpm db:push          # Apply database migrations
```

---

## 🌐 Browser Support

### Desktop
- Chrome (latest 2 versions) ✅
- Firefox (latest 2 versions) ✅
- Safari (latest 2 versions) ✅
- Edge (latest 2 versions) ✅

### Mobile
- iOS Safari (latest 2 versions) ✅
- Chrome Mobile (latest 2 versions) ✅
- Samsung Internet (latest version) ✅

---

## 🔒 Security

### Implemented Security Measures
- ✅ Row Level Security (RLS) in Supabase
- ✅ Secure OAuth authentication
- ✅ Environment variable protection
- ✅ HTTPS only in production
- ✅ Input validation
- ✅ XSS protection
- ✅ CSRF protection

### Security Best Practices
- Never commit `.env` files
- Rotate secrets regularly
- Keep dependencies updated
- Use secure headers
- Implement rate limiting (production)

---

## ♿ Accessibility

### WCAG AA Compliance
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Alt text on images
- ✅ Proper heading hierarchy
- ✅ Color contrast ratios
- ✅ Screen reader support

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Type check (`pnpm check`)
6. Format code (`pnpm format`)
7. Commit changes (`git commit -m 'Add amazing feature'`)
8. Push to branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

### Technologies
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

### Design Inspiration
- Modern romantic aesthetics
- Minimalist UI principles
- User-centric design

---

## 📊 Project Status

### Current Version: 1.0.0 🎉

#### Completed Features
- ✅ Full authentication system
- ✅ Couple management
- ✅ Photo gallery with upload
- ✅ YouTube video integration
- ✅ Relationship timer
- ✅ Romantic phrases system
- ✅ Responsive design
- ✅ Performance optimizations
- ✅ Comprehensive documentation
- ✅ Production-ready deployment

#### Roadmap
- [ ] Mobile apps (React Native)
- [ ] Push notifications
- [ ] Calendar integration
- [ ] Anniversary reminders
- [ ] Custom themes
- [ ] Multi-language support
- [ ] Video upload support
- [ ] Chat feature

---

## 📞 Support

### Getting Help
- **Documentation**: Check the docs folder
- **Issues**: Open a GitHub issue
- **Questions**: Refer to FAQ in docs

### Common Issues

**Q: Images not loading?**  
A: Check Supabase Storage configuration and RLS policies.

**Q: Authentication not working?**  
A: Verify OAuth credentials and redirect URLs.

**Q: Build fails?**  
A: Ensure all environment variables are set correctly.

---

## 🌟 Features in Detail

### Photo Gallery
The photo gallery allows couples to:
- Upload photos from their device or camera (mobile)
- View photos in a beautiful grid layout
- Delete photos they no longer want
- Add descriptions to photos
- Lazy load images for better performance

**Technical Implementation**:
- Supabase Storage for secure file storage
- Row Level Security for privacy
- Optimistic UI updates
- Responsive grid with Tailwind CSS

### YouTube Integration
Share your favorite songs and videos:
- Paste YouTube URL or video ID
- Automatic video embedding
- Organized in a grid layout
- Delete videos from your playlist

**Technical Implementation**:
- YouTube iframe API
- URL parsing for video ID extraction
- Lazy loading for iframes
- Responsive video player

### Relationship Timer
A real-time countdown showing:
- Total days together
- Current hours, minutes, seconds
- Relationship start date
- Beautiful animated cards

**Technical Implementation**:
- React hooks for timer management
- Efficient updates every second
- Memoized to prevent unnecessary re-renders
- Responsive grid layout

---

## 🔧 Configuration

### Environment Variables

#### Development
Create `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Production
Set in your hosting platform:
- Vercel: Project Settings > Environment Variables
- Netlify: Site Settings > Environment Variables
- Railway: Variables tab

### Customization

#### Theme Colors
Edit `client/src/index.css`:
```css
:root {
  --rose-50: ...;
  --rose-500: ...;
  /* Customize colors */
}
```

#### Application Name
Edit `client/index.html`:
```html
<title>Your App Name</title>
```

---

## 📈 Performance Monitoring

### Recommended Tools
1. **Vercel Analytics** - Built-in performance monitoring
2. **Google Analytics 4** - User behavior and Core Web Vitals
3. **Sentry** - Error tracking
4. **LogRocket** - Session replay

### Key Metrics to Monitor
- Core Web Vitals (LCP, FID, CLS)
- Page load time
- Bundle size
- API response times
- Error rates

---

## 🎨 Design System

### Colors
- **Primary**: Rose (#F43F5E)
- **Secondary**: Pink (#EC4899)
- **Background**: Gradient from rose to pink
- **Text**: Gray scale for readability

### Typography
- **Headings**: Bold, modern
- **Body**: Readable, accessible
- **Quotes**: Serif, italic for emphasis

### Components
All components built with:
- Radix UI for accessibility
- Tailwind CSS for styling
- Consistent spacing and sizing
- Smooth animations

---

## 🏆 Best Practices

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for formatting
- Vitest for testing
- Git hooks for pre-commit checks

### Performance
- Code splitting for smaller bundles
- Lazy loading for images and routes
- Memoization to prevent re-renders
- Optimized build configuration

### Security
- Environment variables for secrets
- Row Level Security in database
- Secure authentication flow
- Input validation and sanitization

---

## 🎯 Getting Started for Development

### Step-by-Step Guide

1. **Set up your development environment**:
   ```bash
   # Install Node.js 20+ and pnpm
   npm install -g pnpm
   ```

2. **Clone and install**:
   ```bash
   git clone <repo-url>
   cd couple-moments
   pnpm install
   ```

3. **Set up Supabase**:
   - Create account at https://supabase.com
   - Create new project
   - Run SQL from `supabase-setup.sql`
   - Get credentials

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Start developing**:
   ```bash
   pnpm dev
   ```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Made with 💕 for couples celebrating their love**

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: December 28, 2025

