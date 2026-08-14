import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../../context/ToastContext';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      addToast(`Order updated to ${newStatus}`, 'success');
      fetchOrders();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Order Fulfilment</h1>
        <p className="text-xs text-zinc-400 mt-1">Update live shipment tracking status for customer orders</p>
      </div>

      <div className="bg-ryve-charcoal border border-ryve-border rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-ryve-black text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer & City</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status Dispatch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ryve-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-ryve-card/30">
                <td className="p-4 font-mono font-bold text-white">{o.order_number}</td>
                <td className="p-4">
                  <div className="font-bold text-white">{o.customer_name}</div>
                  <div className="text-zinc-500 text-[11px]">{o.shipping_address?.city} | {o.customer_phone}</div>
                </td>
                <td className="p-4 text-zinc-300">{o.items?.length || 0} items</td>
                <td className="p-4 font-bold text-white">PKR {Number(o.total).toLocaleString()}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                    className="bg-ryve-black border border-ryve-border text-white text-xs font-semibold py-1.5 px-2.5 rounded outline-none"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

