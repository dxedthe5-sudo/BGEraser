import React from 'react';
import { Upload, ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  return (
    <div
      className={`
        relative group flex flex-col items-center justify-center
        w-full min-h-[320px] rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer
        ${isDragging
          ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
          : 'border-white/20 bg-white/5 hover:border-violet-400/60 hover:bg-white/8'
        }
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Animated glow ring */}
      <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10" />
      </div>

      {/* Icon container */}
      <div className={`
        relative mb-6 w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300
        ${isDragging ? 'bg-violet-500/30 scale-110' : 'bg-white/10 group-hover:bg-violet-500/20 group-hover:scale-105'}
      `}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20" />
        <Upload
          size={40}
          className={`relative z-10 transition-colors duration-300 ${isDragging ? 'text-violet-300' : 'text-white/60 group-hover:text-violet-300'}`}
        />
      </div>

      {/* Text */}
      <div className="relative text-center px-4">
        <p className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDragging ? 'text-violet-300' : 'text-white/80 group-hover:text-white'}`}>
          {isDragging ? 'Release to upload' : 'Drop your image here'}
        </p>
        <p className="text-sm text-white/40 mb-4">or click to browse your gallery</p>

        {/* Format badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['JPG', 'PNG', 'WEBP', 'HEIC'].map((fmt) => (
            <span key={fmt} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/50 border border-white/10">
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-violet-500/40 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-violet-500/40 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-violet-500/40 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-violet-500/40 rounded-br-lg" />

      {/* Sample images hint */}
      <div className="absolute bottom-5 right-16 hidden lg:flex items-center gap-1.5 text-xs text-white/30">
        <ImageIcon size={12} />
        <span>Max 25 MB</span>
      </div>
    </div>
  );
};
