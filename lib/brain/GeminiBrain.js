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

    static async generateScript(trendData, config, tone) {
        // Fallback for demo if no key
        if (!API_KEY) {
            console.warn("Gemini Key Missing. Generating Neural Mock...");
            await new Promise(r => setTimeout(r, 2000));
            return {
                sections: [
                    { type: "hook", text: "Stop doing this ONE mistake.", visual: "Close up of frustrated person" },
                    { type: "value", text: `Here is the secret to ${typeof trendData === 'string' ? trendData : trendData.topic}.`, visual: "Fast paced montage" },
                    { type: "cta", text: "Subscribe for more.", visual: "Pointing to button" }
                ]
            };
        }

        // Parse Input: Support both string (legacy) and Object (rich data)
        const topic = typeof trendData === 'string' ? trendData : trendData.topic;
        const metrics = typeof trendData === 'object' ? trendData : {};

        // Use the new Prompt Engine (Module E)
        const { PromptSynthesizer } = await import("./PromptSynthesizer.js");

        // Mock profile for now if we don't have historical data passed in yet
        const mockProfile = {
            target_duration_sec: 45,
            keywords: ["viral", "secret", "hack"],
            pacing_style: metrics.growth_rate > 500 ? "Extremely Fast / Hype" : "Steady / Educational", // Adapt to data
            visual_mood: metrics.engagement_score > 80 ? "High Energy / Neon" : "Clean / Minimalist" // Adapt to score
        };

        const systemPrompt = PromptSynthesizer.generateSystemPrompt(mockProfile, config, topic);

        const fullPrompt = `
        ${systemPrompt}
        
        STRICT OUTPUT FORMAT (JSON) Example:
        {
          "sections": [
             { "type": "hook", "audio_voiceover": "...", "visual_prompt": "..." },
             { "type": "body", "audio_voiceover": "...", "visual_prompt": "..." },
             { "type": "cta", "audio_voiceover": "...", "visual_prompt": "..." }
          ]
        }
        `;

        try {
            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '');
            const data = JSON.parse(text);

            // Map new schema to UI schema if necessary
            // UI expects: { type, text, visual }
            if (data.sections) {
                data.sections = data.sections.map(s => ({
                    type: s.type,
                    text: s.audio_voiceover || s.text,
                    visual: s.visual_prompt || s.visual, // The "Million Dollar" prompt
                    duration_ms: 3000 // Placeholder, could parse time_range later
                }));
            }
            return data;
        } catch (e) {
            console.error("Gemini Script Gen Failed", e);
            return null;
        }
    }
}
