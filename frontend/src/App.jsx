import React, { useState } from 'react';
import Navbar from './components/Navbar';
import PipelineDemo from './components/PipelineDemo';
import NetworkSim from './components/NetworkSim';
import BenchmarkView from './components/BenchmarkView';
import SlideDeck from './components/SlideDeck';
import JudgeQADrawer from './components/JudgeQADrawer';
import { ShieldCheck, HeartPulse, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [isQAOpen, setIsQAOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans subtle-grid selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenQA={() => setIsQAOpen(true)} 
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'pipeline' && <PipelineDemo />}
        {activeTab === 'telemed' && <NetworkSim />}
        {activeTab === 'benchmarks' && <BenchmarkView />}
        {activeTab === 'pitch' && <SlideDeck />}
      </main>

      {/* Judge Q&A Slide-out Drawer */}
      <JudgeQADrawer 
        isOpen={isQAOpen} 
        onClose={() => setIsQAOpen(false)} 
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 text-xs text-slate-500 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <HeartPulse className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">
              RETINA-NET AI &bull; Smart India Hackathon 2026
            </span>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="text-slate-400 hidden sm:inline">
              Rural Tele-Ophthalmology Screening Prototype
            </span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="text-emerald-400/80 flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>MATLAB Core Intact</span>
            </span>
            <span>Vercel Edge Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
