import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, subtotal, shippingFee, total } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-ryve-black border-l border-ryve-border flex flex-col shadow-2xl">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-ryve-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold uppercase tracking-wider text-white">Your Bag ({cart.length})</h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-ryve-border">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag className="w-16 h-16 text-zinc-700 mb-4" />
                <p className="text-white font-medium">Your bag is empty</p>
                <p className="text-zinc-500 text-xs mt-1">Add items from the latest drop to begin.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.product.id}-${item.variant.id}`} className="py-4 flex gap-4">
                  <img
                    src={item.product.images?.[0]}
                    alt={item.product.title}
                    className="w-20 h-24 object-cover rounded bg-ryve-card shrink-0"
                  />
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="text-sm font-semibold text-white line-clamp-1">{item.product.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">Size: {item.variant.size} | Color: {item.variant.color}</p>
                      <p className="text-xs font-bold text-white mt-1">PKR {Number(item.product.price).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-ryve-border rounded bg-ryve-charcoal">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.variant.id)}
                        className="text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-ryve-border bg-ryve-charcoal/50">
              <div className="space-y-2 mb-4 text-xs font-medium text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Nationwide</span>
                  <span className="text-white">{shippingFee === 0 ? 'FREE' : `PKR ${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-ryve-border">
                  <span>Estimated Total</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full bg-white hover:bg-zinc-200 text-black py-3.5 px-4 rounded font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

