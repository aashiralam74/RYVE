import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ryve_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [coupon, setCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ryve_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.variant.id === variant.id
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, variant, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, variantId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.variant.id === variantId
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const removeFromCart = (productId, variantId) => {
    setCart(prev => prev.filter(
      item => !(item.product.id === productId && item.variant.id === variantId)
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }
  }

  const shippingFee = subtotal > 5000 || cart.length === 0 ? 0 : 250; // Free shipping above PKR 5,000
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      discountAmount,
      shippingFee,
      total,
      totalItemsCount,
      coupon,
      setCoupon,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

