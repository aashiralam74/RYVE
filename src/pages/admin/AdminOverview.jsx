import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const { data: orders } = await supabase.from('orders').select('*');
      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

      if (orders) {
        const rev = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        setStats({
          totalRevenue: rev,
          totalOrders: orders.length,
          totalProducts: prodCount || 0
        });
        setRecentOrders(orders.slice(0, 5));
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Executive Dashboard</h1>
        <p className="text-xs text-zinc-400 mt-1">Live metrics across Pakistan sales channels</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-ryve-charcoal border border-ryve-border p-6 rounded-lg">
          <div className="flex justify-between items-center text-zinc-400 text-xs uppercase font-bold">
            <span>Total Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-2">PKR {stats.totalRevenue.toLocaleString()}</h2>
        </div>

        <div className="bg-ryve-charcoal border border-ryve-border p-6 rounded-lg">
          <div className="flex justify-between items-center text-zinc-400 text-xs uppercase font-bold">
            <span>Total Orders Placed</span>
            <ShoppingCart className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-2">{stats.totalOrders}</h2>
        </div>

        <div className="bg-ryve-charcoal border border-ryve-border p-6 rounded-lg">
          <div className="flex justify-between items-center text-zinc-400 text-xs uppercase font-bold">
            <span>Active Catalog SKUs</span>
            <Package className="w-4 h-4 text-ryve-accent" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-2">{stats.totalProducts}</h2>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-ryve-charcoal border border-ryve-border rounded-lg overflow-hidden">
        <div className="p-5 border-b border-ryve-border flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">Recent Customer Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ryve-black text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ryve-border">
              {recentOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-ryve-card/30">
                  <td className="p-4 font-mono font-bold">{ord.order_number}</td>
                  <td className="p-4">{ord.customer_name}</td>
                  <td className="p-4 text-zinc-400">{ord.payment_method}</td>
                  <td className="p-4 font-bold">PKR {Number(ord.total).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

