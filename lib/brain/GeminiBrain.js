import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export class GeminiBrain {
  static genAI = new GoogleGenerativeAI(API_KEY || "");
  static model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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

  static async analyzeUploadTiming(trends) {
    if (!API_KEY) return null;

    // 1. Pre-process data for the AI context (Velocity & Buckets)
    const videosData = trends.map(t => ({
      title: t.title,
      published_at: t.published_at,
      views: t.views,
      likes: t.likes,
      comments: t.comments,
      duration: t.duration_iso,
      velocity: t.view_velocity, // Calculated in YouTubeService
      engagement_ratio: ((t.likes + t.comments) / (t.views || 1)).toFixed(4)
    }));

    const prompt = `
            You are an AI data analyst specialized in YouTube growth and engagement intelligence.
            Your task is to determine the real-time peak engagement upload time for a given YouTube genre using historical and near-real-time data.

            📥 INPUT DATA YOU WILL RECEIVE:
            ${JSON.stringify(videosData.slice(0, 30))}

            📊 YOUR ANALYSIS OBJECTIVES:
            1. Calculate Engagement Velocity (Views/Likes/Comments per hour).
            2. Identify Early Momentum (Focus on first 1h-6h spikes).
            3. Bucket Videos by Upload Time & Compare average engagement velocity.
            4. Detect Peak Engagement Windows where velocity is consistently highest.

            🧠 DECISION LOGIC (VERY IMPORTANT):
            - Peak engagement time ≠ when most users are online.
            - Peak engagement time = maximum sustained engagement velocity.
            - Prefer time windows that show high early engagement and strong retention.
            - Reduce bias from one-time viral outliers.

            📤 EXPECTED OUTPUT FORMAT (STRICT JSON ONLY):
            {
              "peak_upload_time": {
                "day": "Day Name (e.g. Monday)",
                "time_range": "HH:MM - HH:MM (24h format)",
                "timezone": "IST"
              },
              "confidence_score": 0.00 (float 0-1),
              "reasoning_summary": [
                "Reason 1: Why this time window performs best",
                "Reason 2: Key signals detected",
                "Reason 3: Consistency check"
              ],
              "supporting_metrics": {
                "avg_views_per_hour": number,
                "avg_likes_per_hour": number,
                "engagement_velocity_score": number
              }
            }
        `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Gemini Upload Analysis Failed", e);
      return null;
    }
  }
  static async performViralAnalysis(videos, genre, platform = "YouTube") {
    if (!API_KEY) return { error: "Gemini Key Missing" };

    // Filter valid videos and format for AI Input
    const inputs = videos.slice(0, 20).map(v => ({
      title: v.title,
      duration: v.duration_iso,
      views_per_hour: Math.round(v.view_velocity || 0),
      upload_time: v.published_at,
      creator_size: v.creator_size,
      engagement_ratio: (v.like_ratio + v.comment_ratio).toFixed(4)
    }));

    const systemInstruction = `
🧠 SYSTEM INSTRUCTION (VERY IMPORTANT)

You are an autonomous AI research agent specialized in:
Short-form and long-form content virality
Platform algorithms (YouTube, Shorts, Reels, TikTok)
Audience psychology and behavioral triggers
Data-driven trend analysis

You must think analytically, validate with data, and avoid assumptions.

🎯 INPUTS (VARIABLES)
GENRE: ${genre}
PLATFORM: ${platform}
TIME WINDOW: last 7 days (implied from data)

🔍 VIDEO DATA PROVIDED:
${JSON.stringify(inputs)}

🧠 TASK 1 — TREND & VIRAL VIDEO DISCOVERY (Already sorted by velocity)
Identify why these videos are winning. Use the provided data.

🧠 TASK 2 — VIRAL PATTERN EXTRACTION
Analyze the collected videos (titles, timing, velocity) and infer:
- Hook patterns
- Title formulas
- Optimal length
- Loopability

🧠 TASK 3 — TREND MOMENTUM & TIMING
Identify if this genre is Growing, Peaking, or Declining.
Recommend best posting times based on the 'upload_time' of winning videos.

🧠 TASK 4 — AUDIENCE PSYCHOLOGY INSIGHT
Why do they click? What is the pain point?

🛠️ TASK 5 — ACTIONABLE OUTPUT GENERATION
Generate specific content ideas, scripts, and thumbnail prompts.

📌 OUTPUT FORMAT (STRICT JSON)
You must return a valid JSON object with this exact structure. Do not wrap in markdown code blocks.

{
  "viral_insights_summary": ["bullet 1", "bullet 2"],
  "top_patterns_identified": {
    "hooks": ["pattern 1", "pattern 2"],
    "titles": ["pattern 1"],
    "retention_logic": "string"
  },
  "trend_status_timing": {
    "status": "Early | Growing | Peak | Declining",
    "best_posting_times": ["Day + Hour"],
    "urgency_score": 0-10
  },
  "audience_psychology": {
    "pain_points": [],
    "aspirations": [],
    "emotional_triggers": []
  },
  "content_ideas": [
    {
      "hook_line": "...",
      "title": "...",
      "angle": "...",
      "virality_score": 1-10
    }
  ],
  "script_blueprint": {
    "hook": "...",
    "flow": "...",
    "cta_placement": "..."
  },
  "thumbnail_prompts": [
    {
      "description": "...",
      "color_contrast": "..."
    }
  ],
  "next_7_day_plan": ["Day 1...", "Day 2..."]
}
`;

    try {
      const result = await this.model.generateContent(systemInstruction);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Gemini Viral Analysis Failed", e);
      return { error: "Gemini Analysis Failed", details: e.message, stack: e.stack };
    }
  }

  static async analyzeSingleVideo(video) {
    if (!API_KEY) return { error: "Key Missing" };

    const systemPrompt = `
        ACT AS A VIRAL CONTENT STRATEGIST.
        Analyze this specfic video to understand WHY it is trending.

        VIDEO CONTEXT:
        Title: ${video.title}
        Views/Hour: ${Math.round(video.view_velocity || 0)}
        Duration: ${video.duration_iso}
        Viral Ratio: ${video.viral_ratio}

        YOUR GOAL:
        1. Deconstruct the "Viral DNA" (Hook, Emotion, Payoff).
        2. Create a "Replica Strategy" for the user to make a *better* version.
        3. Generate highly optimized metadata (Title, Desc, Hashtags).
        4. Write a "Visual Prompt" for an AI Video Generator to recreate the vibe.

        OUTPUT JSON STRICTLY:
        {
            "viral_dna": {
                "hook_tactic": "...",
                "emotional_driver": "...",
                "retention_mechanic": "..."
            },
            "replica_strategy": {
                "better_title_options": ["Title 1", "Title 2"],
                "content_angle": "...",
                "script_outline": ["0-5s: ...", "5-20s: ..."]
            },
            "metadata_pack": {
                "description": "...",
                "hashtags": ["#..."]
            },
            "ai_video_prompt": "Cinematic 4k masterpiece..."
        }
        `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Single Video Analysis Failed", e);
      return null;
    }
  }

  static async chatWithVideoAgent(message, videoContext) {
    if (!API_KEY) return "Error: No API Key";

    const chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `CONTEXT: You are analyzing this video: ${JSON.stringify(videoContext)}. You are a helpful, expert viral strategist.` }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to dissect this video and help you go viral." }]
        }
      ]
    });

    try {
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (e) {
      return "AI Connection Failed: " + e.message;
    }
  }
}
