# Troubleshooting Guide

## Styles Not Showing Up

### Problem
Tailwind CSS styles are not being applied to the application.

### Solutions Fixed
1. **Updated Tailwind Config**: Changed from ES modules to CommonJS format for better compatibility
2. **Updated PostCSS Config**: Improved configuration structure
3. **Verified CSS Import**: Ensured `globals.css` is properly imported in layout

### Steps to Verify Fix
1. Stop the development server (Ctrl+C)
2. Delete `.next` folder if it exists: `rm -rf .next` (or manually delete)
3. Restart development server: `npm run dev`
4. Check if styles are now working

## Supabase Authentication Errors

### Problem: "Email not confirmed" Error
This error occurs when a user tries to log in before confirming their email address.

### Solutions Implemented
1. **Better Error Messages**: Updated error handling to show user-friendly messages
2. **Email Confirmation Setup**: Updated Supabase setup guide with proper redirect URLs
3. **Improved Signup Flow**: Added success messages directing users to check email

### How to Handle This Error

#### For Development
1. **Option 1: Disable Email Confirmation (Development Only)**
   - Go to Supabase Dashboard > Authentication > Settings
   - Uncheck "Enable email confirmations"
   - Note: Only for development, always enable in production

2. **Option 2: Check Email and Confirm**
   - After registration, check the email inbox (including spam)
   - Click the confirmation link in the email
   - Then try to log in again

#### For Production
- Always keep email confirmation enabled
- Ensure proper email delivery setup
- Configure custom email templates if needed

### Problem: Missing Environment Variables
Error: "Missing Supabase environment variables"

### Solution
1. Copy `.env.local.example` to `.env.local`
2. Fill in your actual Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Restart the development server

## Common Development Issues

### PWA Features Not Working
- PWA features are disabled in development mode by design
- Test PWA features in production build:
```
  npm run build
  npm run start
  ```

### Database Connection Issues
1. Check if Supabase project is active
2. Verify environment variables are correct
3. Check if database schema has been executed
4. Verify Row Level Security policies are in place

### Fast Refresh Issues
If you see unusual Fast Refresh messages:
1. This is normal development behavior
2. These messages indicate Hot Module Replacement is working
3. No action needed unless builds are failing

## Getting Help
1. Check this troubleshooting guide first
2. Verify all setup steps in `SUPABASE_SETUP.md`
3. Check browser console for specific error messages
4. Ensure all dependencies are installed: `npm install`