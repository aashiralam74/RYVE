import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../../context/ToastContext';

const emptyVariant = () => ({
  size: 'M',
  color: 'Black',
  color_hex: '#000000',
  stock: 0,
  sku: ''
});

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    gender: 'unisex',
    description: '',
    images: []
  });

  const [variants, setVariants] = useState([emptyVariant()]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        variants:product_variants(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch products error:', error);
      addToast(error.message, 'error');
      return;
    }

    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchProducts();

    supabase
      .from('categories')
      .select('*')
      .then(({ data }) => setCategories(data || []));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { error } = await supabase.storage
      .from('product-media')
      .upload(fileName, file);

    if (error) {
      addToast('Image upload failed: ' + error.message, 'error');
      setUploadingImage(false);
      return;
    }

    const {
      data: { publicUrl }
    } = supabase.storage
      .from('product-media')
      .getPublicUrl(fileName);

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, publicUrl]
    }));

    setUploadingImage(false);
    addToast('Product photo uploaded successfully!', 'success');
  };

  const addVariant = () => {
    setVariants(prev => [...prev, emptyVariant()]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      addToast('A product must have at least one variant.', 'error');
      return;
    }

    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev =>
      prev.map((variant, i) =>
        i === index
          ? { ...variant, [field]: value }
          : variant
      )
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      price: '',
      compare_at_price: '',
      category_id: '',
      gender: 'unisex',
      description: '',
      images: []
    });

    setVariants([emptyVariant()]);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (variants.length === 0) {
      addToast('Add at least one size/color variant.', 'error');
      return;
    }

    const invalidVariant = variants.find(
      variant =>
        !variant.size.trim() ||
        !variant.color.trim() ||
        Number(variant.stock) < 0
    );

    if (invalidVariant) {
      addToast('Please complete all variant fields correctly.', 'error');
      return;
    }

    const payload = {
      title: formData.title,
      slug:
        formData.slug ||
        formData.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price
        ? parseFloat(formData.compare_at_price)
        : null,
      category_id: formData.category_id || null,
      gender: formData.gender,
      description: formData.description || null,
      images: formData.images
    };

    // 1. Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (productError) {
      console.error('Product creation error:', productError);
      addToast(productError.message, 'error');
      return;
    }

    // 2. Create variants
    const variantPayload = variants.map(variant => ({
      product_id: product.id,
      size: variant.size.trim(),
      color: variant.color.trim(),
      color_hex: variant.color_hex || '#000000',
      stock: parseInt(variant.stock, 10) || 0,
      sku:
        variant.sku.trim() ||
        `${product.slug}-${variant.size}-${variant.color}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
    }));

    const { error: variantError } = await supabase
      .from('product_variants')
      .insert(variantPayload);

    if (variantError) {
      console.error('Variant creation error:', variantError);

      // Remove product if variants fail so we don't leave
      // an incomplete product behind.
      await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      addToast(
        'Product created but variants failed: ' + variantError.message,
        'error'
      );

      return;
    }

    addToast('Product and variants published successfully!', 'success');

    setIsModalOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (
      confirm(
        'Are you sure you want to permanently delete this product?'
      )
    ) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        addToast(error.message, 'error');
        return;
      }

      addToast('Product deleted', 'info');
      fetchProducts();
    }
  };

  const getTotalStock = (product) => {
    return (product.variants || []).reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            Product Inventory
          </h1>

          <p className="text-xs text-zinc-400 mt-1">
            Manage drop catalog, pricing & media
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-white hover:bg-zinc-200 text-black px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-ryve-charcoal border border-ryve-border rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-ryve-black text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Variants</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-ryve-border">
            {products.map(product => (
              <tr
                key={product.id}
                className="hover:bg-ryve-card/30"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]}
                      alt={product.title}
                      className="w-10 h-12 object-cover rounded bg-black"
                    />

                    <span className="font-bold text-white">
                      {product.title}
                    </span>
                  </div>
                </td>

                <td className="p-4 text-zinc-400">
                  {product.category?.name || 'N/A'}
                </td>

                <td className="p-4 font-bold text-white">
                  PKR {Number(product.price).toLocaleString()}
                </td>

                <td className="p-4 text-zinc-400">
                  {product.variants?.length || 0}
                </td>

                <td className="p-4">
                  <span
                    className={
                      getTotalStock(product) > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {getTotalStock(product)}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() =>
                      handleDeleteProduct(product.id)
                    }
                    className="text-zinc-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-zinc-500"
                >
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-ryve-charcoal border border-ryve-border w-full max-w-4xl rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                Create New Release
              </h2>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProduct}
              className="space-y-5 text-xs"
            >

              <div>
                <label className="text-zinc-400 block mb-1">
                  Product Title
                </label>

                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      title: e.target.value
                    })
                  }
                  className="w-full bg-ryve-black border border-ryve-border rounded p-2.5 text-white outline-none"
                  placeholder="e.g. Vintage Heavyweight Hoodie"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">
                    Price (PKR)
                  </label>

                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        price: e.target.value
                      })
                    }
                    className="w-full bg-ryve-black border border-ryve-border rounded p-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">
                    Compare At / Old Price (PKR)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.compare_at_price}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        compare_at_price: e.target.value
                      })
                    }
                    className="w-full bg-ryve-black border border-ryve-border rounded p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">
                    Category
                  </label>

                  <select
                    value={formData.category_id}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        category_id: e.target.value
                      })
                    }
                    className="w-full bg-ryve-black border border-ryve-border rounded p-2.5 text-white outline-none"
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map(category => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">
                    Gender / Fit
                  </label>

                  <select
                    value={formData.gender}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        gender: e.target.value
                      })
                    }
                    className="w-full bg-ryve-black border border-ryve-border rounded p-2.5 text-white outline-none"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">
                  Description
                </label>

                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      description: e.target.value
                    })
                  }
                  className="w-full bg-ryve-black border border-ryve-border rounded p-2.5 text-white outline-none resize-none"
                  placeholder="Describe the product..."
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">
                  Upload Product Photos (Supabase Storage)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full bg-ryve-black border border-ryve-border rounded p-2 text-zinc-400 text-xs"
                />

                {uploadingImage && (
                  <p className="text-xs text-ryve-accent mt-1">
                    Uploading image to cloud...
                  </p>
                )}

                <div className="flex gap-2 mt-2 flex-wrap">
                  {formData.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="preview"
                      className="w-12 h-14 object-cover rounded border border-ryve-border"
                    />
                  ))}
                </div>
              </div>

              {/* VARIANTS */}
              <div className="border border-ryve-border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase">
                      Product Variants
                    </h3>

                    <p className="text-zinc-500 mt-1">
                      Set sizes, colors and stock for this product.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="bg-white text-black px-3 py-2 rounded text-xs font-bold uppercase flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Variant
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end bg-ryve-black border border-ryve-border rounded p-3"
                    >

                      <div>
                        <label className="text-zinc-500 block mb-1">
                          Size
                        </label>

                        <select
                          value={variant.size}
                          onChange={e =>
                            updateVariant(
                              index,
                              'size',
                              e.target.value
                            )
                          }
                          className="w-full bg-ryve-charcoal border border-ryve-border rounded p-2 text-white"
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                          <option value="3XL">3XL</option>
                          <option value="Free Size">Free Size</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-zinc-500 block mb-1">
                          Color
                        </label>

                        <input
                          type="text"
                          value={variant.color}
                          onChange={e =>
                            updateVariant(
                              index,
                              'color',
                              e.target.value
                            )
                          }
                          className="w-full bg-ryve-charcoal border border-ryve-border rounded p-2 text-white"
                          placeholder="Black"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-500 block mb-1">
                          Color
                        </label>

                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={variant.color_hex}
                            onChange={e =>
                              updateVariant(
                                index,
                                'color_hex',
                                e.target.value
                              )
                            }
                            className="w-10 h-9 bg-transparent border border-ryve-border rounded cursor-pointer"
                          />

                          <input
                            type="text"
                            value={variant.color_hex}
                            onChange={e =>
                              updateVariant(
                                index,
                                'color_hex',
                                e.target.value
                              )
                            }
                            className="min-w-0 flex-1 bg-ryve-charcoal border border-ryve-border rounded p-2 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-zinc-500 block mb-1">
                          Stock
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={e =>
                            updateVariant(
                              index,
                              'stock',
                              e.target.value
                            )
                          }
                          className="w-full bg-ryve-charcoal border border-ryve-border rounded p-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-500 block mb-1">
                          SKU
                        </label>

                        <input
                          type="text"
                          value={variant.sku}
                          onChange={e =>
                            updateVariant(
                              index,
                              'sku',
                              e.target.value
                            )
                          }
                          className="w-full bg-ryve-charcoal border border-ryve-border rounded p-2 text-white"
                          placeholder="Optional"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="h-9 flex items-center justify-center text-zinc-500 hover:text-red-400 border border-ryve-border rounded"
                        title="Remove variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  ))}
                </div>
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
                  disabled={uploadingImage}
                  className="px-6 py-2 bg-white text-black font-bold uppercase tracking-wider rounded disabled:opacity-50"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};