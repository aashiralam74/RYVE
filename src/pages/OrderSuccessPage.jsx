import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-[75vh] bg-ryve-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-ryve-charcoal border border-ryve-border p-8 rounded-xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-ryve-accent">Order Confirmed</span>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white mt-1">Thank You For Your Order</h1>
          <p className="text-zinc-400 text-xs mt-2">
            Your tracking ID is <span className="text-white font-mono font-bold">{orderId}</span>. We will notify you via SMS once your parcel is packed and dispatched.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            to={`/track-order?orderId=${orderId}`}
            className="w-full bg-white hover:bg-zinc-200 text-black py-3 rounded text-xs font-bold uppercase tracking-widest transition-all"
          >
            Track Order Status
          </Link>
          <Link
            to="/shop"
            className="text-zinc-400 hover:text-white text-xs font-semibold uppercase tracking-wider"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
};
