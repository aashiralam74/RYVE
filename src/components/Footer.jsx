import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-ryve-black border-t border-ryve-border text-zinc-400 pt-16 pb-12">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-ryve-border grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="p-3 bg-ryve-charcoal rounded-full text-white border border-ryve-border">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Fast Express Shipping</h4>
            <p className="text-xs text-zinc-500 mt-0.5">2-4 business days across all of Pakistan</p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="p-3 bg-ryve-charcoal rounded-full text-white border border-ryve-border">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">7-Day Hassle Free Returns</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Easy exchanges & store credit guaranteed</p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="p-3 bg-ryve-charcoal rounded-full text-white border border-ryve-border">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">100% Authentic Quality</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Custom-milled high GSM fabrics</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <span className="font-extrabold text-2xl tracking-[0.25em] text-white uppercase font-display">
            RYVE<span className="text-ryve-accent">.</span>
          </span>
          <p className="text-xs text-zinc-400 leading-relaxed">
            RYVE CLOTHING CO. is a high-end streetwear imprint dedicated to architectural tailoring, heavyweight luxury cottons, and unapologetic minimalist identity.
          </p>
          <div className="flex items-center gap-4 text-white">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-ryve-accent transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-ryve-accent transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h5 className="text-white font-bold uppercase text-xs tracking-widest mb-4">Collections</h5>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/shop" className="hover:text-white transition-colors">Latest Drops</Link></li>
            <li><Link to="/shop?gender=men" className="hover:text-white transition-colors">Men's Streetwear</Link></li>
            <li><Link to="/shop?gender=women" className="hover:text-white transition-colors">Women's Oversized</Link></li>
            <li><Link to="/shop?category=hoodies" className="hover:text-white transition-colors">Heavyweight Hoodies</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-bold uppercase text-xs tracking-widest mb-4">Customer Care</h5>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
            <li><Link to="/account" className="hover:text-white transition-colors">My Profile & Orders</Link></li>
            <li><a href="mailto:support@ryveclothing.com" className="hover:text-white transition-colors">support@ryveclothing.com</a></li>
            <li><span className="text-zinc-500">WhatsApp: +92 300 1234567</span></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-bold uppercase text-xs tracking-widest mb-4">Payment Methods Supported</h5>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <div className="bg-ryve-charcoal border border-ryve-border p-2 rounded text-center text-zinc-300">Cash on Delivery</div>
            <div className="bg-ryve-charcoal border border-ryve-border p-2 rounded text-center text-zinc-300">JazzCash</div>
            <div className="bg-ryve-charcoal border border-ryve-border p-2 rounded text-center text-zinc-300">Easypaisa</div>
            <div className="bg-ryve-charcoal border border-ryve-border p-2 rounded text-center text-zinc-300">Bank Transfer</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-ryve-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
        <p>© {new Date().getFullYear()} RYVE CLOTHING CO. All Rights Reserved.</p>
        <p className="tracking-widest uppercase text-[10px]">Crafted for the modern archetype</p>
      </div>
    </footer>
  );
};

