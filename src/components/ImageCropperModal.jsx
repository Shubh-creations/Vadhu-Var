import React, { useState, useRef, useEffect } from 'react';
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X, Move, Plus, Minus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ImageCropperModal = ({ isOpen, imageSrc, onCropComplete, onClose }) => {
  const { t } = useLanguage();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imgRef.current = img;
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
      };
    }
  }, [imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Drag Handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Directional Nudge / Centering Helpers
  const nudge = (dx, dy) => {
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const resetCenter = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  // Mouse Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.005;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 3.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const adjustZoom = (amount) => {
    setZoom((prev) => Math.min(Math.max(1, prev + amount), 3.5));
  };

  const handleCropSave = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const cropSize = 400; // Output square profile size
    canvas.width = cropSize;
    canvas.height = cropSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Measure viewport scale ratio so saved crop exactly matches on-screen preview
    const viewportWidth = viewportRef.current?.clientWidth || 280;
    const viewportRatio = cropSize / viewportWidth;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cropSize, cropSize);

    ctx.save();
    ctx.translate(cropSize / 2, cropSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate source dimensions
    const scale = Math.max(cropSize / img.width, cropSize / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    ctx.drawImage(
      img,
      -drawWidth / 2 + (pan.x * viewportRatio) / zoom,
      -drawHeight / 2 + (pan.y * viewportRatio) / zoom,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card radius-card border border-white/10 max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif font-bold gold-gradient-text text-base sm:text-lg">{t('cropPhoto')}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-zinc-400 hover:text-white radius-btn hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Viewport with Full Mouse & Touch Drag */}
        <div className="relative flex flex-col items-center justify-center">
          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-full overflow-hidden border-4 border-gold-500 bg-zinc-950 cursor-grab active:cursor-grabbing shadow-2xl flex items-center justify-center select-none touch-none"
          >
            <img
              src={imageSrc}
              alt="Crop Preview"
              draggable={false}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none'
              }}
            />
            <div className="absolute inset-0 pointer-events-none border-2 border-white/30 rounded-full flex items-center justify-center">
              <Move className="w-6 h-6 text-white/70 drop-shadow-md" />
            </div>
          </div>

          {/* Quick Directional Nudge & Centering Controls */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <button
              type="button"
              onClick={() => nudge(-15, 0)}
              className="px-2.5 py-1 text-xs radius-btn glass-card border border-white/10 text-zinc-300 hover:text-white font-bold hover:bg-white/10 transition-colors cursor-pointer"
              title="Move Left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => nudge(0, -15)}
              className="px-2.5 py-1 text-xs radius-btn glass-card border border-white/10 text-zinc-300 hover:text-white font-bold hover:bg-white/10 transition-colors cursor-pointer"
              title="Move Up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={resetCenter}
              className="px-3 py-1 text-[11px] radius-btn bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 font-bold transition-colors cursor-pointer"
              title="Reset to Center"
            >
              Center 🎯
            </button>
            <button
              type="button"
              onClick={() => nudge(0, 15)}
              className="px-2.5 py-1 text-xs radius-btn glass-card border border-white/10 text-zinc-300 hover:text-white font-bold hover:bg-white/10 transition-colors cursor-pointer"
              title="Move Down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => nudge(15, 0)}
              className="px-2.5 py-1 text-xs radius-btn glass-card border border-white/10 text-zinc-300 hover:text-white font-bold hover:bg-white/10 transition-colors cursor-pointer"
              title="Move Right"
            >
              →
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 font-medium">
          {t('dragPhotoHint')}
        </p>

        {/* Editing Controls */}
        <div className="space-y-4 pt-2">
          {/* Zoom Controls with Slider and Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustZoom(-0.2)}
              className="p-1.5 radius-btn glass-card border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="range"
              min="1"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-900 radius-btn appearance-none cursor-pointer accent-amber-500"
            />

            <button
              type="button"
              onClick={() => adjustZoom(0.2)}
              className="p-1.5 radius-btn glass-card border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-mono font-bold text-gold-400 w-9 text-right">{zoom.toFixed(1)}x</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-2 radius-btn glass-card border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-gold-400" />
              <span>{t('rotate90')}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 radius-btn glass-card border border-white/10 text-zinc-300 hover:text-white font-medium text-xs hover:bg-white/10 cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="px-5 py-2 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t('saveCrop')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
