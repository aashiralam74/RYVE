import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Package, Heart, User, LogOut } from 'lucide-react';

export const AccountPage = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-ryve-black text-white max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-ryve-border gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-ryve-accent">VIP Member Profile</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-1">
            {profile?.full_name || user.email}
          </h1>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="mt-8 space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-ryve-accent" /> Your Order History ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-ryve-charcoal/40 border border-ryve-border p-8 rounded-lg text-center text-zinc-500 text-xs">
            You haven't placed any orders with this profile yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(ord => (
              <div key={ord.id} className="bg-ryve-charcoal border border-ryve-border p-5 rounded-lg">
                <div className="flex justify-between items-center pb-3 border-b border-ryve-border/60">
                  <div>
                    <span className="font-mono font-bold text-white text-xs">{ord.order_number}</span>
                    <span className="text-zinc-500 text-[11px] ml-3">{new Date(ord.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">{ord.status}</span>
                </div>
                <div className="py-3 divide-y divide-ryve-border/30">
                  {ord.items?.map(it => (
                    <div key={it.id} className="py-1.5 flex justify-between text-xs text-zinc-300">
                      <span>{it.title} ({it.size}) x{it.quantity}</span>
                      <span>PKR {Number(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex justify-between text-xs font-bold text-white border-t border-ryve-border/40">
                  <span>Total Paid</span>
                  <span>PKR {Number(ord.total).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

