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
You are a ACADEMY AWARD-WINNING DIRECTOR OF PHOTOGRAPHY and MASTER SCRIPTWRITER.
Your goal is to create a "Million Dollar" Visual Masterpiece for: "${genre}".

### 1. INTELLIGENCE BRIEF
- Target Duration: ${patternProfile.target_duration_sec} seconds (MATCH THIS EXACTLY)
- Pacing: ${patternProfile.pacing_style}
- Key Themes: ${patternProfile.keywords.join(", ")}

### 2. CINEMATOGRAPHY STANDARDS (MANDATORY)
Every "visual" description MUST include:
- **CAMERA**: Specify movement (Dolly In, Truck Left, FPV Drone) and Angle (Low Angle, Dutch Tilt, Top Down).
- **LIGHTING**: Specify mood (Cyberpunk Neon, Soft Box Rembrant, Golden Hour God Rays, Volumetric Fog).
- **LENS**: Specify look (35mm Anamorphic, 85mm Bokeh, Macro Probe).
- **QUALITY**: "8k, unreal engine 5 render, cinematic color grading, hyper-realistic".

### 3. SCRIPT DIRECTIVE
Create a "${userConfig.voice_tone || 'Professional'}" script that hooks instantly.
- The script must be engaging, addictive, and provide immense value efficiently.
- The visual cues must be DETAILED enough for a Generative Video Model (Veo/Sora) to generate a perfect shot.

### 4. REQUIRED OUTPUT FORMAT (JSON)
{
  "title": "Viral Title",
  "sections": [
    {
      "time_range": "00:00 - 00:03",
      "type": "hook",
      "visual_prompt": "Low angle, dolly forward, 24mm lens. A programmer in a dark room illuminated by triple monitor blue neon glow. Matrix code reflection in glasses. 8k cinematic.",
      "audio_voiceover": "Stop writing code like it's 1999.",
      "screen_text": "STOP DOING THIS ❌"
    }
    // ... continue for full duration
  ]
}

GENERATE NOW.
`;
  }
}
