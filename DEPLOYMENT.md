# Deployment Guide - Vercel

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fapp-keuangan-keluarga)

## Manual Deployment Steps

### 1. Prerequisites
- Supabase project set up with database schema
- GitHub repository with your code
- Vercel account

### 2. Environment Variables Required

Set these in your Vercel project settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
```

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables
5. Deploy

#### Option B: Via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Post-Deployment Checklist

- [ ] **Test Authentication**: Register and login
- [ ] **PWA Installation**: Test "Add to Home Screen"
- [ ] **Offline Functionality**: Test offline mode
- [ ] **Database Connectivity**: Verify Supabase connection
- [ ] **Performance**: Check Lighthouse scores
- [ ] **Mobile Responsiveness**: Test on mobile devices

### 5. Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain
4. Update DNS records as instructed

### 6. Performance Optimizations

Your app is configured with:
- ✅ SWC Minification
- ✅ Console removal in production
- ✅ PWA with offline caching
- ✅ Static optimization
- ✅ Image optimization
- ✅ Code splitting

### 7. Monitoring

Monitor your deployment:
- **Vercel Analytics**: Built-in performance monitoring
- **Vercel Functions**: Track API performance
- **Supabase Dashboard**: Monitor database usage

### 8. Troubleshooting

**Build fails:**
- Check environment variables are set
- Ensure Supabase credentials are valid
- Review build logs in Vercel dashboard

**App doesn't load:**
- Verify environment variables
- Check Supabase project status
- Review browser console for errors

**PWA not installing:**
- Ensure HTTPS is enabled (automatic on Vercel)
- Check manifest.json is accessible
- Verify service worker registration

### 9. Updates and Redeployment

Your app will automatically redeploy when you push to your main branch. For manual redeployment:

```bash
vercel --prod
```

## Production URLs

After deployment, your app will be available at:
- **Production**: `https://your-app-name.vercel.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Guides](https://supabase.com/docs)