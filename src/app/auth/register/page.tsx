'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, user, initialized } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AuthProvider handles initialization and redirect
  // No additional useEffect needed

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Semua field wajib diisi');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    console.log('Attempting to register user:', formData.email);
    const result = await signUp(formData.email, formData.password);

    if (result.error) {
      console.error('Registration error:', result.error);
      setError(result.error);
    } else if (result.success && result.message) {
      setSuccess(result.message);
      setFormData({ email: '', password: '', confirmPassword: '' });
    } else {
      setSuccess('Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.');
      setFormData({ email: '', password: '', confirmPassword: '' });
    }
    setIsSubmitting(false);
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
          <h2 className="text-3xl font-bold text-text-900">Daftar</h2>
          <p className="mt-2 text-text-600">
            Buat akun Keuangan Keluarga baru
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-danger-50/90 border border-danger-200/50 text-danger-700 px-4 py-3 rounded-xl shadow-glass backdrop-blur-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-accent-50/90 border border-accent-200/50 text-accent-700 px-4 py-3 rounded-xl shadow-glass backdrop-blur-md">
              {success}
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
                  autoComplete="new-password"
                  required
                  className="input pl-10 pr-10"
                  placeholder="Password (minimal 6 karakter)"
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

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input pl-10 pr-10"
                  placeholder="Konfirmasi Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-text-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full text-lg py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-glass hover:shadow-glass-lg backdrop-blur-md"
            >
              {isSubmitting ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-text-600">
              Sudah punya akun?{' '}
              <Link
                href="/auth/login"
                className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Masuk sekarang
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}