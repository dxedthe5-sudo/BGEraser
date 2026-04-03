import React from 'react';
import { Scissors, Github, Twitter } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="relative z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Scissors size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">BG</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">-Eraser</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {['Features', 'How it works', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm text-white/50 hover:text-white/90 transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% Free
          </span>
        </div>
      </div>
    </header>
  );
};
