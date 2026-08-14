import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { ProductCard } from '../components/ProductCard';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: prodData } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .limit(8);
      const { data: catData } = await supabase.from('categories').select('*').limit(4);

      if (prodData) setFeaturedProducts(prodData);
      if (catData) setCategories(catData);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-ryve-black text-white">
      {/* Hero Section */}
      <section className="relative h-[88vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop')` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-ryve-black via-black/60 to-black/30" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs uppercase tracking-widest font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-ryve-accent" /> Autumn / Winter '26 Collection Drop
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight font-display text-white">
            ARCHITECTURAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-400">
              STREETWEAR
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-zinc-300 max-w-xl font-normal leading-relaxed">
            Engineered silhouettes, custom heavyweight 400 GSM fabrics, and timeless minimalist aesthetics crafted for the uncompromising.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all rounded"
            >
              Shop New Arrivals
            </Link>
            <Link
              to="/shop?gender=men"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-zinc-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all rounded"
            >
              Explore Men's Edit
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-ryve-accent">Curated Drops</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-1">Shop By Category</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white flex items-center gap-1">
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative h-80 rounded-lg overflow-hidden border border-ryve-border"
            >
              <img
                src={category.image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800'}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-lg font-bold uppercase tracking-wider text-white">{category.name}</h3>
                <span className="text-xs text-zinc-400 group-hover:text-white transition-colors mt-1 block">
                  Explore Drop →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-ryve-accent">High Demand</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-1">Featured Releases</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white flex items-center gap-1">
            View Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-80 bg-ryve-charcoal rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-2xl overflow-hidden border border-ryve-border bg-ryve-charcoal p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <span className="text-xs font-bold uppercase tracking-widest text-ryve-accent">Limited Vault Access</span>
            <h3 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mt-2">
              GET 10% OFF YOUR FIRST STREET ORDER
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mt-3">
              Use promo code <span className="text-white font-mono font-bold">RYVE10</span> at checkout for instant order reduction.
            </p>
          </div>
          <Link
            to="/shop"
            className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all rounded shrink-0"
          >
            Claim Discount
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-ryve-accent">Verified Reviews</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-1">Street Tested by Community</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Hamza Tariq",
              city: "Lahore",
              review: "The GSM on the heavyweight hoodie is unbelievable. Equivalent to global luxury streetwear brands. 10/10 fit."
            },
            {
              name: "Zainab Malik",
              city: "Karachi",
              review: "Fast delivery via COD. The oversized silhouette holds its structure even after 5 washes. Best Pakistani label right now."
            },
            {
              name: "Shahmeer Khan",
              city: "Islamabad",
              review: "Packaging was super premium and the cargo fit was immaculate. Ryve is leading the local minimal fashion scene."
            }
          ].map((t, idx) => (
            <div key={idx} className="bg-ryve-charcoal/60 border border-ryve-border p-6 rounded-lg">
              <div className="flex text-ryve-accent mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 italic mb-4">"{t.review}"</p>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                {t.name} <span className="text-zinc-500 font-normal">| {t.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

