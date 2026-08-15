import React from 'react';
import { Search, Heart, Star, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

export const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const { user, profile } = useAuth();
  const { interests, shortlistedIds } = useData();
  const { t } = useLanguage();

  const userId = profile?.id || user?.id;
  const receivedInterestsCount = interests.filter(
    i => i.receiver_id === userId && i.status === 'pending'
  ).length;

  const tabs = [
    { id: 'browse', label: t('discover'), icon: Search },
    { 
      id: 'interests', 
      label: t('interests'), 
      icon: Heart, 
      badge: receivedInterestsCount > 0 ? receivedInterestsCount : null 
    },
    { 
      id: 'shortlists', 
      label: t('shortlisted'), 
      icon: Star, 
      badge: shortlistedIds.length > 0 ? shortlistedIds.length : null 
    },
    { 
      id: 'profile', 
      label: profile ? t('myProfile') : t('createProfile'), 
      icon: User 
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-main shadow-lg pb-safe">
      <div className="grid grid-cols-4 items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
                isActive ? 'text-sky-blue font-bold' : 'text-sub hover:text-main'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 flex items-center justify-center text-[9px] font-extrabold text-white bg-sky-blue rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight line-clamp-1 max-w-[70px]">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sky-blue rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
