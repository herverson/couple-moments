# Deployment Guide - Couple Moments

## Pre-Deployment Checklist

### Code Quality
- [x] All TypeScript type checking passes (`pnpm check`)
- [x] All tests pass (`pnpm test`)
- [x] No console errors in production build
- [x] Code is properly formatted (`pnpm format`)
- [x] Performance optimizations implemented
- [x] Security best practices followed

### Environment Configuration
- [ ] Production environment variables configured
- [ ] Supabase production project set up
- [ ] Database migrations applied to production
- [ ] Storage buckets configured with proper policies
- [ ] OAuth providers configured in production

### Testing
- [x] All features tested in development
- [x] Cross-browser testing completed
- [ ] Performance testing completed (Lighthouse score > 90)
- [ ] Security audit completed
- [ ] Mobile responsiveness verified

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Custom Domain
VITE_APP_URL=https://couplemoments.app

# Node Environment
NODE_ENV=production
```

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

#### Prerequisites
- Vercel account (https://vercel.com)
- Git repository connected

#### Steps
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Configure Project**:
   ```bash
   vercel
   ```
   Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Your account/team
   - Link to existing project: No
   - Project name: couple-moments
   - Directory: ./
   - Override settings: Yes

4. **Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `pnpm install`

5. **Environment Variables**:
   Add via Vercel Dashboard or CLI:
   ```bash
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   ```

6. **Deploy**:
   ```bash
   vercel --prod
   ```

#### Automatic Deployments
- Connect GitHub repository in Vercel dashboard
- Every push to `main` branch triggers a production deployment
- Pull requests get preview deployments

---

### Option 2: Netlify

#### Steps
1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Initialize Site**:
   ```bash
   netlify init
   ```

4. **Build Settings**:
   Create `netlify.toml`:
   ```toml
   [build]
     command = "pnpm build"
     publish = "dist/public"
   
   [build.environment]
     NODE_VERSION = "20"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

---

### Option 3: Railway (Full-Stack Deployment)

Railway can host both frontend and backend in one place.

#### Steps
1. **Sign up**: https://railway.app

2. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

3. **Login**:
   ```bash
   railway login
   ```

4. **Initialize Project**:
   ```bash
   railway init
   ```

5. **Add Environment Variables**:
   ```bash
   railway variables set VITE_SUPABASE_URL=your-url
   railway variables set VITE_SUPABASE_ANON_KEY=your-key
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

---

### Option 4: Docker + Cloud Provider

#### Dockerfile
Create a `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

#### Docker Compose
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

#### Build and Run
```bash
# Build image
docker build -t couple-moments .

# Run container
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=your-url \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  couple-moments
```

---

## Supabase Production Setup

### 1. Create Production Project
1. Go to https://supabase.com/dashboard
2. Create a new project for production
3. Wait for database provisioning

### 2. Apply Database Schema
Run the setup SQL script:
```bash
# Copy the contents of supabase-setup.sql
# Paste into Supabase SQL Editor
# Execute the script
```

### 3. Configure Storage
1. Navigate to **Storage** in Supabase dashboard
2. Create bucket: `couple-photos`
3. Set bucket policies (from SQL script)
4. Enable public access for read operations

### 4. Set Up Authentication
1. Navigate to **Authentication** > **Providers**
2. Enable **Google** provider
3. Add OAuth credentials:
   - Client ID
   - Client Secret
   - Authorized redirect URIs: `https://your-domain.com/auth/callback`

### 5. Configure RLS Policies
All RLS policies should be automatically created by the SQL script. Verify in:
- **Database** > **Tables** > Select table > **Policies**

### 6. Update Environment Variables
Copy the following from Supabase dashboard:
- **Project URL**: Settings > API > Project URL
- **Anon/Public Key**: Settings > API > anon public

---

## Domain Configuration

### Custom Domain with Vercel
1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### SSL Certificate
- Automatically provided by Vercel/Netlify
- No additional configuration needed

---

## Post-Deployment Verification

### Smoke Testing
After deployment, verify the following:

1. **Homepage loads**: Visit your production URL
2. **Authentication works**: Sign in with Google
3. **Create couple profile**: Test the flow
4. **Upload photo**: Test image upload
5. **Add YouTube video**: Test video embedding
6. **View relationship timer**: Verify it's updating
7. **Browse romantic phrases**: Check database connection

### Performance Testing
Run Lighthouse audit:
```bash
npx lighthouse https://your-domain.com --view
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Error Monitoring
Set up error tracking (optional but recommended):
- **Sentry**: https://sentry.io
- **LogRocket**: https://logrocket.com
- **Rollbar**: https://rollbar.com

---

## Rollback Plan

### Quick Rollback with Vercel
```bash
# List deployments
vercel list

# Promote previous deployment to production
vercel promote <deployment-url>
```

### Rollback with Git
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

---

## Monitoring & Maintenance

### Performance Monitoring
- Monitor Core Web Vitals in Google Search Console
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Track user analytics (Google Analytics, Plausible)

### Database Maintenance
- Regular database backups (Supabase handles automatically)
- Monitor storage usage
- Review and optimize slow queries

### Security Updates
- Keep dependencies updated: `pnpm update`
- Monitor security advisories: `pnpm audit`
- Rotate secrets periodically

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm check
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Scaling Considerations

### Frontend Scaling
- **CDN**: Automatically handled by Vercel/Netlify
- **Caching**: Configure cache headers for static assets
- **Image Optimization**: Use WebP format, lazy loading

### Database Scaling
- Supabase automatically scales
- Monitor connection pool usage
- Consider read replicas for high traffic

### Cost Optimization
- Monitor Supabase usage
- Optimize database queries
- Implement pagination for large datasets
- Use CDN for static assets

---

## Support & Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev/guide/
- React Docs: https://react.dev/

### Community
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create issues for bugs

---

## Deployment Completion Checklist

Before marking deployment as complete:

- [ ] Application is live and accessible
- [ ] All features work in production
- [ ] SSL certificate is active
- [ ] Custom domain configured (if applicable)
- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Storage buckets configured
- [ ] OAuth authentication working
- [ ] Performance scores are acceptable
- [ ] Error monitoring set up (optional)
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## Quick Reference

### Useful Commands
```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Check types
pnpm check

# Run tests
pnpm test

# Deploy to Vercel
vercel --prod

# View deployment logs
vercel logs
```

### Important URLs
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Application: https://your-domain.com

---

**Last Updated**: December 2025
**Version**: 1.0.0

