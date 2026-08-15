import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

// Admin User IDs authorized for verification review and platform management
export const ADMIN_UIDS = [
  '7505771e-35af-4b12-818a-d2e0396a096f',
  '277135f2-36c1-4baf-a4c5-a0c850c16500'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  const isAdmin = Boolean(
    (user?.id && ADMIN_UIDS.includes(user.id)) || 
    profile?.is_admin === true
  );

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
        // Local persistence check
        const storedUser = localStorage.getItem('vadhu_var_user');
        const storedProfile = localStorage.getItem('vadhu_var_profile');
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
        localStorage.setItem('vadhu_var_profile', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Sign up user with clean URL handling
  const signUp = async (email, password, fullNameOrOptions) => {
    const fullName = typeof fullNameOrOptions === 'object' 
      ? fullNameOrOptions?.full_name || fullNameFromEmail(email)
      : fullNameOrOptions || fullNameFromEmail(email);

    if (isSupabaseConfigured() && !isDemoMode) {
      const redirectUrl = typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://vadhu-var.vercel.app';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName }
        }
      });

      if (error) {
        throw new Error(error.message || 'Signup failed');
      }

      if (data?.user) {
        setUser(data.user);
      }
      return data;
    } else {
      // Local Sign Up Fallback
      const mockUser = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName }
      };
      setUser(mockUser);
      localStorage.setItem('vadhu_var_user', JSON.stringify(mockUser));
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

      if (error) {
        throw new Error(error.message || 'Invalid login credentials');
      }

      if (data?.user) {
        setUser(data.user);
        await fetchUserProfile(data.user.id);
      }
      return data;
    } else {
      // Demo / Local Login
      const storedUser = localStorage.getItem('vadhu_var_user');
      let mockUser = storedUser ? JSON.parse(storedUser) : null;

      if (!mockUser || mockUser.email !== email) {
        mockUser = {
          id: `user-${Date.now()}`,
          email: email || 'user@example.com',
          user_metadata: { full_name: fullNameFromEmail(email) }
        };
      }

      setUser(mockUser);
      localStorage.setItem('vadhu_var_user', JSON.stringify(mockUser));
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
    localStorage.removeItem('vadhu_var_user');
    localStorage.removeItem('vadhu_var_profile');
  };

  // Helper function
  function fullNameFromEmail(email) {
    if (!email) return 'Candidate';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }

  // Save or update user profile
  const saveProfile = async (profileData) => {
    const fullProfile = {
      ...profileData,
      id: user?.id || `user-${Date.now()}`,
      created_at: profileData.created_at || new Date().toISOString()
    };

    setProfile(fullProfile);
    localStorage.setItem('vadhu_var_profile', JSON.stringify(fullProfile));

    if (isSupabaseConfigured() && !isDemoMode && user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({ ...fullProfile, id: user.id })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setProfile(data);
          localStorage.setItem('vadhu_var_profile', JSON.stringify(data));
        }
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
        isAdmin,
        loading,
        isDemoMode,
        setIsDemoMode,
        signUp,
        signup: signUp,
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
