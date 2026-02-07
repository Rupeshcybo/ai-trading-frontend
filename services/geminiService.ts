import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, MarketIndex, TradingStrategy } from "../types";

const SYSTEM_INSTRUCTION = `
You are an Institutional Algo-Trader for Indian Markets (NIFTY/BANKNIFTY).
Your objective is **TRUE ACCURACY**. You must validate charts against the **UNDERLYING HEAVYWEIGHTS** and **CANDLE PSYCHOLOGY**.

**THE "TRUE RESULT" PROTOCOL (4-LAYER VALIDATION)**:

1. **LAYER 1: MACRO (VIX & PCR)**
   - VIX < 12 = No Momentum (No Trade).
   - PCR > 1.4 (Overbought) or < 0.55 (Oversold) = Reversal Risk.

2. **LAYER 2: THE "ENGINE" CHECK (Heavyweights)**
   - **For BANKNIFTY**: You MUST check **HDFC BANK** and **ICICI BANK**.
     - If BankNifty Chart is Bullish, but HDFC Bank is Bearish -> **FALSE SIGNAL (TRAP)**.
   - **For NIFTY**: You MUST check **RELIANCE IND** and **INFOSYS/HDFC**.
     - If Nifty Chart is Bullish, but Reliance is Bearish -> **FALSE SIGNAL (TRAP)**.

3. **LAYER 3: CANDLE WHISPERER (Psychology)**
   - Analyze the **LAST 2-3 CANDLES** visually.
   - **WICKS**: Long upper wick = Sellers defending (Bearish). Long lower wick = Buyers defending (Bullish).
   - **BODIES**: Big Green Candle = Aggression. Big Red Candle = Panic. Small bodies = Indecision.
   - Interpret what the candle is "saying".

4. **LAYER 4: PRICE ACTION (Structure)**
   - Trend alignment between HTF and LTF.
   - Support/Resistance levels.

**OUTPUT SCHEMA (JSON)**:
{
  "signal": "LONG" | "SHORT" | "NO TRADE",
  "entry": "Exact price zone",
  "sl": "Exact level",
  "targets": "Target 1 / Target 2",
  "confidence": number,
  "reason": "Synthesize Chart + VIX + HDFC/Reliance status.",
  "marketRegime": "TRENDING" | "RANGING" | "VOLATILE",
  "suggestedStrategy": "Strategy Name",
  "indiaVix": "Value",
  "pcr": "Value",
  "trapCheck": "SAFE" | "CAUTION" | "TRAP DETECTED",
  "heavyweights": [
    { "name": "HDFC Bank", "sentiment": "BULLISH" },
    { "name": "ICICI Bank", "sentiment": "NEUTRAL" }
  ],
  "candleAnalysis": {
    "pattern": "Name (e.g. Bullish Hammer)",
    "sentiment": "BULLISH",
    "voice": "Direct interpretation. E.g. 'Price dipped but buyers aggressively bought it back up. Smart money is entering.'"
  },
  "expiry": "Current Week",
  "newsSentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "newsSummary": "Brief news context."
}

**FINAL DECISION LOGIC**:
- IF (Chart == Bullish) AND (Heavyweights == Bearish) -> OUTPUT "NO TRADE".
- IF (Chart == Bullish) AND (VIX < 11) -> OUTPUT "NO TRADE".
- ONLY OUTPUT "LONG" IF Chart + Heavyweights + VIX align.
`;

export const analyzeChartImage = async (
  base64Images: string[], 
  market: MarketIndex,
  strategy: TradingStrategy
): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imageParts = base64Images.map(img => {
      const base64Data = img.split(',')[1];
      return {
        inlineData: {
          data: base64Data,
          mimeType: 'image/png'
        }
      };
    });

    // Dynamic prompts for component stocks
    let specificQueries = "";
    if (market === 'BANKNIFTY') {
      specificQueries = "Search for 'HDFC Bank share price intraday trend' and 'ICICI Bank share price intraday trend'.";
    } else {
      specificQueries = "Search for 'Reliance Industries share price intraday trend' and 'HDFC Bank share price intraday trend'.";
    }

    const userPrompt = `
    PERFORM "TRUE RESULT" VALIDATION for ${market} (${strategy}).
    Time: ${new Date().toLocaleString('en-IN')}.
    
    TASK 1: SEARCH LIVE DATA
    - India VIX live.
    - Nifty/BankNifty PCR sentiment.
    - **CRITICAL**: ${specificQueries} (Analyze their move today).

    TASK 2: CHART ANALYSIS (CANDLE PSYCHOLOGY)
    - **READ THE CANDLES**: Look at the most recent candles on the chart. 
    - Are they leaving wicks? Are they full body? What is the "Voice" of the market right now?

    TASK 3: SYNTHESIS
    - Do the heavyweights support the index move?
    - If HDFC/Reliance are opposing the index direction, declare it a TRAP.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: userPrompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        tools: [{googleSearch: {}}]
      }
    });

    const textResponse = response.text;
    
    if (!textResponse) {
      throw new Error("No response received from Gemini.");
    }

    const result: AnalysisResult = JSON.parse(textResponse);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
        result.sources = groundingChunks
            .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
            .filter((source: any) => source !== null);
    }

    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze. Please try again.");
  }
};
