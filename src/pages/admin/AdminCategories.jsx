import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../../context/ToastContext';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image_url: ''
  });

  const { addToast } = useToast();

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      addToast(error.message, 'error');
      return;
    }

    setCategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      image_url: ''
    });

    setEditingCategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      image_url: category.image_url || ''
    });

    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const slug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const payload = {
      name: formData.name.trim(),
      slug,
      image_url: formData.image_url.trim() || null
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', editingCategory.id);

      if (error) {
        addToast(error.message, 'error');
        return;
      }

      addToast('Category updated successfully!', 'success');
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([payload]);

      if (error) {
        addToast(error.message, 'error');
        return;
      }

      addToast('Category created successfully!', 'success');
    }

    setIsModalOpen(false);
    resetForm();
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      addToast(error.message, 'error');
      return;
    }

    addToast('Category deleted', 'info');
    fetchCategories();
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            Categories
          </h1>

          <p className="text-xs text-zinc-400 mt-1">
            Manage your product categories
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-white text-black px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-ryve-charcoal border border-ryve-border rounded-lg overflow-hidden"
          >

            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-ryve-black flex items-center justify-center text-zinc-600">
                No Image
              </div>
            )}

            <div className="p-4">

              <h3 className="font-bold text-white">
                {category.name}
              </h3>

              <p className="text-xs text-zinc-500 mt-1">
                /{category.slug}
              </p>

              <div className="flex gap-2 mt-4">

                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 border border-ryve-border text-zinc-300 hover:text-white py-2 rounded text-xs font-bold uppercase flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(category.id)}
                  className="px-3 border border-ryve-border text-zinc-500 hover:text-red-400 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            </div>
          </div>
        ))}

      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          No categories found.
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">

          <div className="bg-ryve-charcoal border border-ryve-border w-full max-w-lg rounded-xl p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-lg font-bold uppercase text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <form onSubmit={handleSave} className="space-y-4">

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Category Name
                </label>

                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  placeholder="e.g. Hoodies"
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Slug
                </label>

                <input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value
                    })
                  }
                  placeholder="hoodies"
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Image URL
                </label>

                <input
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image_url: e.target.value
                    })
                  }
                  placeholder="https://..."
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-ryve-border">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black rounded font-bold uppercase"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};