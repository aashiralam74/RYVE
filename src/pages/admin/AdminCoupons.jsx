import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../../context/ToastContext';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_spend: '',
    is_active: true,
    expires_at: ''
  });

  const { addToast } = useToast();

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('expires_at', { ascending: true });

    if (error) {
      console.error(error);
      addToast(error.message, 'error');
      return;
    }

    setCoupons(data || []);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_spend: '',
      is_active: true,
      expires_at: ''
    });
    setEditingCoupon(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);

    setFormData({
      code: coupon.code || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value || '',
      min_spend: coupon.min_spend || '',
      is_active: coupon.is_active ?? true,
      expires_at: coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().slice(0, 16)
        : ''
    });

    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      min_spend: formData.min_spend ? Number(formData.min_spend) : 0,
      is_active: formData.is_active,
      expires_at: formData.expires_at
        ? new Date(formData.expires_at).toISOString()
        : null
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(payload)
        .eq('id', editingCoupon.id);

      if (error) {
        addToast(error.message, 'error');
        return;
      }

      addToast('Coupon updated successfully!', 'success');
    } else {
      const { error } = await supabase
        .from('coupons')
        .insert([payload]);

      if (error) {
        addToast(error.message, 'error');
        return;
      }

      addToast('Coupon created successfully!', 'success');
    }

    setIsModalOpen(false);
    resetForm();
    fetchCoupons();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      addToast(error.message, 'error');
      return;
    }

    addToast('Coupon deleted', 'info');
    fetchCoupons();
  };

  const toggleActive = async (coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (error) {
      addToast(error.message, 'error');
      return;
    }

    fetchCoupons();
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            Coupons
          </h1>

          <p className="text-xs text-zinc-400 mt-1">
            Manage discount codes and promotions
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-white text-black px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      <div className="bg-ryve-charcoal border border-ryve-border rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">

          <thead className="bg-ryve-black text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Spend</th>
              <th className="p-4">Expires</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-ryve-border">

            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-ryve-card/30">

                <td className="p-4 font-bold text-white">
                  {coupon.code}
                </td>

                <td className="p-4 text-zinc-300">
                  {coupon.discount_type === 'percentage'
                    ? `${coupon.discount_value}%`
                    : `PKR ${Number(coupon.discount_value).toLocaleString()}`}
                </td>

                <td className="p-4 text-zinc-400">
                  PKR {Number(coupon.min_spend || 0).toLocaleString()}
                </td>

                <td className="p-4 text-zinc-400">
                  {coupon.expires_at
                    ? new Date(coupon.expires_at).toLocaleDateString()
                    : 'No expiry'}
                </td>

                <td className="p-4">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      coupon.is_active
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>

                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">

                    <button
                      onClick={() => openEditModal(coupon)}
                      className="text-zinc-500 hover:text-white p-1"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </td>

              </tr>
            ))}

          </tbody>
        </table>

        {coupons.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            No coupons found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">

          <div className="bg-ryve-charcoal border border-ryve-border w-full max-w-lg rounded-xl p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-lg font-bold uppercase text-white">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <form onSubmit={handleSave} className="space-y-4">

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Coupon Code
                </label>

                <input
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase()
                    })
                  }
                  placeholder="RYVE10"
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Discount Type
                  </label>

                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value
                      })
                    }
                    className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Discount Value
                  </label>

                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: e.target.value
                      })
                    }
                    className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none"
                  />
                </div>

              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Minimum Spend (PKR)
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.min_spend}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_spend: e.target.value
                    })
                  }
                  placeholder="3000"
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Expiry Date
                </label>

                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expires_at: e.target.value
                    })
                  }
                  className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked
                    })
                  }
                />
                Coupon is active
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-ryve-border">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black rounded font-bold uppercase"
                >
                  {editingCoupon ? 'Update' : 'Create'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};