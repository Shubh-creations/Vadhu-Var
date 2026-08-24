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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-card radius-card border border-main max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-main">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-sky-blue" />
            <h3 className="font-serif font-bold text-main text-base sm:text-lg">{t('cropPhoto')}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-sub hover:text-main radius-btn">
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
            className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-full overflow-hidden border-4 border-sky-blue bg-surface-ground cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center select-none touch-none"
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
            <div className="absolute inset-0 pointer-events-none border-2 border-white/40 rounded-full flex items-center justify-center">
              <Move className="w-6 h-6 text-white/70 drop-shadow-md" />
            </div>
          </div>

          {/* Quick Directional Nudge & Centering Controls */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <button
              type="button"
              onClick={() => nudge(-15, 0)}
              className="px-2.5 py-1 text-xs radius-btn bg-surface-ground hover:bg-surface-card border border-main text-sub hover:text-main font-bold"
              title="Move Left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => nudge(0, -15)}
              className="px-2.5 py-1 text-xs radius-btn bg-surface-ground hover:bg-surface-card border border-main text-sub hover:text-main font-bold"
              title="Move Up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={resetCenter}
              className="px-3 py-1 text-[11px] radius-btn bg-sky-blue/10 hover:bg-sky-blue/20 text-sky-blue border border-sky-blue/30 font-bold"
              title="Reset to Center"
            >
              Center 🎯
            </button>
            <button
              type="button"
              onClick={() => nudge(0, 15)}
              className="px-2.5 py-1 text-xs radius-btn bg-surface-ground hover:bg-surface-card border border-main text-sub hover:text-main font-bold"
              title="Move Down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => nudge(15, 0)}
              className="px-2.5 py-1 text-xs radius-btn bg-surface-ground hover:bg-surface-card border border-main text-sub hover:text-main font-bold"
              title="Move Right"
            >
              →
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-sub font-medium">
          {t('dragPhotoHint')}
        </p>

        {/* Editing Controls */}
        <div className="space-y-4 pt-2">
          {/* Zoom Controls with Slider and Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustZoom(-0.2)}
              className="p-1.5 radius-btn bg-surface-ground hover:bg-surface-card border border-main text-sub hover:text-main"
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
              className="w-full h-2 bg-surface-ground radius-btn appearance-none cursor-pointer accent-sky-blue"
            />

            <button
              type="button"
              onClick={() => adjustZoom(0.2)}
              className="p-1.5 radius-btn bg-surface-ground hover:bg-surface-card border border-main text-sub hover:text-main"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-mono font-bold text-main w-9 text-right">{zoom.toFixed(1)}x</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-main">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-2 radius-btn bg-surface-ground border border-main text-sub hover:text-main text-xs font-medium transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              <span>{t('rotate90')}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 radius-btn border border-main text-sub font-medium text-xs hover:bg-surface-ground"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="px-5 py-2 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
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
