'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useDataRefresh } from '@/hooks/useDataRefresh';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const { user, initialized } = useAuthStore();
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    ensureCategoriesLoaded,
    forceInitializeCategories,
    reset
  } = useCategoryStore();

  // Auto-refresh data when page becomes visible
  useDataRefresh();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; nama: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && initialized) {
      console.log('Categories page: ensuring categories loaded for user', user.id);
      ensureCategoriesLoaded(user.id);
    }
  }, [user, initialized, ensureCategoriesLoaded]);

  // Force refresh if categories are still empty after initialization
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    if (user && initialized && categories.length === 0) {
      retryTimeout = setTimeout(() => {
        console.log('Categories page: forcing category refresh after delay');
        fetchCategories();
      }, 3000);
    }

    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [user, initialized, categories.length, fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newCategoryName.trim()) {
      setError('Nama kategori tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    const result = await createCategory(newCategoryName.trim());

    if (result.error) {
      setError(result.error);
    } else {
      setNewCategoryName('');
      setShowAddForm(false);
    }
    setIsSubmitting(false);
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setError('');

    if (!editCategoryName.trim()) {
      setError('Nama kategori tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    const result = await updateCategory(editingCategory.id, editCategoryName.trim());

    if (result.error) {
      setError(result.error);
    } else {
      setEditingCategory(null);
      setEditCategoryName('');
    }
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${nama}"? Semua transaksi dengan kategori ini akan dipindahkan ke "Tanpa Kategori".`)) {
      setIsSubmitting(true);
      const result = await deleteCategory(id);

      if (result.error) {
        setError(result.error);
      }
      setIsSubmitting(false);
    }
  };

  const startEdit = (category: { id: string; nama: string }) => {
    setEditingCategory(category);
    setEditCategoryName(category.nama);
    setShowAddForm(false);
    setError('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background-500 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white/90 border-b shadow-glass backdrop-blur-md">
        <div className="safe-top px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/profile" className="mr-4">
                <Button variant="outline" size="sm" className="rounded-xl">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-text-900">Kelola Kategori</h1>
            </div>
            <Button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingCategory(null);
                setError('');
              }}
              size="sm"
              className="flex items-center rounded-xl"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-danger-50/80 border border-danger-200/50 text-danger-700 rounded-xl backdrop-blur-md shadow-glass">
            {error}
          </div>
        )}

        {/* Add Category Form */}
        {showAddForm && (
          <Card className="mb-6 shadow-glass-xl glass-card glass-card-hover">
            <CardHeader>
              <CardTitle className="text-lg">Tambah Kategori Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory}>
                <div className="flex space-x-3">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nama kategori"
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting || !newCategoryName.trim()}
                    className="rounded-xl"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategoryName('');
                      setError('');
                    }}
                    disabled={isSubmitting}
                    className="rounded-xl"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <Card className="shadow-glass glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-500 mb-4">Belum ada kategori</p>
                <Button onClick={() => setShowAddForm(true)} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kategori Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-white/70 rounded-xl hover:bg-white/80 transition-colors duration-300 backdrop-blur-md shadow-glass"
                  >
                    {editingCategory?.id === category.id ? (
                      <form onSubmit={handleEditCategory} className="flex-1 flex items-center space-x-3">
                        <Input
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="flex-1"
                          disabled={isSubmitting}
                          autoFocus
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmitting || !editCategoryName.trim()}
                          className="rounded-lg"
                        >
                          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={isSubmitting}
                          className="rounded-lg"
                        >
                          Batal
                        </Button>
                      </form>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium text-text-900">{category.nama}</p>
                          <p className="text-xs text-text-500">
                            Dibuat: {new Date(category.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEdit(category)}
                            disabled={isSubmitting}
                            className="p-2 text-text-400 hover:text-primary-500 hover:bg-primary-100/70 transition-colors duration-300 rounded-lg disabled:opacity-50 backdrop-blur-md shadow-glass"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.nama)}
                            disabled={isSubmitting}
                            className="p-2 text-text-400 hover:text-danger-600 hover:bg-danger-100/70 transition-colors duration-300 rounded-lg disabled:opacity-50 backdrop-blur-md shadow-glass"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 shadow-glass glass-card glass-card-hover">
          <CardContent className="p-4">
            <div className="text-sm text-text-600">
              <p className="mb-2 font-semibold">
                Catatan:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Kategori default (Makanan, Transportasi, Pendidikan, Hiburan) akan dibuat otomatis</li>
                <li>Menghapus kategori akan memindahkan semua transaksi terkait ke &quot;Tanpa Kategori&quot;</li>
                <li>Nama kategori tidak boleh sama</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}