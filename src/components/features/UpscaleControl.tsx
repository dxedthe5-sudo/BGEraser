import React from 'react';
import { UpscaleLevel } from '@/types';
import { Zap, ZoomIn, Star } from 'lucide-react';

interface UpscaleControlProps {
  selected: UpscaleLevel;
  onChange: (level: UpscaleLevel) => void;
  isProcessing: boolean;
  onApply: () => void;
}

const OPTIONS: { level: UpscaleLevel; label: string; sub: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { level: '1x', label: 'Original', sub: 'No scaling', icon: Zap },
  { level: '2x', label: '2× Upscale', sub: 'Double resolution', icon: ZoomIn },
  { level: '4x', label: '4× Upscale', sub: 'Ultra HD quality', icon: Star },
];

export const UpscaleControl: React.FC<UpscaleControlProps> = ({ selected, onChange, isProcessing, onApply }) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">Upscale Quality</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ level, label, sub, icon: Icon }) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`
              group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200
              ${selected === level
                ? 'border-violet-500 bg-gradient-to-b from-violet-500/20 to-violet-600/10'
                : 'border-white/10 bg-white/5 hover:border-violet-500/40 hover:bg-white/8'
              }
            `}
          >
            <Icon size={18} className={selected === level ? 'text-violet-300' : 'text-white/40 group-hover:text-white/60'} />
            <span className={`text-sm font-semibold ${selected === level ? 'text-violet-200' : 'text-white/70'}`}>{label}</span>
            <span className={`text-xs ${selected === level ? 'text-violet-400/70' : 'text-white/30'}`}>{sub}</span>
            {selected === level && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-400" />
            )}
          </button>
        ))}
      </div>

      {selected !== '1x' && (
        <button
          onClick={onApply}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500
            text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
        >
          <Star size={16} />
          {isProcessing ? 'Enhancing...' : `Apply ${selected} Enhancement`}
        </button>
      )}
    </div>
  );
};
