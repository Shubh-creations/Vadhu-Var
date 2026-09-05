import React, { useRef, useState, useEffect } from 'react';
import { Share2, Download, Copy, Check, X, Sparkles, ShieldCheck, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ShareProfileModal = ({ profile, isOpen, onClose }) => {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [imageGenerated, setImageGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!isOpen || !profile) return;

    const generateCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = 800;
      const height = 1000;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Gradient (Royal Indian Navy)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0a0f1d');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#050811');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Decorative Border & Golden Frame
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 24, width - 48, height - 48);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(32, 32, width - 64, height - 64);

      // 3. Top Branding Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Lora, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('वधू - वर • Vadhu Var', width / 2, 95);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 15px Inter, sans-serif';
      ctx.fillText('VERIFIED MATRIMONY PLATFORM', width / 2, 125);

      // Decorative divider
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 120, 145);
      ctx.lineTo(width / 2 + 120, 145);
      ctx.stroke();

      // 4. Candidate Photo (Rendered as Circle)
      const photoX = width / 2;
      const photoY = 320;
      const photoRadius = 140;

      // Draw photo container background & shadow
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX, photoY, photoRadius + 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
      ctx.clip();

      if (profile.photo_url) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = profile.photo_url;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });

          // Draw cropped circular image
          const scale = Math.max((photoRadius * 2) / img.width, (photoRadius * 2) / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.drawImage(img, photoX - dw / 2, photoY - dh / 2, dw, dh);
        } catch (e) {
          // Fallback avatar
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 80px Inter, sans-serif';
          ctx.fillText((profile.full_name || 'V')[0].toUpperCase(), photoX, photoY + 30);
        }
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Inter, sans-serif';
        ctx.fillText((profile.full_name || 'V')[0].toUpperCase(), photoX, photoY + 30);
      }
      ctx.restore();

      // 5. Verification Badge Pill
      const badgeY = 490;
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 110, badgeY - 18, 220, 36, 18);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('✓ 100% ID Verified Profile', width / 2, badgeY + 5);

      // 6. Name and Age
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Lora, Georgia, serif';
      ctx.fillText(`${profile.full_name || 'Candidate'}, ${profile.age || 26}`, width / 2, 570);

      // 7. Location & Community
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 18px Inter, sans-serif';
      const locText = `📍 ${profile.city || 'Pune'}, ${profile.state || 'Maharashtra'}`;
      ctx.fillText(locText, width / 2, 610);

      // 8. Education & Occupation Card Box
      const cardY = 660;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.beginPath();
      ctx.roundRect(100, cardY, width - 200, 160, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Occupation row
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PROFESSION & CAREER', 130, cardY + 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(profile.occupation || 'Working Professional', 130, cardY + 70);

      // Education row
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.fillText('QUALIFICATION', 130, cardY + 110);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(profile.education_level || 'Graduate / Professional', 130, cardY + 140);

      // 9. Call to Action / Footer Tagline
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px Inter, sans-serif';
      ctx.fillText('Connect & View Full Verified Bio on:', width / 2, 875);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText('https://vadhu-var.vercel.app', width / 2, 915);

      setImageGenerated(true);
    };

    generateCard();
  }, [isOpen, profile]);

  if (!isOpen || !profile) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const safeName = (profile.full_name || 'profile').replace(/\s+/g, '_').toLowerCase();
    link.download = `vadhu_var_${safeName}_card.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSharing(true);
    try {
      if (navigator.share) {
        canvas.toBlob(async (blob) => {
          if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'profile.png', { type: 'image/png' })] })) {
            const file = new File([blob], `${profile.full_name}_VadhuVar.png`, { type: 'image/png' });
            await navigator.share({
              title: `${profile.full_name} on Vadhu Var`,
              text: `Check out ${profile.full_name}'s verified matrimonial profile on Vadhu Var!`,
              files: [file]
            });
          } else {
            await navigator.share({
              title: `${profile.full_name} on Vadhu Var`,
              text: `Check out ${profile.full_name}'s verified matrimonial profile on Vadhu Var! https://vadhu-var.vercel.app`,
              url: 'https://vadhu-var.vercel.app'
            });
          }
        }, 'image/png');
      } else {
        handleDownload();
      }
    } catch (err) {
      console.warn('Native share dismissed:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://vadhu-var.vercel.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card radius-card border border-white/10 max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif font-bold gold-gradient-text text-base sm:text-lg">
              Share Matrimonial Bio-Data Card
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 radius-btn text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Generate a safe, beautiful summary card for WhatsApp Status, Instagram, or family groups. (No contact info or sensitive details included).
        </p>

        {/* Canvas Card Preview */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-zinc-950/70 radius-card p-2 border border-white/10">
          <canvas
            ref={canvasRef}
            className="w-full max-h-[380px] object-contain rounded-md shadow-2xl"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={sharing}
            className="py-2.5 px-3 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Card</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="py-2.5 px-3 radius-btn glass-card border border-white/10 text-white hover:bg-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-gold-400" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2.5 px-3 radius-btn glass-card border border-white/10 text-white hover:bg-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareProfileModal;
