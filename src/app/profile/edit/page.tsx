'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { ArrowLeft, User, Mail, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.nama || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    // Timeout jika supabase lambat/gagal (misal 10 detik)
    const timeout = setTimeout(() => {
      setIsSaving(false);
      setError('Gagal menyimpan profil: koneksi lambat atau server tidak merespon.');
    }, 10000);

    try {
      if (!user) {
        throw new Error('User not found');
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          nama: name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      clearTimeout(timeout);

      if (error || !data) {
        throw new Error(error?.message || 'Gagal update profil.');
      }

      setUser({
        ...user,
        nama: name,
        updated_at: data.updated_at
      });

      setSuccess('Profil berhasil diperbarui');

      setTimeout(() => {
        router.push('/profile');
      }, 1200);
    } catch (err) {
      clearTimeout(timeout);
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-text-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-500 pb-20">
      {/* Header */}
      <div className="bg-white/90 border-b backdrop-blur-md shadow-glass rounded-b-3xl">
        <div className="safe-top px-4 py-4">
          <div className="flex items-center">
            <Link
              href="/profile"
              className="mr-4"
            >
              <button className="p-2 text-text-400 hover:text-primary-500 hover:bg-white/70 transition-colors duration-300 rounded-xl disabled:opacity-50 backdrop-blur-md shadow-glass">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <h1 className="text-xl font-semibold text-text-900">Edit Profil</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <Card className="shadow-glass glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center text-text-900">
              <User className="h-5 w-5 mr-2 text-accent-500" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-700 mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      disabled
                      className="w-full pl-10 pr-3 py-3 bg-background-400 border border-background-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-900"
                    />
                  </div>
                  <p className="mt-1 text-xs text-text-500">
                    Email tidak dapat diubah
                  </p>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-3 bg-background-400 border border-background-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-900"
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-danger-100 border border-danger-200 p-3">
                    <p className="text-sm text-danger-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="rounded-xl bg-success-100 border border-success-200 p-3">
                    <p className="text-sm text-success-700">{success}</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex items-center justify-center rounded-xl"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}