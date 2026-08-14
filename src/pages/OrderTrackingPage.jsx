import React from 'react';
import { supabase } from '../services/supabaseClient';

export const OrderTrackingPage = () => {
  const [orderInput, setOrderInput] = React.useState('');
  const [orderData, setOrderData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const statuses = ['Order Placed', 'Processing', 'Packed', 'Shipped', 'Delivered'];

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    if (!orderInput.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('order_number', orderInput.trim().toUpperCase())
      .single();

    setOrderData(data || null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ryve-black text-white max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-ryve-accent">Live Logistics</span>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight font-display mt-1">Track Your Order</h1>
        <p className="text-zinc-400 text-xs mt-1">Enter your unique order number (e.g. RYVE-123456)</p>
      </div>

      <form onSubmit={handleSearchOrder} className="flex gap-2 max-w-md mx-auto mb-12">
        <input
          type="text"
          required
          value={orderInput}
          onChange={(e) => setOrderInput(e.target.value)}
          placeholder="RYVE-XXXXXX"
          className="flex-1 bg-ryve-charcoal border border-ryve-border rounded p-3.5 text-xs text-white uppercase outline-none focus:border-white"
        />
        <button
          type="submit"
          className="bg-white text-black px-6 text-xs font-bold uppercase rounded hover:bg-zinc-200"
        >
          Track
        </button>
      </form>

      {loading ? (
        <div className="text-center text-zinc-400 text-xs">Fetching dispatch records...</div>
      ) : orderData ? (
        <div className="bg-ryve-charcoal border border-ryve-border p-6 rounded-lg space-y-8">
          <div className="flex flex-wrap justify-between items-center border-b border-ryve-border pb-4 gap-2">
            <div>
              <p className="text-xs text-zinc-400">Order Reference</p>
              <h3 className="text-base font-bold text-white">{orderData.order_number}</h3>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Current Status</p>
              <span className="inline-block bg-ryve-accent/20 border border-ryve-accent/40 text-ryve-accent font-bold text-xs px-2.5 py-1 rounded">
                {orderData.status}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="relative flex items-center justify-between">
            {statuses.map((st, idx) => {
              const currentIdx = statuses.indexOf(orderData.status);
              const isPassed = idx <= currentIdx;
              return (
                <div key={st} className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isPassed ? 'bg-white text-black' : 'bg-ryve-card text-zinc-500 border border-ryve-border'}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] uppercase font-bold mt-2 ${isPassed ? 'text-white' : 'text-zinc-600'}`}>{st}</span>
                </div>
              );
            })}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-ryve-border -z-0" />
          </div>

          {/* Order Details */}
          <div className="border-t border-ryve-border pt-4">
            <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3">Items in Parcel</h4>
            <div className="divide-y divide-ryve-border/40">
              {orderData.items?.map(it => (
                <div key={it.id} className="py-2 flex justify-between text-xs">
                  <span>{it.title} ({it.size} - {it.color}) x{it.quantity}</span>
                  <span className="font-bold">PKR {Number(it.price * it.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : searched ? (
        <div className="text-center text-zinc-500 text-xs">No active order found with ID "{orderInput}".</div>
      ) : null}
    </div>
  );
};

