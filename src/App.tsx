import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home';

const NotFound: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
    <p className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-4">404</p>
    <p className="text-xl text-white/60 mb-6">Page not found</p>
    <a href="/" className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors">
      Go Home
    </a>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default App;
