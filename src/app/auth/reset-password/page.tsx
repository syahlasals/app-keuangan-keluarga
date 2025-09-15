'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuthStore();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!email) {
      setError('Email wajib diisi');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      return;
    }

    const result = await resetPassword(email);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Link reset password telah dikirim ke email Anda. Silakan cek email dan ikuti instruksi yang diberikan.');
      setEmail('');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100/90 to-background-hint-100/90 px-4 backdrop-blur-md">
      <div className="max-w-md w-full space-y-8 glass-card glass-card-hover p-8 shadow-glass-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-500/90 rounded-2xl flex items-center justify-center mb-4 shadow-glass backdrop-blur-md">
            <span className="text-white text-2xl font-bold">KK</span>
          </div>
          <h2 className="text-3xl font-bold text-text-900">Reset Password</h2>
          <p className="mt-2 text-text-600">
            Masukkan email Anda untuk menerima link reset password
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full text-lg py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-glass hover:shadow-glass-lg backdrop-blur-md"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali ke halaman login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}