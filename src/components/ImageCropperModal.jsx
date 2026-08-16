import React, { useState, useRef, useEffect } from 'react';
import { Crop, ZoomIn, RotateCw, Check, X, Move } from 'lucide-react';

export const ImageCropperModal = ({ isOpen, imageSrc, onCropComplete, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

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

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
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
      -drawWidth / 2 + pan.x / zoom,
      -drawHeight / 2 + pan.y / zoom,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-surface-card radius-card border border-main max-w-md w-full p-6 space-y-5 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-main">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-sky-blue" />
            <h3 className="font-serif font-bold text-main text-lg">Crop & Edit Profile Photo</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-sub hover:text-main radius-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Viewport */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-full overflow-hidden border-4 border-sky-blue bg-surface-ground cursor-move shadow-inner flex items-center justify-center select-none"
        >
          <img
            src={imageSrc}
            alt="Crop Preview"
            draggable={false}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease',
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'cover'
            }}
          />
          <div className="absolute inset-0 pointer-events-none border-2 border-white/40 rounded-full flex items-center justify-center">
            <Move className="w-6 h-6 text-white/60" />
          </div>
        </div>

        <p className="text-center text-xs text-sub">
          Drag photo to re-position inside circle
        </p>

        {/* Editing Controls */}
        <div className="space-y-4 pt-2">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-sub flex-shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-surface-ground radius-btn appearance-none cursor-pointer accent-sky-blue"
            />
            <span className="text-xs font-mono font-medium text-sub w-8">{zoom.toFixed(1)}x</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-main">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-2 radius-btn bg-surface-ground border border-main text-sub hover:text-main text-xs font-medium transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              <span>Rotate 90°</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 radius-btn border border-main text-sub font-medium text-xs hover:bg-surface-ground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="px-5 py-2 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save Crop</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
