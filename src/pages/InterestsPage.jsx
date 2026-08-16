import React, { useState } from 'react';
import { Heart, Check, X, ShieldCheck, ArrowRight, UserCheck, MessageSquare } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import BadgeVerified from '../components/BadgeVerified';

export const InterestsPage = ({ onViewProfile, onOpenChat, onNavigateToDiscover }) => {
  const { user, profile } = useAuth();
  const { interests, profiles, respondInterest } = useData();
  const [activeTab, setActiveTab] = useState('received');

  const currentUserId = profile?.id || user?.id || 'demo-user-me';

  const receivedInterests = interests.filter(i => i.receiver_id === currentUserId);
  const sentInterests = interests.filter(i => i.sender_id === currentUserId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 radius-btn bg-sky-blue text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
          <Heart className="w-6 h-6 fill-white/20" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-main">Interest Requests</h1>
        <p className="text-xs sm:text-sm text-sub mt-1 max-w-md mx-auto">
          Manage proposal interest requests sent and received.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-main mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-sky-blue text-main'
              : 'border-transparent text-sub hover:text-main'
          }`}
        >
          Received ({receivedInterests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-sky-blue text-main'
              : 'border-transparent text-sub hover:text-main'
          }`}
        >
          Sent ({sentInterests.length})
        </button>
      </div>

      {/* Received Tab */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedInterests.length > 0 ? (
            receivedInterests.map((item) => {
              const sender = profiles.find(p => p.id === item.sender_id);
              if (!sender) return null;

              return (
                <div key={item.id} className="bg-surface-card radius-card border border-main p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={sender.photo_url} alt={sender.full_name} className="w-14 h-14 radius-btn object-cover border border-main" />
                    <div>
                      <h3 className="font-serif font-bold text-main text-base">{sender.full_name}, {sender.age}</h3>
                      <p className="text-xs text-sub">{sender.occupation} • {sender.city}</p>
                      <div className="mt-1">
                        <BadgeVerified size="small" isIdVerified={sender.is_id_verified} isFullyVerified={sender.is_fully_verified} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => respondInterest(item.id, 'accepted')}
                          className="px-4 py-2 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => respondInterest(item.id, 'declined')}
                          className="px-3 py-2 radius-btn border border-main text-sub text-xs hover:bg-surface-ground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : item.status === 'accepted' ? (
                      <button
                        onClick={() => onOpenChat && onOpenChat(sender)}
                        className="px-4 py-2 radius-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat & Connect</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1 radius-btn bg-surface-ground text-sub text-xs font-medium capitalize border border-main">
                        {item.status}
                      </span>
                    )}

                    <button
                      onClick={() => onViewProfile(sender)}
                      className="px-3 py-2 radius-btn border border-main text-sub text-xs hover:text-main"
                      title="View Full Profile"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-surface-card radius-card border border-main p-10 sm:p-14 text-center text-sub space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-sky-blue/10 text-sky-blue flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-main text-base sm:text-lg">No Received Interests Yet</h3>
                <p className="text-xs text-sub max-w-sm mx-auto">
                  When other verified members view your profile and send proposal requests, they will appear here for you to review and accept.
                </p>
              </div>
              {onNavigateToDiscover && (
                <button
                  type="button"
                  onClick={onNavigateToDiscover}
                  className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore Discover Matches</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sent Tab */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentInterests.length > 0 ? (
            sentInterests.map((item) => {
              const receiver = profiles.find(p => p.id === item.receiver_id);
              if (!receiver) return null;

              return (
                <div key={item.id} className="bg-surface-card radius-card border border-main p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={receiver.photo_url} alt={receiver.full_name} className="w-14 h-14 radius-btn object-cover border border-main" />
                    <div>
                      <h3 className="font-serif font-bold text-main text-base">{receiver.full_name}, {receiver.age}</h3>
                      <p className="text-xs text-sub">{receiver.occupation || 'Candidate'} • {receiver.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'accepted' ? (
                      <button
                        onClick={() => onOpenChat && onOpenChat(receiver)}
                        className="px-4 py-2 radius-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat & Connect</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1 radius-btn bg-surface-ground text-sub text-xs font-medium capitalize border border-main">
                        Status: {item.status}
                      </span>
                    )}
                    <button
                      onClick={() => onViewProfile(receiver)}
                      className="px-3 py-2 radius-btn border border-main text-sub text-xs hover:text-main"
                      title="View Full Profile"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-surface-card radius-card border border-main p-10 sm:p-14 text-center text-sub space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-sky-blue/10 text-sky-blue flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-main text-base sm:text-lg">No Sent Interests Yet</h3>
                <p className="text-xs text-sub max-w-sm mx-auto">
                  Browse verified candidate profiles across India and tap "Express Interest" to send matrimonial connection requests.
                </p>
              </div>
              {onNavigateToDiscover && (
                <button
                  type="button"
                  onClick={onNavigateToDiscover}
                  className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Find Matches on Discover</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterestsPage;
