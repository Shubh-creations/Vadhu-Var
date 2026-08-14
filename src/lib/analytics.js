import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Lightweight Event Analytics Logger
 * Logs key product conversion events to Supabase 'events' table or local storage
 */
export const logEvent = async (eventType, metadata = {}) => {
  const eventObj = {
    id: `evt-${Date.now()}`,
    user_id: metadata.userId || 'anonymous',
    event_type: eventType,
    metadata,
    created_at: new Date().toISOString()
  };

  // Local Storage Event Log
  try {
    const saved = localStorage.getItem('mh_matrimony_analytics');
    const logs = saved ? JSON.parse(saved) : [];
    logs.push(eventObj);
    localStorage.setItem('mh_matrimony_analytics', JSON.stringify(logs.slice(-100))); // Keep last 100
  } catch (err) {
    console.warn('Analytics local save error:', err);
  }

  // Supabase Table Log if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('events').insert({
        user_id: metadata.userId || null,
        event_type: eventType,
        metadata
      });
    } catch (err) {
      console.warn('Analytics Supabase log error:', err);
    }
  }
};

export default logEvent;
