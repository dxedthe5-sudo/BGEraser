import React from 'react';
import { CheckerboardPattern } from './CheckerboardPattern';

interface BeforeAfterViewerProps {
  originalUrl: string;
  processedUrl: string;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({
  originalUrl,
  processedUrl,
}) => {
  const [sliderX, setSliderX] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMove = React.useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderX(pct);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) handleMove(e.clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { handleMove(e.touches[0].clientX); };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden cursor-col-resize select-none"
      style={{ aspectRatio: '16/9', maxHeight: '420px' }}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* Processed (right side) - checkerboard + image */}
      <div className="absolute inset-0">
        <CheckerboardPattern />
        <img
          src={processedUrl}
          alt="Background removed"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Original (left side) - clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}
      >
        <img
          src={originalUrl}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain bg-gray-900"
          draggable={false}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-glow z-20"
        style={{ left: `${sliderX}%`, transform: 'translateX(-50%)' }}
      >
        {/* Drag handle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing z-30"
          onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
          onTouchStart={() => setIsDragging(true)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 5L3 10L7 15M13 5L17 10L13 15" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-black/60 text-white backdrop-blur-sm">Original</span>
      </div>
      <div className="absolute top-3 right-3 z-10">
        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-violet-600/80 text-white backdrop-blur-sm">BG Removed</span>
      </div>
    </div>
  );
};
