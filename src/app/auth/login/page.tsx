'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { isMockAuth } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, initialized } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AuthProvider handles initialization and redirect
  // No additional useEffect needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email dan password wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await signIn(formData.email, formData.password);

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100/90 to-background-hint-100/90 px-4 backdrop-blur-md">
      <div className="max-w-md w-full space-y-8 glass-card glass-card-hover p-8 shadow-glass-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-500/90 rounded-2xl flex items-center justify-center mb-4 shadow-glass backdrop-blur-md">
            <span className="text-white text-2xl font-bold">KK</span>
          </div>
          <h2 className="text-3xl font-bold text-text-900">Masuk</h2>
          <p className="mt-2 text-text-600">
            Masuk ke akun Keuangan Keluarga Anda
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Development Notice */}
          {isMockAuth() && (
            <div className="bg-secondary-100/90 border border-secondary-200/50 text-secondary-700 px-4 py-3 rounded-xl shadow-glass backdrop-blur-md">
              <div className="flex items-start">
                <Info className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Development Mode</p>
                  <p>Use demo credentials: <strong>demo@example.com</strong> / <strong>password</strong></p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-danger-50/90 border border-danger-200/50 text-danger-700 px-4 py-3 rounded-xl shadow-glass backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input pl-10"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input pl-10 pr-10"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-text-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/reset-password"
              className="text-primary-500 hover:text-primary-600 text-sm transition-colors"
            >
              Lupa password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full text-lg py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-glass hover:shadow-glass-lg backdrop-blur-md"
            >
              {isSubmitting ? 'Masuk...' : 'Masuk'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-text-600">
              Belum punya akun?{' '}
              <Link
                href="/auth/register"
                className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}