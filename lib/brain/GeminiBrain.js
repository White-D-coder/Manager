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

  static async analyzeSingleVideo(video, comments = []) {
    if (!API_KEY) return { error: "Key Missing" };

    const systemPrompt = `
        You are a YouTube video content and engagement analyst.

        TASK:
        Analyze the given YouTube video and explain WHY people engage with it.

        INPUT:
        - Title: "${video.title}"
        - Description: "${video.description ? video.description.substring(0, 800) : "No description"}..."
        - Metrics: ${Math.round(video.view_velocity || 0)} views/hour, ${video.viral_ratio}x viral ratio
        - Sample Comments: ${JSON.stringify(comments)}
        - Length: ${video.duration_iso}

        OUTPUT (STRICT JSON). DO NOT INCLUDE MARKDOWN BLOCK formatting.

        {
            "engagement_analysis": {
                "core_content_type": "education | storytelling | shock | curiosity...",
                "target_audience": "Who this is for...",
                "hook_analysis": {
                    "tactic": "What grabs attention (0-5s)",
                    "why_it_works": "Psychological reason"
                },
                "engagement_drivers": {
                    "emotions": ["Fear", "Joy", "Validation"],
                    "relatability_score": 1-10,
                    "curiosity_gaps": "What question does it open?"
                },
                "comment_sentiment": "positive | negative | debate | questions",
                "why_this_works": "1-2 core reasons for success"
            },
            "content_intelligence": {
                "brief": "Summary of what actually happens in this video...",
                "description_analysis": "Critique of their description..."
            },
            "viral_gap_analysis": {
                  "current_flaws": ["Rushed pacing", "Flat lighting"],
                  "opportunity": "Add cinematic depth and pauses"
            },
            "video_concept": {
                "core_idea": "...",
                "emotional_promise": "...",
                "primary_emotion": "..."
            },
            "script_structure": {
                "hook_0_3s": { "words": "...", "emotion": "...", "facial_expression": "...", "camera_angle": "..." },
                "engagement_3_15s": { "visual_pacing": "...", "sound_design": "..." },
                "core_value": "...",
                "payoff": "...",
                "cta": { "text": "...", "emotion": "..." }
            },
            "production_guide": {
                "camera": { "angle": "...", "movement": "..." },
                "lighting": { "key_light": "...", "color_temp": "...", "emotional_impact": "..." },
                "audio": { "voice_pace": "...", "emotional_variation": "..." }
            },
            "packaging": {
                "thumbnail_visual": "...",
                "title_options": ["Title 1", "Title 2"]
            },
             "viral_metadata": {
                "hashtags": ["#..."],
                "description": "..."
            }
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

  static async generateTrendIdeas() {
    if (!API_KEY) return ["Psychology Facts", "Scary Stories", "AI News", "History Facts"]; // Fallback

    const prompt = `
      Act as a YouTube Trend Researcher.
      Identify 5 FAST-GROWING "Faceless" Niche Categories that are currently viral on YouTube Shorts (Global/India).
      
      Focus on topics with high retention and shareability (e.g., unexplained mysteries, psychology hacks, future tech, stoicism).
      
      OUTPUT: Return ONLY a JSON array of strings. No markdown.
      Example: ["Psychology Facts", "Dark History", "AI Tools"]
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Gemini Trend Generation Failed", e);
      return ["Psychology Facts", "Scary Urban Legends", "Crazy History", "Future AI", "Space Mysteries"];
    }
  }

  static async analyzeUploadTiming(trends) {
    if (!API_KEY) return null;

    // Force IST Timezone (UTC+5:30)
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    // 1. Pre-calculate Engagement Velocity & Normalized Scores
    // Formula: (views_per_min * 0.5) + (likes_per_min * 0.3) + (comments_per_min * 0.2)
    const inputs = trends.map(t => {
      const uploadDate = new Date(t.published_at);
      const daysSince = (now - uploadDate) / (1000 * 60 * 60 * 24);
      const minutesAge = Math.max(1, (now - uploadDate) / (1000 * 60)); // Avoid zero

      // Basic Velocity
      const viewsPerMin = t.views / minutesAge;
      const likesPerMin = t.likes / minutesAge;
      const commentsPerMin = t.comments / minutesAge;

      // Normalized Score (User Formula)
      const engagementScore = (viewsPerMin * 0.5) + (likesPerMin * 0.3) + (commentsPerMin * 0.2);

      return {
        title: t.title,
        day: uploadDate.toLocaleDateString('en-US', { weekday: 'long' }),
        time: uploadDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        age_minutes: Math.round(minutesAge),
        engagement_score: parseFloat(engagementScore.toFixed(4)),
        velocity_metrics: {
          vpm: parseFloat(viewsPerMin.toFixed(2)),
          lpm: parseFloat(likesPerMin.toFixed(2)),
          cpm: parseFloat(commentsPerMin.toFixed(2))
        }
      };
    }).sort((a, b) => b.engagement_score - a.engagement_score).slice(0, 30); // Top 30 for density


    const today = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: "Asia/Kolkata" });
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long', timeZone: "Asia/Kolkata" });

    const systemPrompt = `
        You are a real-time YouTube engagement timing analyst.

        OBJECTIVE:
        Predict the BEST UPLOAD WINDOW for **${targetDay}** (Tomorrow).
        
        CONTEXT:
        Current Time (IST): ${now.toLocaleString()}
        Today is: ${today}
        Target Prediction Day: ${targetDay}

        INPUT DATA (Normalized Engagement Scores from recent trends):
        ${JSON.stringify(inputs)}

        PROCESS:
        1. Look for patterns in the input data specifically for **${targetDay}s**.
        2. If no data exists explicitly for ${targetDay}, analyze the "General Best Time" across all days and apply it to ${targetDay}.
        3. IGNORE data from other days unless used for general baseline.
        4. Predict a specific 15-minute window for ${targetDay}.

        OUTPUT (STRICT JSON ARRAY):
        Return ONLY 1 item: The prediction for ${targetDay}.
        [
            {
                "day": "${targetDay}",
                "peak_window": "HH:MM–HH:MM",
                "recommended_upload_time": "HH:MM", 
                "momentum": "Predicted High",
                "confidence_score": 0.95,
                "reason": "Based on [specific data] or [general velocity baseline]."
            }
        ]
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      const json = JSON.parse(text);

      // Ensure we return a consistent structure for the frontend
      return { daily_analysis: Array.isArray(json) ? json : [json] };

    } catch (e) {
      console.error("Upload Timing Analysis Failed", e);
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

  static async analyzeViralMetadata(trends) {
    if (!API_KEY) return null;

    // Extract 20 videos for pattern matching
    const inputs = trends.slice(0, 20).map(t => ({
      title: t.title,
      desc_snippet: t.description?.substring(0, 200) || "",
      views: t.views,
      viral_ratio: t.viral_ratio
    }));

    const systemPrompt = `
        You are a YouTube SEO & Viral Packaging Expert.
        
        TASK:
        Analyze the top 20 trending videos provided to extract:
        1. The highly effective, recurring 'Power Hashtags'.
        2. A "Fill-in-the-Blank" high-converting Description Template.

        INPUT DATA:
        ${JSON.stringify(inputs)}

        OUTPUT (STRICT JSON):
        {
            "top_hashtags": [
                { "tag": "#example", "relevance": "High", "volume": "Massive" }
            ],
            "niche_tags": ["#specific", "#niche"],
            "description_template": {
                "structure": ["Hook Line", "Value Stack", "CTA", "Links"],
                "template_text": "STOP [Action]... In this video, I will show you [Benefit].\n\nTimestamps:\n0:00 Intro\n..."
            },
            "title_patterns": ["Why X is Y", "Stop Doing Z"]
        }
      `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Viral Metadata Analysis Failed", e);
      return null;
    }
  }

  static async performChannelAudit(stats, videos, webInsights) {
    if (!API_KEY) return { error: "Gemini Key Missing" };

    // Prepare data for AI (limit to conserve tokens)
    const recentData = videos.slice(0, 15).map(v => ({
      title: v.title,
      views: v.views,
      velocity: v.view_velocity,
      upload_hour: new Date(v.published_at).getHours(),
      likes: v.likes
    }));

    const systemPrompt = `
      You are a Brutal but Constructive YouTube Channel Auditor.
      
      INPUT DATA:
      - Channel Stats: ${JSON.stringify(stats)}
      - Web Trends/Insights (Context): ${JSON.stringify(webInsights)}
      - Recent Video Performance: ${JSON.stringify(recentData)}

      YOUR GOAL:
      Analyze existing performance and find the "Viral Gap" - what is missing?
      
      TASK 1: VELOCITY CHECK
      - Are views trending up or down?
      - Which video had the highest velocity and why?

      TASK 2: TIMING AUDIT
      - Compare the user's upload times to the "Web Trends" best times.
      - If they differ, recommend a shift.

      TASK 3: WEEKLY VIRAL SCHEDULE
      - Based on the "Recent Video Performance" (specifically when their high-velocity videos were posted) and general niche trends, create a 7-day schedule.
      - For EACH day (Monday-Sunday), provide the single BEST time to post.
      - DO NOT just say "18:00" for all. Look at their data. If they got 100k views on a Tuesday at 10AM, suggest 10AM for Tuesday.

      TASK 4: SEARCH-BASED SUGGESTIONS
      - Use the provided 'Web Trends' to suggest 3 specific video topics that are rising RIGHT NOW in this niche.

      OUTPUT (STRICT JSON):
      {
        "audit_summary": "Your growth is [Status]...",
        "velocity_analysis": {
            "trend": "Up/Down",
            "best_performer": "Title of best video",
            "why_it_won": "Reason..."
        },
        "timing_analysis": {
          "current_avg_upload_time": "HH:MM",
          "recommended_upload_time": "HH:MM",
          "reason": "Based on ...",
          "weekly_schedule": {
              "Monday": "HH:MM",
              "Tuesday": "HH:MM",
              "Wednesday": "HH:MM",
              "Thursday": "HH:MM",
              "Friday": "HH:MM",
              "Saturday": "HH:MM",
              "Sunday": "HH:MM"
          }
        },
        "missed_opportunities": [
            { "topic": "...", "why_viral": "..." }
        ],
        "action_plan": "Step-by-step plan for next video..."
      }
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Channel Audit Failed", e);
      return null;
    }
  }

  static async optimizeVideoUpload(videoContext, trendContext) {
    if (!API_KEY) return null;

    const systemPrompt = `
      You are a Viral Packaging AI Agent.
      
      TASK:
      Optimize a new video upload to maximize CTR (Click Through Rate) and AVD (Average View Duration).
      
      VIDEO CONTEXT:
      - Topic: "${videoContext.topic}"
      - Filename: "${videoContext.filename}"
      - User Goal: Viral Reach
      
      MARKET CONTEXT (Real-time Trends):
      ${JSON.stringify(trendContext)}

      OUTPUT (STRICT JSON):
      {
        "title_options": [
          { "title": "Clickbait / Shocking", "score": 95, "style": "Shock" },
          { "title": "Story / Intrigue", "score": 90, "style": "Curiosity" },
          { "title": "Benefit / Value", "score": 85, "style": "Utility" }
        ],
        "description_blueprint": {
            "hook_first_line": "...",
            "content_summary": "In this video, I [Action]... (Write a compelling 3-4 sentence summary of what happens in the video based on the Topic, as if you watched it. Make it exciting.)",
            "keywords_to_include": ["..."],
            "hashtags": ["#..."]
        },
        "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
        "upload_strategy": {
            "best_time_today": "HH:MM (based on market context)",
            "community_post_teaser": "Text for a community post to hype this..."
        },
        "thumbnail_text_ideas": ["Idea 1", "Idea 2"]
      }
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Upload Optimization Failed", e);
      return null;
    }
  static async generateLaunchStrategy(userContext) {
    if (!API_KEY) return null;

    const systemPrompt = `
      You are a specialized "Zero-to-One" YouTube Launch Strategist.
      
      USER CONTEXT:
      - Preferred Format: ${userContext.format} (Shorts vs Long vs Hybrid)
      - Interests/Skills: ${userContext.interests}
      - Goal: ${userContext.goal || "Growth"}

      TASK:
      1. Identify the SINGLE best "Winning Niche" for this user. Be specific (e.g. "Faceless True Crime Shorts" not just "History").
      2. Explain WHY it works for them.
      3. Create a 4-Phase Roadmap (Weeks 1-4).
      4. Generate 5 "Day 1" video ideas that are low-effort but high-viral potential.

      OUTPUT (STRICT JSON):
      {
        "recommended_niche": "Name of Niche",
        "why_it_works": "Reasoning...",
        "roadmap": [
             { "phase": "Week 1", "action": "focus on x..." },
             { "phase": "Week 2", "action": "..." },
             { "phase": "Week 3", "action": "..." },
             { "phase": "Week 4", "action": "..." }
        ],
        "first_5_video_ideas": [
            { "title": "...", "concept": "..." }
        ]
      }
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Launch Strategy Failed", e);
      return null;
    }
  }

}
