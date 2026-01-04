/**
 * MODULE E: PROMPT SYNTHESIS ENGINE
 * 
 * Purpose: Generates the specialized "Gemini Veo" style prompt.
 * This is the bridge between Data/ML and Generative AI.
 */

export class PromptSynthesizer {

    /**
     * Synthesizes the final prompt structure.
     * @param {Object} patternProfile - Output from PatternLearner
     * @param {Object} userConfig - User's brand/risk constraints
     * @param {String} genre - The search niche
     * @returns {String} - The final robust system prompt.
     */
    static generateSystemPrompt(patternProfile, userConfig, genre) {
        if (!patternProfile) return "Error: No pattern profile generated.";

        return `
You are a WORLD-CLASS VIDEO DIRECTOR and SCRIPTWRITER.
Your task is to create a VIDEO BLUEPRINT for the genre: "${genre}".

### 1. INTELLIGENCE BRIEF
Based on real engagement analysis (Module A-D), successful videos in this niche have:
- Average Duration: ${patternProfile.target_duration_sec} seconds
- Key Themes: ${patternProfile.keywords.join(", ")}
- Pacing: ${patternProfile.pacing_style}

### 2. DIRECTIVE
Create a "${userConfig.voice_tone || 'Professional'}" coding/script plan.

### 3. REQUIRED OUTPUT FORMAT (JSON)
{
  "title": "Viral Clickworthy Title",
  "concept_hook": "The psychological hook strategy",
  "visual_style": "Cinematic description for Veo/Pexels",
  "pacing_guide": "e.g. Cut every 2 seconds",
  "script_sections": [
    {
      "time_range": "00:00 - 00:05",
      "visual_prompt": "Specific visual description for video generation models...",
      "audio_voiceover": "Spoken text...",
      "screen_text": "Overlay text..."
    }
  ]
}

### 4. CREATIVE CONSTRAINTS (USER)
- Risk Profile: ${userConfig.risk_profile || 'Medium'}
- Goal: ${userConfig.growth_priority || 'Reach'}
- Visuals must be: ${patternProfile.visual_mood}

GENERATE NOW.
`;
    }
}
