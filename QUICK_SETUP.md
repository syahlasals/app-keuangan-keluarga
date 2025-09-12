# Quick Setup Guide

## 🚀 Current Status: Mock Authentication Active

You're currently seeing this message because the application is using **mock authentication** for development purposes.

```
⚠️ Using placeholder Supabase configuration. Authentication will be mocked for development.
```

## 🔧 How to Switch to Real Authentication

### Option 1: Quick Supabase Setup (Recommended)

1. **Create a free Supabase account:**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up with your email
   - Create a new project (takes 2-3 minutes)

2. **Get your credentials:**
   - In your Supabase dashboard, go to Settings → API
   - Copy your `Project URL` and `anon public` key

3. **Update your environment:**
   - Open `.env.local` file in your project root
   - Replace these lines:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key_here
   ```
   - With your real credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_KEY
   ```

4. **Set up the database:**
   - In Supabase dashboard, go to SQL Editor
   - Copy the content from `database-schema.sql` in your project
   - Paste and run it in the SQL Editor

5. **Restart your development server:**
   ```bash
   npm run dev
   ```

### Option 2: Continue with Mock Authentication

If you want to continue testing with mock authentication:

**Login Credentials:**
- Email: `demo@example.com`
- Password: `password`

This allows you to test the UI without setting up a real database.

### Option 3: Skip Authentication (UI Testing Only)

To skip authentication entirely and go directly to the dashboard:
1. Open `.env.local`
2. Add this line:
   ```
   NEXT_PUBLIC_DISABLE_AUTH=true
   ```
3. Restart the server

## 🐛 Troubleshooting

### Webpack Cache Error
If you see webpack cache errors, clear the cache:
```bash
# Delete .next folder
Remove-Item .next -Recurse -Force
# Then restart
npm run dev
```

### Authentication Not Working
1. Check your `.env.local` file has the correct credentials
2. Verify your Supabase project is active
3. Check the browser console for detailed error messages
4. Make sure you've run the database schema

### Need Help?
- Check `SUPABASE_SETUP.md` for detailed Supabase setup
- Look at the browser console for error details
- Verify your environment variables are loaded correctly

## 📝 What's Next?

Once authentication is working, you can:
1. Register new users
2. Test the dashboard features
3. Add transactions and categories
4. Explore the PWA features

The application includes:
- 📱 Progressive Web App (PWA) support
- 💰 Transaction tracking (income/expenses)
- 📊 Dashboard with charts
- 🏷️ Category management
- 📱 Mobile-responsive design