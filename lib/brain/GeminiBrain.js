import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export class GeminiBrain {
    static genAI = new GoogleGenerativeAI(API_KEY || "");
    static model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        // Fallback for demo if no key
        if (!API_KEY) {
            console.warn("Gemini Key Missing. Generating Neural Mock...");
            await new Promise(r => setTimeout(r, 2000)); // Simulate think time
            return {
                sections: [
                    { type: "hook", text: "Stop doing this ONE mistake.", visual: "Close up of frustrated person" },
                    { type: "value", text: `Here is the secret to ${trend.toUpperCase()}.`, visual: "Fast paced montage" },
                    { type: "cta", text: "Subscribe for more.", visual: "Pointing to button" }
                ]
            };
        }

        // Use the new Prompt Engine (Module E)
        // For V1, we generate a pattern profile on the fly or use defaults
        const { PromptSynthesizer } = await import("./PromptSynthesizer.js"); // Dynamic import to avoid circular dep if any

        // Mock profile for now if we don't have historical data passed in yet
        const mockProfile = {
            target_duration_sec: 45,
            keywords: ["viral", "secret", "hack"],
            pacing_style: "Fast Paced",
            visual_mood: "High Contrast"
        };

        const systemPrompt = PromptSynthesizer.generateSystemPrompt(mockProfile, config, trend);

        const fullPrompt = `
        ${systemPrompt}
        
        STRICT OUTPUT FORMAT (JSON):
        {
          "sections": [
             { "type": "hook", "text": "...", "visual": "..." },
             { "type": "body", "text": "...", "visual": "..." },
             { "type": "cta", "text": "...", "visual": "..." }
          ]
        }
        `;

        try {
            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '');
            return JSON.parse(text);
        } catch (e) {
            console.error("Gemini Script Gen Failed", e);
            return null;
        }
    }
}
