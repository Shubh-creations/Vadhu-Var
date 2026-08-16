import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { captureError } from '../lib/sentry';

const AuthContext = createContext();

// Admin User IDs authorized for verification review and platform management
export const ADMIN_UIDS = [
  '7505771e-35af-4b12-818a-d2e0396a096f',
  '277135f2-36c1-4baf-a4c5-a0c850c16500'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAccountDeactivated, setIsAccountDeactivated] = useState(false);
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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      return hash.includes('type=recovery') || search.includes('type=recovery');
    }
    return false;
  });

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
        // If account has been deactivated/deleted, block normal app access
        if (data.is_active === false) {
          setIsAccountDeactivated(true);
          setProfile(data);
          return data;
        }

        setIsAccountDeactivated(false);
        setProfile(data);
        localStorage.setItem('vadhu_var_profile', JSON.stringify(data));
        return data;
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
          const parsed = JSON.parse(storedProfile);
          if (parsed.is_active === false) {
            setIsAccountDeactivated(true);
          }
          setProfile(parsed);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen to Supabase auth state changes if configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }
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

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: fullName }
          }
        });

        if (error) throw error;
        if (data?.user) {
          setUser(data.user);
        }
        return data;
      } catch (err) {
        captureError(err, { tags: { flow: 'signup' } });
        throw new Error(err.message || 'Signup failed');
      }
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
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data?.user) {
          setUser(data.user);
          const profileData = await fetchUserProfile(data.user.id);
          if (profileData && profileData.is_active === false) {
            setIsAccountDeactivated(true);
          }
          await fetchPartnerPreferences(data.user.id);
        }
        return data;
      } catch (err) {
        captureError(err, { tags: { flow: 'login' } });
        throw new Error(err.message || 'Invalid login credentials');
      }
    } else {
      // Demo / Local Login
      const storedUser = localStorage.getItem('vadhu_var_user');
      let mockUser = storedUser ? JSON.parse(storedUser) : null;

      if (!mockUser || mockUser.email !== email) {
        mockUser = {
          id: `user-${Date.now()}`,
          email,
          user_metadata: { full_name: fullNameFromEmail(email) }
        };
      }

      setUser(mockUser);
      localStorage.setItem('vadhu_var_user', JSON.stringify(mockUser));

      const storedProfile = localStorage.getItem('vadhu_var_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed.is_active === false) {
          setIsAccountDeactivated(true);
        }
        setProfile(parsed);
      }
      return { user: mockUser };
    }
  };

  // Trigger Password Reset Email via Supabase
  const resetPassword = async (email) => {
    if (isSupabaseConfigured() && !isDemoMode) {
      const redirectUrl = typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://vadhu-var.vercel.app';

      try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl
        });

        if (error) throw error;
        return data;
      } catch (err) {
        captureError(err, { tags: { flow: 'resetPassword' } });
        throw new Error(err.message || 'Failed to send password recovery email.');
      }
    } else {
      return { success: true };
    }
  };

  // Update password after user clicks reset link
  const updatePassword = async (newPassword) => {
    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('vadhu_var_user', JSON.stringify(data.user));
          await fetchUserProfile(data.user.id);
          await fetchPartnerPreferences(data.user.id);
        }

        setIsPasswordRecovery(false);

        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        return data;
      } catch (err) {
        captureError(err, { tags: { flow: 'updatePassword' } });
        throw new Error(err.message || 'Could not update password.');
      }
    } else {
      setIsPasswordRecovery(false);
      return { success: true };
    }
  };

  // Logout user
  const logout = async () => {
    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // silent
      }
    }
    setUser(null);
    setProfile(null);
    setIsPasswordRecovery(false);
    setIsAccountDeactivated(false);
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

  // Numeric sanitizer helper
  const sanitizeNumeric = (value) => {
    if (value === '' || value === undefined || value === null) {
      return null;
    }
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  // Save or update user profile
  const saveProfile = async (profileData) => {
    const { 
      id_document_url, 
      family_consent_document_url, 
      career_proof_url, 
      computedMatchScore,
      ...profileColumns 
    } = profileData;

    const hasKids = (profileColumns.has_children === 'yes' || profileColumns.has_children === true) && (profileColumns.marital_status !== 'never_married');
    const cleanChildrenCount = hasKids ? sanitizeNumeric(profileColumns.children_count) : null;
    const cleanChildrenStatus = hasKids ? (profileColumns.children_living_status || null) : null;

    const fullProfile = {
      ...profileData,
      id: user?.id || `user-${Date.now()}`,
      age: sanitizeNumeric(profileData.age) || 26,
      height_cm: sanitizeNumeric(profileData.height_cm),
      annual_income_lpa: sanitizeNumeric(profileData.annual_income_lpa),
      has_children: hasKids,
      children_count: cleanChildrenCount,
      children_living_status: cleanChildrenStatus,
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
      has_children: hasKids,
      children_count: cleanChildrenCount,
      children_living_status: cleanChildrenStatus,
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
        captureError(err, { tags: { flow: 'saveProfile' }, user: { id: user?.id } });
        console.error('Supabase profile save error:', err);
        throw new Error(err.message || 'Database error: Could not save profile to Supabase.');
      }
    }
    return fullProfile;
  };

  // Save Partner Preferences
  const savePartnerPreferences = async (prefData) => {
    const fullPref = {
      ...prefData,
      user_id: user?.id || `user-${Date.now()}`,
      age_min: sanitizeNumeric(prefData.age_min) || 21,
      age_max: sanitizeNumeric(prefData.age_max) || 35,
      height_min_cm: sanitizeNumeric(prefData.height_min_cm) || 150,
      height_max_cm: sanitizeNumeric(prefData.height_max_cm) || 190,
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
        captureError(err, { tags: { flow: 'savePartnerPreferences' }, user: { id: user?.id } });
        console.error('Supabase partner preferences save error:', err);
        throw new Error(err.message || 'Database error: Could not save partner preferences.');
      }
    }
    return fullPref;
  };

  // Update Account Settings (Visibility / Incognito)
  const updateAccountSettings = async (settings) => {
    if (!profile && !user) return;
    const updated = {
      ...profile,
      ...settings,
      id: user?.id || profile?.id
    };
    return await saveProfile(updated);
  };

  // Real "Delete My Account & Personal Data" Flow (No service_role required)
  const deleteAccountAndData = async () => {
    const currentUserId = user?.id || profile?.id;
    if (!currentUserId) {
      throw new Error('No active user session found to delete.');
    }

    try {
      if (isSupabaseConfigured() && !isDemoMode) {
        // 1. Delete user files from Supabase Storage buckets (avatars, verification-docs, documents)
        const buckets = ['avatars', 'verification-docs', 'documents'];
        for (const bucketName of buckets) {
          try {
            const { data: fileList } = await supabase.storage.from(bucketName).list(currentUserId);
            if (fileList && fileList.length > 0) {
              const filePaths = fileList.map(f => `${currentUserId}/${f.name}`);
              await supabase.storage.from(bucketName).remove(filePaths);
            }
          } catch (storageErr) {
            console.warn(`Storage file removal notice for ${bucketName}:`, storageErr);
          }
        }

        // 2. Anonymize user profile row & deactivate
        const anonymizedPayload = {
          full_name: 'Deleted User',
          bio: null,
          photo_url: null,
          career_proof_url: null,
          city: null,
          state: null,
          occupation: null,
          education_level: null,
          caste: null,
          sub_caste: null,
          annual_income_lpa: null,
          children_count: null,
          children_living_status: null,
          has_children: false,
          is_active: false,
          is_visible: false,
          is_id_verified: false,
          is_fully_verified: false,
          is_profession_verified: false
        };

        const { error: updateErr } = await supabase
          .from('profiles')
          .update(anonymizedPayload)
          .eq('id', currentUserId);

        if (updateErr) {
          captureError(updateErr, { tags: { flow: 'deleteAccount' }, user: { id: currentUserId } });
        }

        // 3. Delete verification requests and uploaded document records
        try {
          await supabase.from('verification_requests').delete().eq('user_id', currentUserId);
        } catch (e) {
          // silent
        }

        // 4. Delete partner preferences
        try {
          await supabase.from('partner_preferences').delete().eq('user_id', currentUserId);
        } catch (e) {
          // silent
        }

        // 5. Delete sent or received interests
        try {
          await supabase.from('interests').delete().or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);
        } catch (e) {
          // silent
        }

        // 6. Sign out from Supabase Auth
        await supabase.auth.signOut();
      }

      // 5. Clear all client local cache
      setUser(null);
      setProfile(null);
      setIsAccountDeactivated(false);
      localStorage.removeItem('vadhu_var_user');
      localStorage.removeItem('vadhu_var_profile');
      localStorage.removeItem('vadhu_var_partner_preferences');
      localStorage.removeItem('mh_matrimony_profiles');
      localStorage.removeItem('vadhu_var_shortlisted');
      localStorage.removeItem('vadhu_var_privacy_settings');

      return { success: true };
    } catch (err) {
      captureError(err, { tags: { flow: 'deleteAccount' }, user: { id: currentUserId } });
      throw err;
    }
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
        isAccountDeactivated,
        setIsAccountDeactivated,
        setIsDemoMode,
        signUp,
        signup: signUp,
        login,
        logout,
        resetPassword,
        updatePassword,
        isPasswordRecovery,
        setIsPasswordRecovery,
        saveProfile,
        savePartnerPreferences,
        updateAccountSettings,
        deleteAccountAndData,
        fetchUserProfile,
        fetchPartnerPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
