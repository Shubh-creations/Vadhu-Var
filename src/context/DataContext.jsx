import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_PROFILES, INITIAL_INTERESTS, INITIAL_VERIFICATION_REQUESTS } from '../lib/mockData';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, profile, isDemoMode } = useAuth();
  
  // State initialization
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('mh_matrimony_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [interests, setInterests] = useState(() => {
    const saved = localStorage.getItem('mh_matrimony_interests');
    return saved ? JSON.parse(saved) : INITIAL_INTERESTS;
  });

  const [shortlistedIds, setShortlistedIds] = useState(() => {
    const saved = localStorage.getItem('vadhu_var_shortlisted');
    return saved ? JSON.parse(saved) : ['cand-002'];
  });

  const [verificationRequests, setVerificationRequests] = useState(() => {
    const saved = localStorage.getItem('mh_matrimony_verification_requests');
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATION_REQUESTS;
  });

  // Daily Interest Expression Counter for Rate Limiting (max 20/day)
  const [dailyInterestCount, setDailyInterestCount] = useState(() => {
    const saved = localStorage.getItem('mh_matrimony_daily_interest');
    if (saved) {
      const parsed = JSON.parse(saved);
      const isToday = new Date(parsed.date).toDateString() === new Date().toDateString();
      if (isToday) return parsed.count;
    }
    return 0;
  });

  // In-app Toast message state
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('mh_matrimony_verification_requests', JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  useEffect(() => {
    localStorage.setItem(
      'mh_matrimony_daily_interest',
      JSON.stringify({ date: new Date().toISOString(), count: dailyInterestCount })
    );
  }, [dailyInterestCount]);

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

  // Express Interest with Rate Limiting (Max 20/day)
  const sendInterest = async (receiverId) => {
    const senderId = profile?.id || user?.id || 'demo-user-me';

    if (!senderId) {
      showToast('Please sign in to express interest.', 'error');
      throw new Error('You must be logged in to express interest.');
    }

    // Rate limiting check
    if (dailyInterestCount >= 20) {
      showToast('Daily limit reached (Max 20 interests per day to prevent spam). Try again tomorrow!', 'error');
      throw new Error('Daily limit reached (20/day).');
    }

    const existing = interests.find(
      i => i.sender_id === senderId && i.receiver_id === receiverId
    );
    if (existing) {
      showToast('Interest already sent to this candidate.', 'info');
      return existing;
    }

    const newInterest = {
      id: `int-${Date.now()}`,
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Optimistic UI Update
    setInterests(prev => [newInterest, ...prev]);
    setDailyInterestCount(prev => prev + 1);
    showToast('Interest expressed successfully!');

    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        const { data, error } = await supabase
          .from('interests')
          .insert({ sender_id: senderId, receiver_id: receiverId, status: 'pending' })
          .select()
          .single();

        if (error) {
          // Rollback on failure
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

  const handleReviewVerification = async (requestId, userId, isApproved, isFullVerification = false) => {
    const status = isApproved ? 'approved' : 'rejected';
    const now = new Date().toISOString();

    setVerificationRequests(prev =>
      prev.map(req => req.id === requestId ? { ...req, status, reviewed_at: now } : req)
    );

    if (isApproved) {
      setProfiles(prev =>
        prev.map(p =>
          p.id === userId
            ? {
                ...p,
                is_id_verified: true,
                is_fully_verified: isFullVerification,
                verification_date: now
              }
            : p
        )
      );
      showToast(isFullVerification ? 'Approved 100% Full Verification Badge!' : 'Approved ID Verification Badge!');
    } else {
      showToast('Verification request rejected.', 'error');
    }

    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        await supabase
          .from('verification_requests')
          .update({ status, reviewed_at: now })
          .eq('id', requestId);

        if (isApproved) {
          await supabase
            .from('profiles')
            .update({
              is_id_verified: true,
              is_fully_verified: isFullVerification,
              verification_date: now
            })
            .eq('id', userId);
        }
      } catch (err) {
        console.error('Supabase admin review error:', err);
      }
    }
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
        showToast,
        clearToast,
        toggleShortlist,
        isShortlisted,
        sendInterest,
        updateInterestStatus,
        submitVerificationRequest,
        handleReviewVerification,
 addOrUpdateProfile
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
