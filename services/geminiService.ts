
import { GoogleGenAI, Type } from "@google/genai";
import { RouteData } from "../types";

// Always use a named parameter for the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeTrafficTrends = async (routes: any[]): Promise<RouteData[]> => {
  // We use Gemini to calculate a 'Trend Score' based on current vs historical data
  // and provide a natural language description of why a route is more 'stable'.
  
  const prompt = `Analyze these traffic routes. Compare current duration vs historical duration. 
  A high 'trendScore' (0-100) means the route is consistent and less likely to have volatile spikes.
  Return JSON for each route.
  Routes: ${JSON.stringify(routes)}`;

  // Use the recommended model for reasoning tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            trendScore: { type: Type.NUMBER },
            reliability: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['id', 'trendScore', 'reliability', 'description']
        }
      }
    }
  });

  // Accessing text content directly via property.
  const analysis = JSON.parse(response.text || '[]');
  
  return routes.map(route => {
    const aiData = analysis.find((a: any) => a.id === route.id) || {
      trendScore: 50,
      reliability: 'Medium',
      description: 'Standard traffic conditions.'
    };
    return {
      ...route,
      ...aiData
    };
  });
};
