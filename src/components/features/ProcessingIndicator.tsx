import React from 'react';
import { ProcessingStep } from '@/types';
import { Scan, Scissors, Sparkles, CheckCircle } from 'lucide-react';

interface ProcessingIndicatorProps {
  step: ProcessingStep;
  progress: number;
  message: string;
}

const STEPS: { key: ProcessingStep; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { key: 'detecting', label: 'Detecting Objects', icon: Scan },
  { key: 'removing', label: 'Removing Background', icon: Scissors },
  { key: 'upscaling', label: 'Enhancing Quality', icon: Sparkles },
  { key: 'done', label: 'Complete!', icon: CheckCircle },
];

const stepOrder: ProcessingStep[] = ['detecting', 'removing', 'upscaling', 'done'];

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ step, progress, message }) => {
  const currentIndex = stepOrder.indexOf(step);

  return (
    <div className="w-full space-y-6">
      {/* Steps row */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, idx) => {
          const isComplete = currentIndex > idx;
          const isActive = currentIndex === idx;
          const isPending = currentIndex < idx;
          const Icon = s.icon;

          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-2">
                <div className={`
                  w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500
                  ${isComplete ? 'bg-gradient-to-br from-violet-500 to-cyan-500' : ''}
                  ${isActive ? 'bg-gradient-to-br from-violet-600 to-violet-400 ring-4 ring-violet-500/30 animate-pulse' : ''}
                  ${isPending ? 'bg-white/10' : ''}
                `}>
                  <Icon size={20} className={`
                    ${isComplete || isActive ? 'text-white' : 'text-white/30'}
                  `} />
                </div>
                <span className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${isActive ? 'text-violet-300' : isComplete ? 'text-cyan-400' : 'text-white/30'}`}>
                  {s.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
                    style={{ width: isComplete ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">{message}</span>
          <span className="text-violet-300 font-semibold">{progress}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
