import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const { login, signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const { error } = await signup(email, password, fullName);
        if (error) throw error;
        addToast('Account created! Welcome to RYVE.', 'success');
      } else {
        const { error } = await login(email, password);
        if (error) throw error;
        addToast('Signed in successfully', 'success');
      }
      navigate('/account');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-[80vh] bg-ryve-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-ryve-charcoal border border-ryve-border p-8 rounded-xl space-y-6">
        <div className="text-center">
          <span className="font-extrabold text-2xl tracking-[0.25em] text-white uppercase font-display">
            RYVE<span className="text-ryve-accent">.</span>
          </span>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mt-2">
            {isRegister ? 'Create Member Profile' : 'Access Your Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="text-zinc-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none focus:border-white"
              />
            </div>
          )}

          <div>
            <label className="text-zinc-400 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ryve-black border border-ryve-border rounded p-3 text-white outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white hover:bg-zinc-200 text-black py-3.5 rounded font-bold uppercase tracking-widest text-xs transition-all"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-zinc-400 hover:text-white text-xs underline"
          >
            {isRegister ? 'Already have an account? Sign In' : 'New to RYVE? Register Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-ryve-black text-white p-10">Verifying security token...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

