# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: `keuangan-keluarga` or any name you prefer
   - Database Password: Choose a strong password
   - Region: Choose closest to your location
6. Click "Create new project"
7. Wait for the project to be set up (usually takes 1-2 minutes)

## Step 2: Get Project Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

## Step 3: Setup Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Run Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the content from `database-schema.sql` file
3. Paste it in the SQL Editor
4. Click "Run" to execute the schema
5. Verify that tables are created in the Table Editor

## Step 5: Configure Authentication

1. Go to Authentication > Settings in Supabase dashboard
2. Under "User Signups", ensure "Enable email confirmations" is enabled
3. Set "Site URL" to `http://localhost:3000` for development
4. Add redirect URLs:
   - `http://localhost:3000/auth/login` (for email confirmation)
   - `http://localhost:3000/auth/reset-password` (for password reset)
5. Configure email templates if needed (optional for development)
6. For password reset, the default template should work

### Important Notes:
- Users MUST confirm their email before they can sign in
- Check spam folder if confirmation email is not received
- In development, you can disable email confirmation in Auth settings if needed
- For production, always keep email confirmation enabled for security

## Step 6: Test the Application

1. Run `npm run dev` in your project directory
2. Open `http://localhost:3000` in your browser
3. Try registering a new user
4. Check your Supabase dashboard to see if:
   - User is created in auth.users
   - User profile is created in public.users
   - Default categories are created in public.categories

## Database Tables Created

1. **users** - User profiles (extends auth.users)
2. **categories** - User-specific categories for transactions
3. **transactions** - Financial transactions (income/expense)

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Default categories are automatically created for new users

## Next Steps

After completing this setup, you can:
1. Test authentication (register/login)
2. Start developing the dashboard and transaction features
3. Test the application functionality