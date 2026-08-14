import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabaseClient';

export const CheckoutPage = () => {
  const { cart, subtotal, discountAmount, shippingFee, total, coupon, setCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
    paymentMethod: 'COD'
  });

  const [couponInput, setCouponInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      addToast('Invalid or expired discount code', 'error');
      return;
    }

    if (subtotal < data.min_spend) {
      addToast(`Minimum spend of PKR ${data.min_spend} required`, 'error');
      return;
    }

    setCoupon(data);
    addToast(`Coupon ${data.code} applied successfully!`, 'success');
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      addToast('Your bag is empty', 'error');
      return;
    }

    setSubmitting(true);
    const orderNumber = `RYVE-${Date.now().toString().slice(-6)}`;

    try {
      // 1. Insert into Orders Table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: {
            street: formData.street,
            city: formData.city,
            province: formData.province,
            postal_code: formData.postalCode
          },
          payment_method: formData.paymentMethod,
          subtotal: subtotal,
          discount: discountAmount,
          shipping_fee: shippingFee,
          total: total,
          status: 'Order Placed'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        variant_id: item.variant.id !== 'default' && item.variant.id !== 'std' ? item.variant.id : null,
        title: item.product.title,
        size: item.variant.size,
        color: item.variant.color,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0]
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/order-success/${orderNumber}`);
    } catch (err) {
      console.error('Checkout error:', err);
      addToast('Error placing order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ryve-black text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight font-display mb-8">Checkout & Dispatch</h1>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Customer Information */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer Details */}
          <div className="bg-ryve-charcoal/50 border border-ryve-border p-6 rounded-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">1. Contact & Customer Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-xs text-white outline-none focus:border-white"
                  placeholder="e.g. Ali Ahmed"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Phone Number (For Delivery SMS) *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-xs text-white outline-none focus:border-white"
                  placeholder="03001234567"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-xs text-white outline-none focus:border-white"
                placeholder="ali@example.com"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-ryve-charcoal/50 border border-ryve-border p-6 rounded-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">2. Shipping Destination (Pakistan)</h3>
            
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Street Address / House / Flat No. *</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-xs text-white outline-none focus:border-white"
                placeholder="House 42-A, Street 12, Phase 5 DHA"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-xs text-white outline-none focus:border-white"
                  placeholder="Lahore / Karachi"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Province *</label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-xs text-white outline-none focus:border-white"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad Capital Territory">Islamabad</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-xs text-white outline-none focus:border-white"
                  placeholder="54000"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-ryve-charcoal/50 border border-ryve-border p-6 rounded-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">3. Payment Option</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'COD', label: 'Cash on Delivery', desc: 'Pay with cash upon receipt' },
                { id: 'Bank Transfer', label: 'Direct Bank Transfer', desc: 'HBL / Meezan Bank wire' },
                { id: 'JazzCash', label: 'JazzCash Wallet', desc: '0300-1234567 manual send' },
                { id: 'Easypaisa', label: 'Easypaisa Wallet', desc: '0300-1234567 manual send' }
              ].map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                  className={`p-4 rounded border cursor-pointer transition-all ${
                    formData.paymentMethod === pm.id ? 'border-white bg-zinc-800' : 'border-ryve-border bg-ryve-black'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{pm.label}</span>
                    <input
                      type="radio"
                      checked={formData.paymentMethod === pm.id}
                      onChange={() => setFormData({ ...formData, paymentMethod: pm.id })}
                      className="accent-ryve-accent"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">{pm.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-ryve-charcoal border border-ryve-border p-6 rounded-lg sticky top-28 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Order Summary</h3>

            {/* Cart Items Preview */}
            <div className="divide-y divide-ryve-border max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.variant.id}`} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={item.product.images?.[0]} alt={item.product.title} className="w-12 h-14 object-cover rounded bg-black" />
                    <div>
                      <h4 className="text-xs font-semibold text-white line-clamp-1">{item.product.title}</h4>
                      <span className="text-[11px] text-zinc-400">Qty: {item.quantity} | Size: {item.variant.size}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">PKR {(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter Coupon (e.g. RYVE10)"
                className="flex-1 bg-ryve-black border border-ryve-border rounded p-2.5 text-xs text-white uppercase outline-none focus:border-white"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 text-xs font-bold uppercase rounded"
              >
                Apply
              </button>
            </div>

            {/* Calculations */}
            <div className="space-y-2 border-t border-ryve-border pt-4 text-xs text-zinc-400 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">PKR {subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Nationwide</span>
                <span className="text-white">{shippingFee === 0 ? 'FREE' : `PKR ${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-ryve-border">
                <span>Total Amount</span>
                <span>PKR {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white hover:bg-zinc-200 text-black py-4 rounded font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? 'Confirming Order...' : 'Complete Order'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

