import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, profile, isDemoMode } = useAuth();
  
  // State initialization with dummy data cleanup
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('mh_matrimony_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out legacy dummy mock IDs
        const realOnly = parsed.filter(p => !p.id?.startsWith('cand-'));
        return realOnly;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [interests, setInterests] = useState(() => {
    const saved = localStorage.getItem('mh_matrimony_interests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(i => !i.id?.startsWith('int-001'));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [shortlistedIds, setShortlistedIds] = useState(() => {
    const saved = localStorage.getItem('vadhu_var_shortlisted');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(id => !id.startsWith('cand-'));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [verificationRequests, setVerificationRequests] = useState([]);
  const [dailyInterestCount, setDailyInterestCount] = useState(0);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [loading, setLoading] = useState(false);

  // Fresh re-fetch profiles directly from Supabase
  const refreshProfiles = useCallback(async () => {
    if (!isSupabaseConfigured() || isDemoMode) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .eq('is_visible', true)
        .neq('full_name', 'Deleted User')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const cleanProfiles = data
          .filter(p => 
            !p.id?.startsWith('cand-') && 
            p.id !== 'c56a06d9-449b-4183-8844-fdbaa372e421' &&
            p.id !== '03f712b6-45d5-4b3c-93a0-bddc9958a031' &&
            p.is_active !== false && 
            p.is_visible !== false && 
            p.full_name && 
            p.full_name !== 'Deleted User' &&
            !p.full_name.toLowerCase().startsWith('test ')
          )
          .map(p => {
            let gender = p.gender;
            if (p.id === '884e0a8b-ba38-4ee7-843a-a081365c3fc5' || p.full_name?.toLowerCase().includes('rishikesh')) {
              gender = 'male';
            }

            let income = p.annual_income_lpa;
            if (income && income > 1000) {
              // Convert raw INR (e.g. 750000) to LPA (e.g. 7.5)
              income = Math.round((income / 100000) * 10) / 10;
            }

            return {
              ...p,
              gender,
              annual_income_lpa: income
            };
          });
        setProfiles(cleanProfiles);
        localStorage.setItem('mh_matrimony_profiles', JSON.stringify(cleanProfiles));
      }
    } catch (err) {
      console.warn('Error refreshing live profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  // Initial mount fresh profiles re-fetch
  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  // Synchronize with LocalStorage
  useEffect(() => {
    localStorage.setItem('mh_matrimony_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('mh_matrimony_interests', JSON.stringify(interests));
  }, [interests]);

  useEffect(() => {
    localStorage.setItem('vadhu_var_shortlisted', JSON.stringify(shortlistedIds));
  }, [shortlistedIds]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const clearToast = () => setToast({ message: '', type: 'success' });

  const toggleShortlist = (candidateId) => {
    setShortlistedIds(prev => {
      const isShort = prev.includes(candidateId);
      if (isShort) {
        showToast('Candidate removed from shortlists.', 'info');
        return prev.filter(id => id !== candidateId);
      } else {
        showToast('Candidate added to shortlists!');
        return [...prev, candidateId];
      }
    });
  };

  const isShortlisted = (candidateId) => shortlistedIds.includes(candidateId);

  // Express Interest with Duplicate & Self Guards
  const sendInterest = async (receiverId) => {
    const senderId = profile?.id || user?.id;

    if (!senderId) {
      showToast('Please sign in to express interest.', 'error');
      throw new Error('You must be logged in to express interest.');
    }

    if (senderId === receiverId) {
      showToast('You cannot express interest in your own profile.', 'error');
      throw new Error('Cannot express interest in own profile.');
    }

    const existing = interests.find(
      i => i.sender_id === senderId && i.receiver_id === receiverId
    );
    if (existing) {
      showToast('Interest already expressed for this candidate.', 'info');
      return existing;
    }

    const newInterest = {
      id: `int-${Date.now()}`,
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setInterests(prev => [newInterest, ...prev]);
    showToast('Interest expressed successfully!');

    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        const { data, error } = await supabase
          .from('interests')
          .insert({ sender_id: senderId, receiver_id: receiverId, status: 'pending' })
          .select()
          .single();

        if (error) {
          setInterests(prev => prev.filter(i => i.id !== newInterest.id));
          showToast('Failed to send interest. Rolled back.', 'error');
          throw error;
        }

        if (data) {
          setInterests(prev => prev.map(item => item.id === newInterest.id ? data : item));
        }
      } catch (err) {
        console.error('Supabase interest error:', err);
      }
    }

    return newInterest;
  };

  // Accept / Decline Interest
  const updateInterestStatus = async (interestId, newStatus) => {
    setInterests(prev =>
      prev.map(item => item.id === interestId ? { ...item, status: newStatus } : item)
    );
    showToast(`Proposal ${newStatus === 'accepted' ? 'accepted' : 'declined'}.`);

    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        await supabase.from('interests').update({ status: newStatus }).eq('id', interestId);
      } catch (err) {
        console.error('Supabase interest status update error:', err);
      }
    }
  };

  // Submit Verification Document
  const submitVerificationRequest = async (userId, idDocUrl, familyDocUrl = null) => {
    const newRequest = {
      id: `req-${Date.now()}`,
      user_id: userId,
      id_document_url: idDocUrl,
      family_consent_document_url: familyDocUrl,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setVerificationRequests(prev => [newRequest, ...prev]);
    showToast('Verification documents submitted for review!');

    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        const { data, error } = await supabase
          .from('verification_requests')
          .insert({
            user_id: userId,
            id_document_url: idDocUrl,
            family_consent_document_url: familyDocUrl,
            status: 'pending'
          })
          .select()
          .single();

        if (!error && data) {
          setVerificationRequests(prev => prev.map(r => r.id === newRequest.id ? data : r));
        }
      } catch (err) {
        console.error('Supabase verification submit error:', err);
      }
    }
    return newRequest;
  };

  const addOrUpdateProfile = (profileData) => {
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === profileData.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...profileData };
        return updated;
      }
      return [profileData, ...prev];
    });
  };

  return (
    <DataContext.Provider
      value={{
        profiles,
        interests,
        shortlistedIds,
        verificationRequests,
        dailyInterestCount,
        toast,
        loading,
        privacySettings: { photoBlur: false, phoneShield: true, incognito: false },
        updatePrivacySettings: () => {},
        showToast,
        clearToast,
        refreshProfiles,
        toggleShortlist,
        isShortlisted,
        sendInterest,
        updateInterestStatus,
        submitVerificationRequest,
        addOrUpdateProfile
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
