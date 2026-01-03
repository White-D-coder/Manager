import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface StrategyProfile {
    niche: string;
    target_audience: string;
    content_pillars: string[];
    voice_tone: string;
    visual_style: string;
    color_palette: string[];
    posting_schedule: string;
}

export class StrategyAgent {
    static async analyzeNiche(niche: string): Promise<StrategyProfile> {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("Gemini API Key missing. Returning default strategy.");
            return this.getDefaultStrategy(niche);
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

            const prompt = `
            You are a World-Class Social Media Strategist.
            Analyze this Niche: "${niche}"

            Output a strict JSON object with this structure (no markdown):
            {
                "niche": "${niche}",
                "target_audience": "Specific demographic description (max 10 words)",
                "content_pillars": ["Theme 1", "Theme 2", "Theme 3", "Theme 4"],
                "voice_tone": "Adjectives describing the script voice (e.g. Professional, Hype, Calm)",
                "visual_style": "Keywords for stock footage search (e.g. minimal, luxury, tech, nature)",
                "color_palette": ["#hex1", "#hex2", "#hex3"],
                "posting_schedule": "Recommended frequency (e.g. Daily at 6PM)"
            }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json|```/g, "").trim();

            return JSON.parse(text) as StrategyProfile;

        } catch (error) {
            console.error("Strategy Analysis Failed:", error);
            return this.getDefaultStrategy(niche);
        }
    }

    private static getDefaultStrategy(niche: string): StrategyProfile {
        return {
            niche,
            target_audience: "General Audience",
            content_pillars: ["Trends", "Tips", "News", "Lifestyle"],
            voice_tone: "Informative and Engaging",
            visual_style: "aesthetic, minimal, professional",
            color_palette: ["#ffffff", "#000000", "#333333"],
            posting_schedule: "Daily"
        };
    }
}
