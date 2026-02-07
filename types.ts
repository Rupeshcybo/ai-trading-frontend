export enum AnalysisStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type MarketIndex = 'NIFTY' | 'BANKNIFTY';
export type TradingStrategy = 'INTRADAY' | 'SCALPING';

export interface AnalysisResult {
  // Core Decision Card
  signal: 'LONG' | 'SHORT' | 'NO TRADE';
  entry: string;
  sl: string;
  targets: string;
  confidence: number;
  reason: string;
  
  // Smart AI Insights
  marketRegime: 'TRENDING' | 'RANGING' | 'VOLATILE';
  suggestedStrategy: string; 
  
  // New "True Result" Validators
  indiaVix: string; // e.g., "14.5 (High Momentum)"
  pcr: string; // Put Call Ratio estimate
  trapCheck: 'SAFE' | 'CAUTION' | 'TRAP DETECTED';

  // New "Heavyweight" Engine Check
  heavyweights: {
    name: string; // e.g. "HDFC Bank"
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  }[];

  // CANDLE WHISPERER (NEW)
  candleAnalysis: {
    pattern: string; // e.g. "Shooting Star / Hammer"
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    voice: string; // The "Voice" of the candle (e.g., "Sellers are rejecting this price aggressively")
  };

  // Context
  expiry: string;
  newsSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  newsSummary: string;
  sources?: { title: string; uri: string }[];
}

export interface ChartData {
  imageUrl: string;
  base64: string;
  name: string;
}
