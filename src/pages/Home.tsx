import React from 'react';
import { UploadZone } from '@/components/features/UploadZone';
import { ProcessingIndicator } from '@/components/features/ProcessingIndicator';
import { BeforeAfterViewer } from '@/components/features/BeforeAfterViewer';
import { DetectedObjectsBadges } from '@/components/features/DetectedObjectsBadges';
import { UpscaleControl } from '@/components/features/UpscaleControl';
import { CheckerboardPattern } from '@/components/features/CheckerboardPattern';
import {
  removeBackground,
  detectImageSubject,
  upscaleImage,
  downloadImage,
} from '@/lib/imageProcessing';
import { ImageResult, ProcessingState, UpscaleLevel } from '@/types';
import {
  Download, RotateCcw, Sparkles, Zap, Shield, ImageIcon, ArrowDown,
} from 'lucide-react';

const INITIAL_PROCESSING: ProcessingState = {
  step: 'idle',
  progress: 0,
  message: '',
};

export const Home: React.FC = () => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [processing, setProcessing] = React.useState<ProcessingState>(INITIAL_PROCESSING);
  const [result, setResult] = React.useState<ImageResult | null>(null);
  const [upscaleLevel, setUpscaleLevel] = React.useState<UpscaleLevel>('1x');
  const [isUpscaling, setIsUpscaling] = React.useState(false);
  const [upscaledUrl, setUpscaledUrl] = React.useState<string | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const originalUrl = URL.createObjectURL(file);

    // Get image dimensions
    const dims = await new Promise<{ width: number; height: number }>((res) => {
      const img = new Image();
      img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = originalUrl;
    });

    setResult(null);
    setUpscaledUrl(null);
    setUpscaleLevel('1x');

    // Step 1: Detecting
    setProcessing({ step: 'detecting', progress: 10, message: 'Analyzing image content...' });
    const detected = await detectImageSubject(originalUrl);

    setProcessing({ step: 'detecting', progress: 25, message: `Detected ${detected[0]?.label ?? 'subject'}` });

    // Step 2: Removing BG
    setProcessing({ step: 'removing', progress: 35, message: 'Loading AI model...' });

    // Animate progress while removing (~0.5-1s expected with small model + GPU + 512px
    const progressInterval = animateProgress(35, 88, 800, (p) =>
      setProcessing({ step: 'removing', progress: p, message: 'Removing background...' })
    );

    let processedUrl: string;
    try {
      processedUrl = await removeBackground(originalUrl);
    } catch (err) {
      clearInterval(progressInterval);
      setProcessing({ step: 'error', progress: 0, message: 'Processing failed. Please try another image.' });
      return;
    }
    clearInterval(progressInterval);

    // Step 3: Finalizing
    setProcessing({ step: 'upscaling', progress: 95, message: 'Finalizing image...' });

    setProcessing({ step: 'done', progress: 100, message: 'Done! Your image is ready.' });

    setResult({
      originalUrl,
      processedUrl,
      fileName: file.name,
      detectedObjects: detected,
      originalSize: dims,
      processedSize: dims,
    });

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  const handleUpscaleApply = async () => {
    if (!result?.processedUrl || upscaleLevel === '1x') return;
    setIsUpscaling(true);
    const url = await upscaleImage(result.processedUrl, upscaleLevel);
    setUpscaledUrl(url);
    setIsUpscaling(false);
  };

  const handleDownload = () => {
    const url = upscaledUrl ?? result?.processedUrl;
    if (!url || !result) return;
    downloadImage(url, result.fileName);
  };

  const handleReset = () => {
    setProcessing(INITIAL_PROCESSING);
    setResult(null);
    setUpscaledUrl(null);
    setUpscaleLevel('1x');
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const displayProcessedUrl = upscaledUrl ?? result?.processedUrl ?? null;
  const isProcessing = ['uploading', 'detecting', 'removing', 'upscaling'].includes(processing.step);

  return (
    <main className="flex-1">
      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 px-4 text-center overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-cyan-600/8 rounded-full blur-[80px]" />
          <div className="absolute top-10 right-1/4 w-[250px] h-[250px] bg-purple-600/8 rounded-full blur-[60px]" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
          <Zap size={13} className="text-violet-400" />
          AI-Powered · 100% Free · Privacy First
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-none">
          <span className="text-white">Remove </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400">
            Backgrounds
          </span>
          <br />
          <span className="text-white">Instantly</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-white/50 mb-10 leading-relaxed">
          Upload any photo and our AI automatically detects the subject, removes the background,
          and delivers a pixel-perfect transparent PNG — all processed locally in your browser.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { icon: Sparkles, text: 'AI Object Detection' },
            { icon: Shield, text: 'Privacy First (No Upload)' },
            { icon: ImageIcon, text: 'Transparent PNG Output' },
            { icon: Zap, text: 'Instant Processing' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm">
              <Icon size={13} className="text-violet-400" />
              {text}
            </div>
          ))}
        </div>

        <ArrowDown size={20} className="mx-auto text-white/20 animate-bounce" />
      </section>

      {/* ── Tool Section ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">

        {/* Upload or Processing */}
        {processing.step === 'idle' && !result && (
          <UploadZone
            onFileSelect={processFile}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        )}

        {isProcessing && (
          <div className="glass-card rounded-3xl p-8 sm:p-10">
            <ProcessingIndicator
              step={processing.step}
              progress={processing.progress}
              message={processing.message}
            />
          </div>
        )}

        {processing.step === 'error' && (
          <div className="glass-card rounded-3xl p-8 text-center space-y-4">
            <p className="text-red-400 font-semibold">{processing.message}</p>
            <button onClick={handleReset} className="btn-secondary">Try Again</button>
          </div>
        )}

        {/* Result */}
        {result && processing.step === 'done' && (
          <div ref={resultRef} className="space-y-6">
            {/* Detected objects */}
            <DetectedObjectsBadges objects={result.detectedObjects} />

            {/* Before / After viewer */}
            <div className="glass-card rounded-3xl p-4 sm:p-6">
              <BeforeAfterViewer
                originalUrl={result.originalUrl}
                processedUrl={displayProcessedUrl ?? result.processedUrl!}
              />
            </div>

            {/* Bottom panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Preview card */}
              <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">Result Preview</p>
                <div className="relative rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: 180 }}>
                  <CheckerboardPattern />
                  <img
                    src={displayProcessedUrl ?? result.processedUrl!}
                    alt="Processed"
                    className="relative z-10 max-h-44 object-contain drop-shadow-2xl"
                  />
                  {upscaledUrl && (
                    <div className="absolute top-2 right-2 z-20 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white">
                      {upscaleLevel} Enhanced
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/5 pt-3">
                  <span>{result.fileName}</span>
                  <span>{result.originalSize.width} × {result.originalSize.height}px</span>
                </div>
              </div>

              {/* Controls card */}
              <div className="glass-card rounded-3xl p-6 flex flex-col gap-6">
                {/* Upscale */}
                <UpscaleControl
                  selected={upscaleLevel}
                  onChange={setUpscaleLevel}
                  isProcessing={isUpscaling}
                  onApply={handleUpscaleApply}
                />

                {/* Download button */}
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base
                    bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500
                    text-white transition-all duration-200 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/45
                    hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download size={20} />
                  Download PNG (Transparent)
                </button>

                {/* Reset */}
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                    text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <RotateCcw size={15} />
                  Process Another Image
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-white/40 max-w-xl mx-auto">Three simple steps to a perfect transparent image</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Upload', desc: 'Drop your image or click to browse. Supports JPG, PNG, WEBP and HEIC formats up to 25 MB.', gradient: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20' },
              { step: '02', title: 'AI Processing', desc: 'Our on-device AI detects the main subject and precisely removes the background in seconds.', gradient: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20' },
              { step: '03', title: 'Download', desc: 'Download your transparent PNG instantly. Optionally upscale to 2× or 4× for extra sharpness.', gradient: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/20' },
            ].map(({ step, title, desc, gradient, border }) => (
              <div key={step} className={`glass-card rounded-3xl p-7 border ${border} bg-gradient-to-b ${gradient}`}>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-4">{step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why BG-Eraser?</h2>
            <p className="text-white/40 max-w-xl mx-auto">Built for professionals, designed for everyone</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'All AI processing happens in your browser. Your images never leave your device.', color: 'text-emerald-400' },
              { icon: Zap, title: 'Lightning Fast', desc: 'State-of-the-art WASM AI model processes your image in under 10 seconds.', color: 'text-yellow-400' },
              { icon: Sparkles, title: '4× Upscaling', desc: 'Enhance your output resolution up to 4× with our sharpening algorithm.', color: 'text-violet-400' },
              { icon: ImageIcon, title: 'Transparent PNG', desc: 'Download pixel-perfect transparent PNG files ready for any project.', color: 'text-cyan-400' },
              { icon: Zap, title: 'Object Detection', desc: 'Automatically identifies and labels the main subjects in your photo.', color: 'text-orange-400' },
              { icon: Download, title: 'Free Forever', desc: 'No subscriptions, no watermarks, no account required. Always free.', color: 'text-pink-400' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card rounded-2xl p-6 hover:bg-white/8 transition-colors duration-200">
                <Icon size={22} className={`${color} mb-3`} />
                <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'Does BG-Eraser store my images?', a: 'No. All processing happens locally in your browser using WebAssembly. Your images are never uploaded to any server.' },
              { q: 'What image formats are supported?', a: 'BG-Eraser supports JPG, PNG, WEBP, and HEIC files up to 25 MB in size.' },
              { q: 'How accurate is the background removal?', a: 'Our AI model achieves professional-grade accuracy on portraits, products, animals, and most foreground objects against varied backgrounds.' },
              { q: 'What does the upscale feature do?', a: 'The upscale feature uses a high-quality step-by-step interpolation with a sharpening pass to double or quadruple the pixel resolution of your output image.' },
              { q: 'Is BG-Eraser really free?', a: 'Yes — completely free with no watermarks, no account required, and no daily limits.' },
            ].map(({ q, a }, i) => (
              <FaqItem key={i} question={q} answer={a} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

/* ── FAQ accordion ── */
const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left text-white font-medium hover:text-white/90 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{question}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

/* ── Helpers ── */
function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function animateProgress(from: number, to: number, durationMs: number, cb: (p: number) => void) {
  const start = Date.now();
  const id = setInterval(() => {
    const elapsed = Date.now() - start;
    const pct = Math.min(to, from + ((to - from) * elapsed) / durationMs);
    cb(Math.round(pct));
    if (pct >= to) clearInterval(id);
  }, 80);
  return id;
}
