import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export class GeminiBrain {
    static genAI = new GoogleGenerativeAI(API_KEY || "");
    static model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    static async analyzeTrends(trends) {
        if (!API_KEY) return { winnerId: trends[0].id, reasoning: "Gemini Key Missing. Fallback to math." };

        const prompt = `
      Act as a Viral Content Strategist. Analyze these potential video trends and pick the ONE with the highest viral potential.
      
      Trends:
      ${trends.map(t => `- ID: ${t.id}, Topic: "${t.topic}", Growth: ${t.growth_rate}%, Vol: ${t.volume}`).join('\n')}
      
      Return JSON only: { "winnerId": "string", "reasoning": "short explanation" }
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '');
            return JSON.parse(text);
        } catch (e) {
            console.error("Gemini Analysis Failed", e);
            return { winnerId: trends[0].id, reasoning: "AI Analysis Failed. Fallback to math." };
        }
    }

    static async generateScript(trend, config, tone) {
        if (!API_KEY) throw new Error("Gemini Key Missing");

        const prompt = `
      Write a viral short-form video script for TikTok/Reels about: "${trend}".
      Target Audience: ${config.initial_genre}.
      Tone: ${tone}.
      
      Structure:
      1. Hook (0-3s): Grab attention.
      2. Curiosity (3-8s): Build intrigue.
      3. Value (8-30s): The core insight.
      4. CTA (30s+): Call to action.
      
      Return JSON only with this schema:
      {
        "sections": [
           { "type": "hook", "text": "...", "visual": "..." },
           { "type": "curiosity", "text": "...", "visual": "..." },
           { "type": "value", "text": "...", "visual": "..." },
           { "type": "cta", "text": "...", "visual": "..." }
        ]
      }
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '');
            return JSON.parse(text);
        } catch (e) {
            console.error("Gemini Script Gen Failed", e);
            return null;
        }
    }
}
