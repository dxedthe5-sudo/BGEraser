import React from 'react';
import { Scissors } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Scissors size={14} className="text-white" />
            </div>
            <span className="font-bold text-lg">
              <span className="text-white">BG</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">-Eraser</span>
            </span>
          </div>

          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} BG-Eraser. All image processing happens locally in your browser.
          </p>

          <div className="flex items-center gap-4">
            {['Privacy', 'Terms'].map((link) => (
              <a key={link} href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
