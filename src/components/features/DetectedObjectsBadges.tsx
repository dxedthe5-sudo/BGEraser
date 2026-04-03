import React from 'react';
import { DetectedObject } from '@/types';
import { Tag, TrendingUp } from 'lucide-react';

interface DetectedObjectsBadgesProps {
  objects: DetectedObject[];
}

export const DetectedObjectsBadges: React.FC<DetectedObjectsBadgesProps> = ({ objects }) => {
  if (objects.length === 0) return null;

  return (
    <div className="flex items-start gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-white/50 text-sm pt-1">
        <Tag size={14} />
        <span>Detected:</span>
      </div>
      {objects.map((obj, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30"
        >
          <span className="text-sm font-medium text-white">{obj.label}</span>
          <div className="flex items-center gap-1 text-xs text-cyan-400">
            <TrendingUp size={11} />
            <span>{Math.round(obj.confidence * 100)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};
