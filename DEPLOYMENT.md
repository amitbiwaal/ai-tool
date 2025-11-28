# Deployment Guide

This guide covers deploying your AI Tools Directory to production.

## Pre-Deployment Checklist

Before deploying, ensure:
- [ ] All features work locally
- [ ] Environment variables are documented
- [ ] Database schema is finalized
- [ ] Seed data is prepared (if using)
- [ ] You have a Supabase account
- [ ] You have a deployment platform account (Vercel, Netlify, etc.)

## Vercel Deployment (Recommended)

Vercel is the recommended platform for Next.js applications.

### Step 1: Prepare Your Repository

1. Commit all your changes:
```bash
git add .
git commit -m "Ready for deployment"
```

2. Push to GitHub:
```bash
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Step 3: Configure Environment Variables

Add these environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=AI Tools Directory
```

**Important:** Use your PRODUCTION Supabase credentials, not development ones.

### Step 4: Deploy

Click "Deploy" and wait for the build to complete (usually 2-3 minutes).

### Step 5: Configure Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

## Alternative Deployment Options

### Netlify

1. Push code to GitHub
2. Sign in to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables (same as Vercel)
7. Deploy

### Railway

1. Sign in to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Next.js
5. Add environment variables
6. Deploy

### Self-Hosted (VPS/Dedicated Server)

#### Requirements:
- Node.js 18+
- PM2 or similar process manager
- Nginx or Apache (recommended)

#### Steps:

1. **Clone repository on server:**
```bash
git clone <your-repo-url>
cd ai-tools-directory
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env.local:**
```bash
nano .env.local
# Add your environment variables
```

4. **Build the application:**
```bash
npm run build
```

5. **Start with PM2:**
```bash
npm install -g pm2
pm2 start npm --name "ai-tools-directory" -- start
pm2 save
pm2 startup
```

6. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Post-Deployment Steps

### 1. Verify Deployment

- [ ] Homepage loads correctly
- [ ] All pages are accessible
- [ ] Search functionality works
- [ ] Authentication works
- [ ] Database queries work
- [ ] Images load properly

### 2. Set Up Analytics (Optional)

#### Google Analytics
1. Create a GA4 property
2. Add tracking code to `app/layout.tsx`

#### Plausible Analytics
1. Sign up at [plausible.io](https://plausible.io)
2. Add script to `app/layout.tsx`

### 3. Configure Error Monitoring (Optional)

#### Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### 4. Set Up Backups

#### Supabase Backups
- Enable daily backups in Supabase dashboard
- Download backups regularly for critical data

### 5. Performance Optimization

1. **Enable Vercel Analytics:**
   - Go to your project settings
   - Enable "Analytics"
   - Monitor Core Web Vitals

2. **Configure Caching:**
   - Already configured via `revalidate` in pages
   - Adjust revalidation times as needed

3. **Image Optimization:**
   - Next.js automatically optimizes images
   - Ensure images are properly sized

### 6. SEO Configuration

1. **Submit Sitemap:**
   - Google Search Console: Add `https://yourdomain.com/sitemap.xml`
   - Bing Webmaster Tools: Add sitemap

2. **Verify robots.txt:**
   - Visit `https://yourdomain.com/robots.txt`
   - Ensure it's accessible

3. **Test Rich Results:**
   - Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
   - Test a few tool detail pages

## Environment-Specific Configuration

### Development
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Use development Supabase project
```

### Staging (Optional)
```env
NEXT_PUBLIC_SITE_URL=https://staging.yourdomain.com
# Use staging Supabase project
```

### Production
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
# Use production Supabase project
```

## Database Migration Strategy

When updating the database schema in production:

1. **Test locally first:**
```bash
# Apply changes to local database
# Test thoroughly
```

2. **Create migration SQL:**
```sql
-- Only include new changes, not full schema
-- Example:
ALTER TABLE tools ADD COLUMN new_field TEXT;
```

3. **Apply to production:**
   - Use Supabase SQL editor
   - Run during low-traffic time
   - Have rollback plan ready

4. **Verify:**
   - Check application functionality
   - Monitor error logs

## Rollback Procedure

If deployment has issues:

### Vercel/Netlify
1. Go to deployments
2. Click on previous working deployment
3. Click "Promote to Production"

### Self-Hosted
1. Stop current process:
```bash
pm2 stop ai-tools-directory
```

2. Checkout previous version:
```bash
git checkout <previous-commit-hash>
npm install
npm run build
```

3. Restart:
```bash
pm2 restart ai-tools-directory
```

## Monitoring

### What to Monitor
- Response times
- Error rates
- API usage
- Database performance
- User registrations
- Tool submissions

### Tools
- Vercel Analytics (built-in)
- Supabase Dashboard (database metrics)
- Sentry (error tracking)
- Google Analytics (user behavior)

## Scaling Considerations

### Database
- Supabase Pro: Better performance and support
- Connection pooling: Already handled by Supabase
- Indexes: Already optimized in schema

### Application
- Vercel automatically scales
- Consider Vercel Pro for higher limits
- Use Edge functions for critical paths

### CDN
- Vercel includes global CDN
- Consider Cloudflare for additional layer

## Security Checklist

- [ ] Environment variables are not committed
- [ ] Supabase RLS policies are active
- [ ] HTTPS is enabled
- [ ] API routes validate inputs
- [ ] Admin routes are protected
- [ ] Rate limiting is configured (via Vercel/API)
- [ ] Dependencies are up to date

## Maintenance

### Regular Tasks
- **Weekly:** Check error logs
- **Monthly:** Update dependencies
- **Quarterly:** Review and optimize queries
- **Annually:** Review security practices

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update all minor versions
npm update

# Update major versions (test thoroughly)
npm install <package>@latest
```

## Troubleshooting

### Build Fails
1. Check build logs in deployment platform
2. Ensure all dependencies are in package.json
3. Test build locally: `npm run build`

### Database Connection Issues
1. Verify environment variables
2. Check Supabase project status
3. Test connection locally with same credentials

### Slow Performance
1. Check Vercel Analytics
2. Review database query performance in Supabase
3. Optimize images and reduce bundle size
4. Adjust revalidation times

### 404 Errors
1. Clear Vercel cache
2. Redeploy
3. Check dynamic routes configuration

## Support

If you encounter issues:
1. Check Vercel/Netlify logs
2. Check Supabase logs
3. Review Next.js documentation
4. Open an issue on GitHub

## Conclusion

Your AI Tools Directory is now deployed! Monitor performance, gather user feedback, and iterate on features.

Remember to:
- Keep dependencies updated
- Monitor error rates
- Backup database regularly
- Scale as needed

Good luck with your launch! 🚀

