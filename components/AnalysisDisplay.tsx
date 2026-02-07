import React from 'react';
import { AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, ExternalLink, ArrowRight, BarChart2, ShieldAlert, Gauge, Layers, Eye } from './Icons';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const isLong = result.signal === 'LONG';
  const isShort = result.signal === 'SHORT';
  const isNoTrade = result.signal === 'NO TRADE';

  const getSignalColor = () => {
    if (isLong) return 'bg-emerald-500 text-white';
    if (isShort) return 'bg-rose-500 text-white';
    return 'bg-slate-600 text-slate-300';
  };

  const getBorderColor = () => {
    if (isLong) return 'border-emerald-500/50 shadow-emerald-500/10';
    if (isShort) return 'border-rose-500/50 shadow-rose-500/10';
    return 'border-slate-600/50';
  };

  const getRegimeBadge = () => {
    const map = {
      'TRENDING': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'RANGING': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'VOLATILE': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return map[result.marketRegime] || 'bg-slate-700 text-slate-400';
  };

  const getTrapColor = () => {
    if (result.trapCheck === 'SAFE') return 'text-emerald-400';
    if (result.trapCheck === 'TRAP DETECTED') return 'text-rose-500 font-bold animate-pulse';
    return 'text-yellow-400';
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      
      {/* 1. ONE-CLICK DECISION CARD */}
      <div className={`relative bg-market-card rounded-2xl border-2 ${getBorderColor()} shadow-2xl overflow-hidden`}>
        
        {/* Header Strip */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/30">
           <div className="flex items-center gap-3">
             <div className={`px-4 py-1.5 rounded-lg font-black text-lg tracking-wider ${getSignalColor()}`}>
               {result.signal}
             </div>
             <span className="text-slate-400 font-medium">
               {isLong ? 'BUY CALL (CE)' : isShort ? 'BUY PUT (PE)' : 'WAIT & WATCH'}
             </span>
           </div>
           
           <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRegimeBadge()}`}>
                {result.marketRegime}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-xs font-mono text-slate-300">
                <span>CONFIDENCE:</span>
                <span className={result.confidence > 70 ? 'text-emerald-400' : 'text-yellow-400'}>
                  {result.confidence}%
                </span>
              </div>
           </div>
        </div>

        {/* INSTITUTIONAL DATA STRIP */}
        <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-700/50 grid grid-cols-3 gap-4 text-xs">
           <div className="flex flex-col">
             <span className="text-slate-500 font-bold flex items-center gap-1"><Activity className="w-3 h-3"/> INDIA VIX</span>
             <span className="text-slate-200 font-mono">{result.indiaVix || 'N/A'}</span>
           </div>
           <div className="flex flex-col border-l border-slate-700/50 pl-4">
             <span className="text-slate-500 font-bold flex items-center gap-1"><Gauge className="w-3 h-3"/> PCR SENTIMENT</span>
             <span className="text-slate-200 font-mono">{result.pcr || 'N/A'}</span>
           </div>
           <div className="flex flex-col border-l border-slate-700/50 pl-4">
             <span className="text-slate-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> TRAP CHECK</span>
             <span className={`font-mono ${getTrapColor()}`}>{result.trapCheck || 'CHECKING...'}</span>
           </div>
        </div>

        {/* Core Data Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Entry */}
           <div className="space-y-1">
             <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Entry Zone</div>
             <div className="text-2xl font-black text-blue-400">{result.entry}</div>
           </div>
           {/* Stop Loss */}
           <div className="space-y-1">
             <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Stop Loss (SL)</div>
             <div className="text-2xl font-black text-rose-400">{result.sl}</div>
           </div>
           {/* Targets */}
           <div className="space-y-1">
             <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Targets</div>
             <div className="text-2xl font-black text-emerald-400">{result.targets}</div>
           </div>
        </div>

        {/* Drivers / Heavyweights Section */}
        {result.heavyweights && result.heavyweights.length > 0 && (
          <div className="px-6 py-3 bg-slate-800/20 border-t border-slate-700/50 flex items-center gap-4 overflow-x-auto">
             <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 flex items-center gap-1">
               <Layers className="w-3 h-3" /> Drivers
             </span>
             {result.heavyweights.map((stock, i) => (
               <div key={i} className="flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 shrink-0">
                 <span className="text-xs font-semibold text-slate-300">{stock.name}</span>
                 <span className={`text-[10px] font-bold ${stock.sentiment === 'BULLISH' ? 'text-emerald-400' : stock.sentiment === 'BEARISH' ? 'text-rose-400' : 'text-slate-400'}`}>
                   {stock.sentiment}
                 </span>
               </div>
             ))}
          </div>
        )}

        {/* Reason Footer */}
        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/50 flex items-start gap-3">
           <Activity className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
           <div>
             <span className="text-xs text-slate-500 uppercase font-bold block mb-1">AI Reasoning</span>
             <p className="text-slate-300 text-sm leading-relaxed">
               {result.reason}
             </p>
           </div>
        </div>

      </div>

      {/* 2. CANDLE WHISPERER SECTION (NEW) */}
      {result.candleAnalysis && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-l-4 border-blue-500 rounded-r-xl p-5 shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Eye className="w-16 h-16 text-blue-400" />
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                 <Eye className="w-5 h-5 text-blue-400" />
                 <h3 className="text-sm font-bold text-blue-100 uppercase tracking-wide">Candle Whisperer</h3>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                 <div className={`text-lg font-black ${result.candleAnalysis.sentiment === 'BULLISH' ? 'text-emerald-400' : result.candleAnalysis.sentiment === 'BEARISH' ? 'text-rose-400' : 'text-slate-300'}`}>
                   {result.candleAnalysis.pattern}
                 </div>
                 <div className="hidden md:block w-px h-8 bg-slate-700"></div>
                 <p className="text-sm text-slate-300 italic font-medium leading-relaxed">
                   "{result.candleAnalysis.voice}"
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* 3. MARKET CONTEXT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strategy & Expiry */}
        <div className="bg-market-card border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-3">
               <BarChart2 className="w-4 h-4" />
               Strategy & Setup
             </div>
             <div className="text-lg text-white font-medium mb-1">
               {result.suggestedStrategy}
             </div>
             <div className="text-sm text-slate-500">
               Expiry: {result.expiry}
             </div>
           </div>
        </div>

        {/* News Sentiment */}
        <div className="bg-market-card border border-slate-700 rounded-xl p-5">
           <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
                <ExternalLink className="w-4 h-4" />
                News Radar
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${result.newsSentiment === 'POSITIVE' ? 'text-emerald-400 bg-emerald-500/10' : result.newsSentiment === 'NEGATIVE' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                {result.newsSentiment}
              </span>
           </div>
           <p className="text-sm text-slate-300 leading-relaxed mb-3">
             "{result.newsSummary}"
           </p>
           {result.sources && (
             <div className="flex flex-wrap gap-2">
               {result.sources.slice(0, 2).map((s, i) => (
                 <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded border border-slate-700 transition-colors truncate max-w-[150px]">
                   {s.title}
                 </a>
               ))}
             </div>
           )}
        </div>

      </div>

      {/* Disclaimer */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 mt-4">
        <AlertTriangle className="w-3 h-3" />
        <span>Educational use only. Not SEBI registered. Trading is risky.</span>
      </div>

    </div>
  );
};
