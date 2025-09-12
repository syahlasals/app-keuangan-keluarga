
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCategoryStore } from '@/stores/categoryStore';
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
    deleteCategory
  } = useCategoryStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; nama: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && initialized) {
      fetchCategories();
    }
  }, [user, initialized, fetchCategories]);

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
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${nama}"? Semua transaksi dengan kategori ini akan dipindahkan ke "Uncategorized".`)) {
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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="safe-top px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/profile" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Kelola Kategori</h1>
            </div>
            <Button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingCategory(null);
                setError('');
              }}
              size="sm"
              className="flex items-center"
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
          <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Add Category Form */}
        {showAddForm && (
          <Card className="mb-6">
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
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Belum ada kategori</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kategori Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                        >
                          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={isSubmitting}
                        >
                          Batal
                        </Button>
                      </form>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{category.nama}</p>
                          <p className="text-xs text-gray-500">
                            Dibuat: {new Date(category.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEdit(category)}
                            disabled={isSubmitting}
                            className="p-1 text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.nama)}
                            disabled={isSubmitting}
                            className="p-1 text-gray-400 hover:text-danger-600 transition-colors disabled:opacity-50"
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
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Catatan:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Kategori default (Makanan, Transportasi, Pendidikan, Hiburan) akan dibuat otomatis</li>
                <li>Menghapus kategori akan memindahkan semua transaksi terkait ke &quot;Uncategorized&quot;</li>
                <li>Nama kategori tidak boleh sama</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}