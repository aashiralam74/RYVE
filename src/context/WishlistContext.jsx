import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchWishlist = async () => {
    if (!user) {
      const local = localStorage.getItem('ryve_wishlist');
      setWishlist(local ? JSON.parse(local) : []);
      return;
    }
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id);
    if (!error && data) {
      setWishlist(data.map(item => item.product_id));
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    const isPresent = wishlist.includes(productId);
    const updated = isPresent ? wishlist.filter(id => id !== productId) : [...wishlist, productId];
    setWishlist(updated);

    if (!user) {
      localStorage.setItem('ryve_wishlist', JSON.stringify(updated));
      addToast(isPresent ? 'Removed from Wishlist' : 'Saved to Wishlist', 'info');
      return;
    }

    if (isPresent) {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
      addToast('Removed from Wishlist', 'info');
    } else {
      await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
      addToast('Saved to Wishlist', 'success');
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist: (id) => wishlist.includes(id) }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

