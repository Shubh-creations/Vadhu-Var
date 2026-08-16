import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [partnerPreferences, setPartnerPreferences] = useState(() => {
    const saved = localStorage.getItem('vadhu_var_partner_preferences');
    return saved ? JSON.parse(saved) : {
      age_min: 21,
      age_max: 35,
      height_min_cm: 150,
      height_max_cm: 190,
      accepted_marital_statuses: ['never_married', 'divorced', 'widowed', 'awaiting_divorce'],
      diet: 'any',
      min_income_lpa: 'all',
      state: 'any',
      city: '',
      education: 'any',
      notes: ''
    };
  });
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  const isAdmin = Boolean(
    (user?.id && ADMIN_UIDS.includes(user.id)) || 
    profile?.is_admin === true
  );

  // Fetch partner preferences from Supabase
  const fetchPartnerPreferences = useCallback(async (userId) => {
    if (!supabase || !userId) return;
    try {
      const { data, error } = await supabase
        .from('partner_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setPartnerPreferences(data);
        localStorage.setItem('vadhu_var_partner_preferences', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Could not fetch partner preferences:', err);
    }
  }, []);

  // Fetch profile from Supabase
  const fetchUserProfile = useCallback(async (userId) => {
    if (!supabase || !userId) return;
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
  }, []);

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
            await fetchPartnerPreferences(session.user.id);
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
          await fetchPartnerPreferences(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      });
      return () => subscription?.unsubscribe();
    }
  }, [isDemoMode, fetchUserProfile, fetchPartnerPreferences]);

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
        await fetchPartnerPreferences(data.user.id);
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
    localStorage.removeItem('vadhu_var_partner_preferences');
  };

  // Helper function
  function fullNameFromEmail(email) {
    if (!email) return 'Candidate';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }

  // Numeric sanitizer helper to prevent Postgres 'invalid input syntax for type numeric: ""' errors
  const sanitizeNumeric = (value) => {
    if (value === '' || value === undefined || value === null) {
      return null;
    }
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  // Save or update user profile
  const saveProfile = async (profileData) => {
    // Separate document upload fields which are persisted in the verification_requests table
    const { 
      id_document_url, 
      family_consent_document_url, 
      career_proof_url, 
      computedMatchScore,
      ...profileColumns 
    } = profileData;

    const fullProfile = {
      ...profileData,
      id: user?.id || `user-${Date.now()}`,
      age: sanitizeNumeric(profileData.age) || 26,
      height_cm: sanitizeNumeric(profileData.height_cm),
      annual_income_lpa: sanitizeNumeric(profileData.annual_income_lpa),
      children_count: sanitizeNumeric(profileData.children_count),
      is_active: profileData.is_active !== undefined ? profileData.is_active : true,
      is_visible: profileData.is_visible !== undefined ? profileData.is_visible : (profileData.is_search_visible !== undefined ? profileData.is_search_visible : true),
      created_at: profileData.created_at || new Date().toISOString()
    };

    const dbPayload = {
      ...profileColumns,
      id: user?.id || `user-${Date.now()}`,
      age: sanitizeNumeric(profileColumns.age) || 26,
      height_cm: sanitizeNumeric(profileColumns.height_cm),
      annual_income_lpa: sanitizeNumeric(profileColumns.annual_income_lpa),
      children_count: sanitizeNumeric(profileColumns.children_count),
      diet: (profileColumns.diet || 'veg').toLowerCase().trim(),
      marital_status: (profileColumns.marital_status || 'never_married').toLowerCase().trim(),
      family_type: (profileColumns.family_type || 'nuclear').toLowerCase().trim(),
      gender: (profileColumns.gender || 'female').toLowerCase().trim(),
      is_active: fullProfile.is_active,
      is_visible: fullProfile.is_visible,
      created_at: fullProfile.created_at
    };

    setProfile(fullProfile);
    localStorage.setItem('vadhu_var_profile', JSON.stringify(fullProfile));

    if (isSupabaseConfigured() && !isDemoMode && user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({ ...dbPayload, id: user.id })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const merged = { ...fullProfile, ...data };
          setProfile(merged);
          localStorage.setItem('vadhu_var_profile', JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        console.error('Supabase profile save error:', err);
        throw new Error(err.message || 'Database error: Could not save profile to Supabase.');
      }
    }
    return fullProfile;
  };

  // Save or update partner preferences
  const savePartnerPreferences = async (prefData) => {
    const fullPref = {
      ...prefData,
      user_id: user?.id || `user-${Date.now()}`,
      age_min: sanitizeNumeric(prefData.age_min),
      age_max: sanitizeNumeric(prefData.age_max),
      height_min_cm: sanitizeNumeric(prefData.height_min_cm),
      height_max_cm: sanitizeNumeric(prefData.height_max_cm),
      updated_at: new Date().toISOString()
    };

    const dbPrefPayload = {
      ...prefData,
      user_id: user?.id || `user-${Date.now()}`,
      age_min: sanitizeNumeric(prefData.age_min),
      age_max: sanitizeNumeric(prefData.age_max),
      height_min_cm: sanitizeNumeric(prefData.height_min_cm),
      height_max_cm: sanitizeNumeric(prefData.height_max_cm),
      updated_at: new Date().toISOString()
    };

    setPartnerPreferences(fullPref);
    localStorage.setItem('vadhu_var_partner_preferences', JSON.stringify(fullPref));

    if (isSupabaseConfigured() && !isDemoMode && user) {
      try {
        const { data, error } = await supabase
          .from('partner_preferences')
          .upsert({ ...dbPrefPayload, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPartnerPreferences(data);
          localStorage.setItem('vadhu_var_partner_preferences', JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.error('Supabase partner preferences save error:', err);
        throw new Error(err.message || 'Database error: Could not save partner preferences.');
      }
    }
    return fullPref;
  };

  // Update Account Settings (Visibility / Deactivation)
  const updateAccountSettings = async (settings) => {
    if (!profile && !user) return;
    const updated = {
      ...profile,
      ...settings,
      id: user?.id || profile?.id
    };
    return await saveProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        partnerPreferences,
        isAdmin,
        loading,
        isDemoMode,
        setIsDemoMode,
        signUp,
        signup: signUp,
        login,
        logout,
        saveProfile,
        savePartnerPreferences,
        updateAccountSettings,
        fetchUserProfile,
        fetchPartnerPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
