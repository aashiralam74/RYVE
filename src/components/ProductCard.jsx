import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const ProductCard = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const isWished = isInWishlist(product.id);

  const discountPercent = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Default to first variant if present
    const defaultVariant = product.variants?.[0] || { id: 'std', size: 'M', color: 'Black' };
    addToCart(product, defaultVariant, 1);
    addToast(`Added ${product.title} to bag`, 'success');
  };

  return (
    <div className="group relative flex flex-col bg-ryve-black border border-ryve-border/60 hover:border-zinc-500/50 rounded-lg overflow-hidden transition-all duration-300">
      {/* Product Image & Badges */}
      <div className="relative aspect-[3/4] bg-ryve-charcoal overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800'}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="bg-ryve-accent text-white text-[10px] font-extrabold uppercase px-2 py-0.5 tracking-wider rounded">
              -{discountPercent}%
            </span>
          )}
          {product.is_new && (
            <span className="bg-white text-black text-[10px] font-extrabold uppercase px-2 py-0.5 tracking-wider rounded">
              NEW DROP
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isWished ? 'bg-ryve-accent text-white' : 'bg-black/40 text-white hover:bg-black/80'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="flex-1 bg-ryve-charcoal/90 hover:bg-zinc-800 text-white text-xs font-semibold py-2.5 px-3 rounded flex items-center justify-center gap-1.5 border border-ryve-border backdrop-blur-md"
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
          )}
          <button
            onClick={handleQuickAdd}
            className="bg-white hover:bg-zinc-200 text-black p-2.5 rounded font-bold transition-colors"
            title="Quick Add"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Meta */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            {product.category?.name || 'Streetwear'}
          </span>
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm font-semibold text-white mt-1 line-clamp-1 hover:text-zinc-300 transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-ryve-border/40">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              PKR {Number(product.price).toLocaleString()}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-zinc-500 line-through">
                PKR {Number(product.compare_at_price).toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={handleQuickAdd}
            className="sm:hidden text-white bg-zinc-800 p-1.5 rounded"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

