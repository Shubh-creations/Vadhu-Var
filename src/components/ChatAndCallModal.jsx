import React, { useState } from 'react';
import { X, Send, ShieldAlert, Phone, Video } from 'lucide-react';
import CandidateAvatar from './CandidateAvatar';

export const ChatAndCallModal = ({ candidate, isOpen, onClose, onOpenBlockReport }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Namaste! Interested in connecting for marriage proposal.", sender: "them", time: "10:30 AM" }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const candidateName = candidate?.full_name || 'Verified Candidate';

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: inputText.trim(), sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card radius-card border border-white/10 max-w-lg w-full h-[550px] flex flex-col relative shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <CandidateAvatar
              src={candidate?.photo_url}
              name={candidateName}
              size="sm"
              shape="rounded"
            />
            <div>
              <h3 className="font-serif font-bold text-white text-sm">{candidateName}</h3>
              <span className="text-[10px] text-gold-400 font-mono">Verified Proposal Connect</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenBlockReport && onOpenBlockReport(candidate)}
              className="p-1.5 radius-btn text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Report or Block"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 radius-btn text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950/80">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 radius-card text-xs font-medium ${
                  m.sender === 'me'
                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950 font-bold shadow-md'
                    : 'bg-zinc-900 text-white border border-white/10'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 font-mono">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-zinc-900/90 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 border border-white/10 radius-btn text-xs bg-zinc-950 text-white placeholder:text-zinc-500 outline-none focus:ring-1 focus:ring-gold-400/40 focus:border-gold-400 transition-colors"
          />
          <button
            type="submit"
            className="p-2.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAndCallModal;
