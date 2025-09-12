# Production Authentication Fix Guide

## Problem
Authentication works on localhost but fails on Vercel production deployment.

## Root Cause
Supabase authentication settings are configured only for localhost, not for production domain.

## Solution

### Step 1: Get Your Vercel Production URL
After deploying to Vercel, your app will have a URL like:
- `https://app-keuangan-keluarga-[random-string].vercel.app`
- Or your custom domain if configured

### Step 2: Update Supabase Authentication Settings

1. Go to your **Supabase Dashboard** → **Authentication** → **Settings**

2. **Update Site URL**:
   - Current: `http://localhost:3000`
   - Update to: `https://your-vercel-app.vercel.app` (replace with your actual Vercel URL)

3. **Add Redirect URLs** (add these to the existing localhost URLs):
   ```
   https://your-vercel-app.vercel.app/auth/login
   https://your-vercel-app.vercel.app/auth/reset-password
   https://your-vercel-app.vercel.app/
   ```

4. **Set Additional Redirect URLs** (keep existing localhost ones for development):
   ```
   http://localhost:3000/auth/login
   http://localhost:3000/auth/reset-password
   http://localhost:3000/
   https://your-vercel-app.vercel.app/auth/login
   https://your-vercel-app.vercel.app/auth/reset-password
   https://your-vercel-app.vercel.app/
   ```

### Step 3: Verify Environment Variables in Vercel

1. Go to your **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

2. Ensure these are set:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://nfxbdqjnjwpwhefiqlwo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5meGJkcWpuandwd2hlZmlxbHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDc4NjEsImV4cCI6MjA3MzE4Mzg2MX0.uCUwuESB1h2wKpNnUuFdmdpV3wbEQaetn1dxu2Dc0wg
   NEXT_PUBLIC_DISABLE_AUTH = false
   ```

### Step 4: Redeploy Your Application

After updating Supabase settings:
1. Trigger a new deployment in Vercel (push to your main branch)
2. Or manually redeploy in Vercel dashboard

### Step 5: Test Authentication

1. Visit your production URL
2. Try to register a new user
3. Check email for confirmation link
4. Try to login with confirmed credentials

## Additional Notes

- **Development**: Keep localhost URLs for local development
- **Production**: Add production URLs for live app
- **Custom Domain**: If you set up a custom domain, update all URLs accordingly
- **HTTPS Required**: Vercel automatically provides HTTPS, which is required for PWA features

## Troubleshooting

If authentication still fails:

1. **Check Browser Console**: Look for CORS or network errors
2. **Check Supabase Logs**: Go to Supabase Dashboard → Logs
3. **Verify Network Tab**: Check if auth requests are reaching Supabase
4. **Test with Incognito**: Rule out caching issues

## Security Considerations

- Never commit real environment variables to git
- Use Vercel environment variables for production
- Keep email confirmation enabled in production
- Monitor authentication logs for suspicious activity