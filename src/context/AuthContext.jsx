import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  useEffect(() => {
    // Check initial auth state
    const initAuth = async () => {
      setLoading(true);

      if (isSupabaseConfigured() && !isDemoMode) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await fetchUserProfile(session.user.id);
          }
        } catch (err) {
          console.warn('Supabase auth fetch error, using local state:', err);
        }
      } else {
        // Demo Mode / Local Auth check
        const storedUser = localStorage.getItem('mh_matrimony_user');
        const storedProfile = localStorage.getItem('mh_matrimony_profile');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen to Supabase auth state changes if configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      });
      return () => subscription?.unsubscribe();
    }
  }, [isDemoMode]);

  // Fetch profile from Supabase
  const fetchUserProfile = async (userId) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
        localStorage.setItem('mh_matrimony_profile', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Sign up user
  const signUp = async (email, password, fullName) => {
    if (isSupabaseConfigured() && !isDemoMode) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
      setUser(data.user);
      return data;
    } else {
      // Local Demo Sign Up
      const mockUser = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName }
      };
      setUser(mockUser);
      localStorage.setItem('mh_matrimony_user', JSON.stringify(mockUser));
      return { user: mockUser };
    }
  };

  // Login user
  const login = async (email, password) => {
    if (isSupabaseConfigured() && !isDemoMode) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      setUser(data.user);
      await fetchUserProfile(data.user.id);
      return data;
    } else {
      // Demo Mode login check
      const mockUser = {
        id: 'demo-user-me',
        email: email || 'demo@example.com',
        user_metadata: { full_name: fullNameFromEmail(email) }
      };
      setUser(mockUser);
      localStorage.setItem('mh_matrimony_user', JSON.stringify(mockUser));
      return { user: mockUser };
    }
  };

  // Logout user
  const logout = async () => {
    if (isSupabaseConfigured() && !isDemoMode) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('mh_matrimony_user');
    localStorage.removeItem('mh_matrimony_profile');
  };

  // Helper function
  function fullNameFromEmail(email) {
    if (!email) return 'User';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }

  // Save or update local user profile
  const saveProfile = async (profileData) => {
    const fullProfile = {
      ...profileData,
      id: user?.id || `user-${Date.now()}`,
      created_at: profileData.created_at || new Date().toISOString()
    };

    setProfile(fullProfile);
    localStorage.setItem('mh_matrimony_profile', JSON.stringify(fullProfile));

    if (isSupabaseConfigured() && !isDemoMode && user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({ ...fullProfile, id: user.id })
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
        localStorage.setItem('mh_matrimony_profile', JSON.stringify(data));
      } catch (err) {
        console.error('Supabase profile save error:', err);
      }
    }
    return fullProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemoMode,
        setIsDemoMode,
        signUp,
        login,
        logout,
        saveProfile,
        fetchUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
