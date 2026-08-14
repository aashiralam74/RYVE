import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

export const Navbar = () => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const { data } = await supabase
        .from('products')
        .select('id, title, price, images, slug')
        .ilike('title', `%${query}%`)
        .limit(5);
      setSearchResults(data || []);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <>
      {/* Promotional Top Bar */}
      <div className="bg-ryve-black border-b border-ryve-border text-center py-2 px-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Free Nationwide Delivery on Orders Over PKR 5,000 | Code <span className="text-white font-bold">RYVE10</span>
      </div>

      {/* Main Navbar */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-ryve-black/90 backdrop-blur-md border-b border-ryve-border py-3.5' : 'bg-ryve-black py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-white p-1">
            <Menu className="w-6 h-6" />
          </button>

          {/* RYVE Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-[0.25em] text-white uppercase font-display">
              RYVE<span className="text-ryve-accent">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium uppercase tracking-wider text-zinc-300">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-white transition-colors">Shop All</Link>
            <Link to="/shop?gender=men" className="hover:text-white transition-colors">Men</Link>
            <Link to="/shop?gender=women" className="hover:text-white transition-colors">Women</Link>
            <Link to="/shop?filter=new" className="text-white font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-ryve-accent rounded-full animate-ping"></span>
              New Drops
            </Link>
            <Link to="/track-order" className="hover:text-white transition-colors text-zinc-400">Track Order</Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6 text-zinc-300">
            <button onClick={() => setSearchOpen(!searchOpen)} className="hover:text-white transition-colors p-1">
              <Search className="w-5 h-5" />
            </button>
            
            <Link to={user ? "/account" : "/login"} className="hover:text-white transition-colors p-1 relative">
              <User className="w-5 h-5" />
              {isAdmin && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ryve-accent rounded-full ring-2 ring-black" />}
            </Link>

            <Link to="/account?tab=wishlist" className="hover:text-white transition-colors p-1 relative hidden sm:block">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-ryve-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button onClick={() => setIsCartOpen(true)} className="hover:text-white transition-colors p-1 relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Global Interactive Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-ryve-charcoal border border-ryve-border w-full max-w-2xl rounded-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-ryve-border pb-4">
              <Search className="w-6 h-6 text-zinc-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search heavyweight tees, cargo pants, hoodies..."
                className="w-full bg-transparent text-white placeholder-zinc-500 text-lg outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="mt-4 divide-y divide-ryve-border max-h-80 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/product/${item.slug}`);
                      setSearchOpen(false);
                    }}
                    className="flex items-center justify-between py-3 hover:bg-ryve-card/50 px-3 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img src={item.images[0]} alt={item.title} className="w-12 h-14 object-cover rounded bg-ryve-card" />
                      <div>
                        <p className="text-white font-medium text-sm">{item.title}</p>
                        <p className="text-zinc-400 text-xs mt-0.5">PKR {Number(item.price).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="text-xs text-ryve-accent uppercase font-bold tracking-wider">View Item →</span>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 1 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">No street drops found for "{searchQuery}"</div>
            ) : null}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-6 lg:hidden">
          <div className="flex justify-between items-center pb-6 border-b border-ryve-border">
            <span className="font-extrabold text-2xl tracking-[0.25em] text-white uppercase font-display">
              RYVE<span className="text-ryve-accent">.</span>
            </span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-6 mt-8 text-lg uppercase tracking-wider font-semibold">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white">Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white">Shop All Drops</Link>
            <Link to="/shop?gender=men" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white">Men's Edit</Link>
            <Link to="/shop?gender=women" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white">Women's Edit</Link>
            <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white">Track Order</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-ryve-accent flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

