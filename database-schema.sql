-- Keuangan Keluarga Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nama TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    nama TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, nama)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    kategori_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    nominal INTEGER NOT NULL CHECK (nominal > 0),
    tipe TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
    tanggal DATE NOT NULL,
    catatan TEXT,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('pending', 'success')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tanggal ON public.transactions(tanggal);
CREATE INDEX IF NOT EXISTS idx_transactions_kategori_id ON public.transactions(kategori_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tipe ON public.transactions(tipe);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for categories table
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, nama)
    VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
    -- Insert default categories for new user
    INSERT INTO public.categories (user_id, nama)
    VALUES 
        (NEW.id, 'Makanan'),
        (NEW.id, 'Transportasi'),
        (NEW.id, 'Pendidikan'),
        (NEW.id, 'Hiburan');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Update data lama agar kolom nama tidak NULL (opsional, jalankan manual jika perlu)
-- UPDATE public.users SET nama = split_part(email, '@', 1) WHERE nama IS NULL;

-- Trigger to automatically create user profile and default categories
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.transactions TO authenticated;