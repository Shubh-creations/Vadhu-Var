import React, { useState } from 'react';
import { Heart, Star, Sparkles, MapPin, Briefcase, GraduationCap, Play, Pause, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck, User } from 'lucide-react';
import BadgeVerified from './BadgeVerified';
import CandidateAvatar from './CandidateAvatar';
import { useData } from '../context/DataContext';

export const HingeCardDeck = ({ profiles, onViewDetails, onOpenCompatibility, onAuthRequired }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [commentPromptModal, setCommentPromptModal] = useState(null);
  const [promptCommentText, setPromptCommentText] = useState('');

  const { sendInterest, toggleShortlist, isShortlisted } = useData();

  if (!profiles || profiles.length === 0) {
    return (
      <div className="bg-surface-card border border-main radius-card p-12 text-center">
        <ShieldCheck className="w-12 h-12 text-sub mx-auto mb-3" />
        <h3 className="font-serif font-bold text-main text-lg">No candidates left in deck</h3>
        <p className="text-xs text-sub mt-1">
          Adjust your filters or switch to Grid View.
        </p>
      </div>
    );
  }

  const candidate = profiles[currentIndex % profiles.length];

  const handleNext = () => {
    setIsPlayingVoice(false);
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
  };

  const handlePrev = () => {
    setIsPlayingVoice(false);
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
  };

  const isShort = isShortlisted(candidate.id);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Top Deck Header */}
      <div className="flex items-center justify-between text-xs font-medium text-sub px-2">
        <span className="flex items-center gap-1.5 text-main font-serif">
          <Sparkles className="w-4 h-4 text-sky-blue" />
          <span>Prompt Deck</span>
        </span>
        <span>
          Candidate {currentIndex + 1} of {profiles.length}
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-surface-card border border-main radius-card shadow-md overflow-hidden relative">
        <div className="relative h-80 sm:h-96 w-full flex items-center justify-center bg-surface-ground">
          {candidate.photo_url ? (
            <img
              src={candidate.photo_url}
              alt={candidate.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <CandidateAvatar
              name={candidate.full_name}
              size="hero"
              shape="rounded"
              showNoPhotoText={true}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <BadgeVerified profile={candidate} size="small" />
            </div>

            <button
              onClick={() => toggleShortlist(candidate.id)}
              className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-transform active:scale-95"
              title="Shortlist Candidate"
            >
              <Star className={`w-4 h-4 ${isShort ? 'fill-sky-blue text-sky-blue' : 'text-white'}`} />
            </button>
          </div>

          {/* Bottom Hero Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                  {candidate.full_name}, <span className="font-sans font-normal">{candidate.age}</span>
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-200 mt-1">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-sub" />
                    <span>{candidate.occupation}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sub" />
                    <span>{candidate.city}</span>
                  </div>
                </div>
              </div>

              {/* Compatibility Score */}
              <button
                onClick={() => onOpenCompatibility(candidate)}
                className="flex items-center gap-1.5 px-3 py-1.5 radius-btn bg-sky-blue text-white text-xs font-medium shadow-xs"
              >
                <span>{candidate.compatibility?.overall || 90}% Match</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs text-sub">
            <div className="bg-surface-ground p-2.5 radius-btn border border-main">
              <span className="text-[10px] text-sub block">Education</span>
              <span className="font-medium text-main truncate block">{candidate.education_level}</span>
            </div>
            <div className="bg-surface-ground p-2.5 radius-btn border border-main">
              <span className="text-[10px] text-sub block">Height</span>
              <span className="font-medium text-main truncate block">{candidate.height_cm} cm</span>
            </div>
          </div>

          {/* Prompts */}
          {candidate.cultural_prompts?.map((prompt, idx) => (
            <div key={idx} className="bg-surface-ground p-4 radius-btn border border-main">
              <span className="text-xs font-semibold text-main block mb-1">
                {prompt.question}
              </span>
              <p className="text-xs text-sub leading-relaxed font-normal">
                "{prompt.answer}"
              </p>
            </div>
          ))}
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 bg-surface-ground border-t border-main flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            className="p-3 radius-btn bg-surface-card border border-main text-sub hover:text-main"
            title="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={async () => {
              try {
                await sendInterest(candidate.id);
                handleNext();
              } catch (e) {
                if (onAuthRequired) onAuthRequired();
              }
            }}
            className="flex-1 py-2.5 px-6 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-white/20" />
            <span>Express Interest</span>
          </button>

          <button
            onClick={handleNext}
            className="p-3 radius-btn bg-surface-card border border-main text-sub hover:text-main"
            title="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HingeCardDeck;
