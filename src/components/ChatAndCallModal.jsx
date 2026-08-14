import React, { useState } from 'react';
import { X, Send, ShieldAlert, Phone, Video } from 'lucide-react';

export const ChatAndCallModal = ({ candidate, isOpen, onClose, onOpenBlockReport }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Namaste! Interested in connecting for marriage proposal.", sender: "them", time: "10:30 AM" }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const candidateName = candidate?.full_name || 'Verified Candidate';
  const candidatePhoto = candidate?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface-card radius-card border border-main max-w-lg w-full h-[550px] flex flex-col relative shadow-md">
        {/* Header */}
        <div className="p-4 border-b border-main flex items-center justify-between bg-surface-ground radius-card">
          <div className="flex items-center gap-3">
            <img src={candidatePhoto} alt={candidateName} className="w-10 h-10 radius-btn object-cover border border-main" />
            <div>
              <h3 className="font-serif font-bold text-main text-sm">{candidateName}</h3>
              <span className="text-[10px] text-sub">Verified Proposal Connect</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenBlockReport && onOpenBlockReport(candidate)}
              className="p-1.5 radius-btn text-sub hover:text-main"
              title="Report or Block"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 radius-btn text-sub hover:text-main">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 radius-card text-xs font-medium ${
                  m.sender === 'me'
                    ? 'bg-sky-blue text-white'
                    : 'bg-surface-card text-main border border-main'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-sub mt-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-main bg-surface-ground flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 border border-main radius-btn text-xs bg-surface-card text-main outline-none focus:ring-1 focus:ring-sky-blue"
          />
          <button
            type="submit"
            className="p-2 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAndCallModal;
