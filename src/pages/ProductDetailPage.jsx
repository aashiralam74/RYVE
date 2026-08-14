import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name), variants:product_variants(*)')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedSize(data.variants[0].size);
          setSelectedColor(data.variants[0].color);
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-ryve-black flex items-center justify-center text-white">Loading Drop Details...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-ryve-black flex items-center justify-center text-white">Product Not Found</div>;
  }

  const availableSizes = [...new Set(product.variants?.map(v => v.size) || ['S', 'M', 'L', 'XL'])];
  const availableColors = [...new Set(product.variants?.map(v => v.color) || ['Black'])];
  const currentVariant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor) || { id: 'default', stock: 10 };

  const handleAddToCart = () => {
    addToCart(product, { ...currentVariant, size: selectedSize, color: selectedColor }, quantity);
    addToast(`Added ${quantity}x ${product.title} to Bag`, 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-ryve-black text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Gallery & Zoom Display */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-ryve-charcoal rounded-lg overflow-hidden border border-ryve-border">
            <img
              src={product.images?.[selectedImage] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000'}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-24 rounded overflow-hidden border-2 shrink-0 transition-all ${selectedImage === idx ? 'border-white' : 'border-ryve-border opacity-60'}`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-ryve-accent">
              {product.category?.name || 'Streetwear'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mt-1">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold text-white">PKR {Number(product.price).toLocaleString()}</span>
              {product.compare_at_price && (
                <span className="text-base text-zinc-500 line-through">
                  PKR {Number(product.compare_at_price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-6 text-zinc-300 text-xs sm:text-sm leading-relaxed font-normal">
              {product.description || 'Custom crafted with high-density cotton, drop-shoulder seams, and minimal street tailoring for everyday statements.'}
            </p>

            {/* Color Selector */}
            <div className="mt-8">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">Color: {selectedColor}</label>
              <div className="flex gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded border transition-all ${selectedColor === color ? 'bg-white text-black border-white' : 'bg-ryve-charcoal text-white border-ryve-border'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Select Size</label>
                <span className="text-[11px] text-zinc-500 underline cursor-pointer">Size Guide</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs font-bold uppercase rounded border transition-all ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-ryve-charcoal text-white border-ryve-border hover:border-zinc-500'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-ryve-border rounded bg-ryve-charcoal">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-zinc-400 hover:text-white">-</button>
                <span className="px-4 text-xs font-bold text-white">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-zinc-400 hover:text-white">+</button>
              </div>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock & Ready to Dispatch
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-white hover:bg-zinc-200 text-black py-4 rounded font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4" /> Add To Bag
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-ryve-accent hover:bg-ryve-accentHover text-white py-4 rounded font-bold uppercase tracking-widest text-xs transition-all"
              >
                Buy It Now
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 rounded border transition-all ${isInWishlist(product.id) ? 'bg-ryve-accent border-ryve-accent text-white' : 'bg-ryve-charcoal border-ryve-border text-white'}`}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Details */}
          <div className="mt-10 border-t border-ryve-border pt-6 space-y-3 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-white shrink-0" />
              <span>Standard delivery 2-4 working days across Pakistan (COD Available).</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-white shrink-0" />
              <span>7-day return and size replacement policy.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-white shrink-0" />
              <span>Pre-shrunk 100% premium fabric milled specifically for RYVE.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

