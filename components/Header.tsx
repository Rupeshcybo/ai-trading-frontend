import React from 'react';
import { Activity } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-4 md:px-8 border-b border-slate-800 bg-market-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              NiftyOption<span className="text-blue-500">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              Indian Market Specialist
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-2 text-xs font-semibold">
           <span className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-800/50 rounded">NIFTY 50</span>
           <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 rounded">BANKNIFTY</span>
        </div>
      </div>
    </header>
  );
};
