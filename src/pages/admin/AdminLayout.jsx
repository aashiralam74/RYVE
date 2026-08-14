import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Tags, Ticket, Users, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Categories', path: '/admin/categories', icon: Tags },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-ryve-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-ryve-charcoal border-r border-ryve-border p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-8">
            <span className="font-extrabold text-xl tracking-[0.25em] text-white uppercase font-display">
              RYVE<span className="text-ryve-accent">.</span> ADMIN
            </span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-ryve-card'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-ryve-border space-y-3">
          <Link to="/" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Website
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin View Container */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

