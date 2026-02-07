import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { AnalysisResult, AnalysisStatus, MarketIndex, TradingStrategy, ChartData } from './types';
import { analyzeChartImage } from './services/geminiService';
import { UploadCloud, Loader2, AlertTriangle, Maximize2 } from './components/Icons';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [chartImages, setChartImages] = useState<ChartData[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [market, setMarket] = useState<MarketIndex>('BANKNIFTY');
  const [strategy, setStrategy] = useState<TradingStrategy>('INTRADAY');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processFiles(Array.from(event.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setErrorMsg('Please upload valid image files.');
      return;
    }

    if (validFiles.length > 2) {
      setErrorMsg('Max 2 images allowed (HTF & LTF).');
      return;
    }

    const promises = validFiles.map(file => {
      return new Promise<ChartData>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            imageUrl: URL.createObjectURL(file), // For preview (optional usage)
            base64: e.target?.result as string,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(data => {
      setChartImages(data);
      setResult(null);
      setErrorMsg(null);
      setStatus(AnalysisStatus.IDLE);
    });
  };

  const handleAnalyze = async () => {
    if (chartImages.length === 0) return;

    try {
      setStatus(AnalysisStatus.ANALYZING);
      setErrorMsg(null);
      // Pass array of base64 strings
      const base64List = chartImages.map(img => img.base64);
      const data = await analyzeChartImage(base64List, market, strategy);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to analyze chart');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="min-h-screen bg-market-dark font-sans text-slate-200 selection:bg-blue-500/30">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col gap-8">
          
          {/* Hero Section */}
          {!result && status !== AnalysisStatus.ANALYZING && (
            <div className="text-center max-w-2xl mx-auto space-y-4 animate-fade-in mb-4">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                Smart Option <span className="text-blue-500">Signals</span>
              </h2>
              <p className="text-slate-400 text-base md:text-lg">
                Multi-Timeframe Analysis. Upload <span className="text-white font-bold">15m (HTF)</span> & <span className="text-white font-bold">5m (LTF)</span> charts for higher accuracy.
              </p>
            </div>
          )}

          {/* Settings */}
          <div className="w-full max-w-3xl mx-auto bg-slate-800/50 p-2 rounded-2xl flex flex-col md:flex-row gap-2 border border-slate-700">
             <div className="flex-1 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setMarket('NIFTY')}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${market === 'NIFTY' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  NIFTY 50
                </button>
                <button 
                  onClick={() => setMarket('BANKNIFTY')}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${market === 'BANKNIFTY' ? 'bg-yellow-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  BANKNIFTY
                </button>
             </div>
             <div className="flex-1 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setStrategy('INTRADAY')}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${strategy === 'INTRADAY' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  Intraday
                </button>
                <button 
                  onClick={() => setStrategy('SCALPING')}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${strategy === 'SCALPING' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  Scalping
                </button>
             </div>
          </div>

          {/* Upload Area */}
          <div className={`grid grid-cols-1 ${result ? 'lg:grid-cols-12 gap-8' : 'max-w-3xl mx-auto w-full'}`}>
            
            <div className={`
              ${result ? 'lg:col-span-4' : 'w-full'} 
              transition-all duration-500 ease-in-out
            `}>
              <div 
                className={`
                  relative border-2 border-dashed border-slate-700 rounded-2xl bg-market-card/50 
                  flex flex-col items-center justify-center text-center overflow-hidden
                  group hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer
                  ${chartImages.length > 0 ? 'aspect-auto p-4' : 'aspect-video py-12'}
                  ${status === AnalysisStatus.ANALYZING ? 'opacity-50 pointer-events-none' : ''}
                `}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={chartImages.length === 0 ? triggerFileInput : undefined}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept="image/*"
                  multiple // Allow multiple files
                />

                {chartImages.length > 0 ? (
                  <div className="w-full grid grid-cols-1 gap-4">
                     {chartImages.map((img, idx) => (
                        <div key={idx} className="relative group/img">
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-xs font-bold text-white rounded backdrop-blur-md z-10">
                            {idx === 0 ? 'Chart 1 (HTF)' : 'Chart 2 (LTF)'}
                          </div>
                          <img 
                            src={img.base64} 
                            alt={`Chart ${idx+1}`} 
                            className="w-full h-auto rounded-xl object-contain border border-slate-700" 
                          />
                        </div>
                     ))}
                     
                     <div className="flex gap-2 justify-center mt-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium text-sm transition-colors"
                        >
                          Change Charts
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setChartImages([]); }}
                          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg font-medium text-sm transition-colors"
                        >
                          Clear
                        </button>
                     </div>
                  </div>
                ) : (
                  <div className="p-8 space-y-4">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">Upload 1 or 2 Charts</p>
                      <p className="text-xs text-slate-500 mt-1">Upload 15m (Trend) and 5m (Entry)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {chartImages.length > 0 && status !== AnalysisStatus.SUCCESS && (
                <button
                  onClick={handleAnalyze}
                  disabled={status === AnalysisStatus.ANALYZING}
                  className={`
                    w-full mt-6 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20
                    flex items-center justify-center gap-3 transition-all transform active:scale-95
                    ${status === AnalysisStatus.ANALYZING 
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white'
                    }
                  `}
                >
                  {status === AnalysisStatus.ANALYZING ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-5 h-5" />
                      Generate Signals
                    </>
                  )}
                </button>
              )}

               {/* Error Message */}
              {errorMsg && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 animate-pulse">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Right/Bottom: Results Area */}
            {result && (
              <div className="lg:col-span-8 animate-fade-in-up">
                 <AnalysisDisplay result={result} />
                 
                 <div className="mt-8 flex justify-center">
                    <button 
                      onClick={() => {
                        setResult(null);
                        setChartImages([]);
                        setStatus(AnalysisStatus.IDLE);
                      }}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-sm font-bold flex items-center gap-2 border border-slate-700"
                    >
                      Analyze New Setup
                    </button>
                 </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
