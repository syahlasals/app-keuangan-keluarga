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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-success-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">KK</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-gray-600">
            Masukkan email Anda untuk menerima link reset password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
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
              className="btn btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-500 font-medium"
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