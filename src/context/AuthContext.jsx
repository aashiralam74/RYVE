import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    console.log('🔍 Fetching profile for user:', userId);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ SUPABASE PROFILE ERROR:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        setProfile(null);
        return;
      }

      console.log('✅ PROFILE FOUND:', data);
      console.log('👑 IS ADMIN VALUE:', data?.is_admin);
      console.log('👑 IS ADMIN TYPE:', typeof data?.is_admin);

      setProfile(data);
    } catch (err) {
      console.error('❌ PROFILE FETCH CRASH:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      const {
        data: { session }
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signup = (email, password, fullName) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: !!profile?.is_admin,
        loading,
        login,
        signup,
        logout,
        refreshProfile: () => user && fetchProfile(user.id)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);