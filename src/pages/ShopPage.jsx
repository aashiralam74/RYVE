import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { ProductCard } from '../components/ProductCard';

export const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState(15000);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*, category:categories(name), variants:product_variants(*)');

      if (selectedCategory !== 'all') {
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', selectedCategory).single();
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (selectedGender !== 'all') {
        query = query.eq('gender', selectedGender);
      }

      query = query.lte('price', priceRange);

      if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
      if (sortBy === 'price-low') query = query.order('price', { ascending: true });
      if (sortBy === 'price-high') query = query.order('price', { ascending: false });

      const { data, error } = await query;
      if (!error && data) setProducts(data);
      setLoading(false);
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedGender, sortBy, priceRange]);

  return (
    <div className="min-h-screen bg-ryve-black text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-ryve-border pb-6 mb-8">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight font-display">All Street Releases</h1>
        <p className="text-zinc-400 text-xs mt-1">Showing {products.length} crafted luxury streetwear items</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-6 shrink-0">
          {/* Categories */}
          <div className="border border-ryve-border bg-ryve-charcoal/40 p-5 rounded-lg">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`block w-full text-left text-xs font-medium py-1 transition-colors ${selectedCategory === 'all' ? 'text-ryve-accent font-bold' : 'text-zinc-400 hover:text-white'}`}
              >
                All Drops
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`block w-full text-left text-xs font-medium py-1 transition-colors ${selectedCategory === c.slug ? 'text-ryve-accent font-bold' : 'text-zinc-400 hover:text-white'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="border border-ryve-border bg-ryve-charcoal/40 p-5 rounded-lg">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">Gender / Fit</h3>
            <div className="space-y-2">
              {['all', 'men', 'women', 'unisex'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`block w-full text-left text-xs font-medium uppercase py-1 transition-colors ${selectedGender === g ? 'text-ryve-accent font-bold' : 'text-zinc-400 hover:text-white'}`}
                >
                  {g === 'all' ? 'All Fits' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border border-ryve-border bg-ryve-charcoal/40 p-5 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">Max Price</h3>
              <span className="text-xs font-bold text-white">PKR {priceRange.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="20000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-ryve-accent bg-ryve-border h-1.5 rounded cursor-pointer"
            />
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1">
          {/* Sorting Bar */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-ryve-border/60">
            <div className="text-xs text-zinc-400 font-medium">
              Sort By:
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-ryve-charcoal border border-ryve-border text-white text-xs font-semibold py-2 px-3 rounded outline-none cursor-pointer"
            >
              <option value="newest">Newest Drops</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-80 bg-ryve-charcoal rounded animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-ryve-border rounded-lg bg-ryve-charcoal/20">
              <p className="text-white font-bold text-lg">No Products Matched</p>
              <p className="text-zinc-500 text-xs mt-1">Try relaxing your price range or category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

