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
          { type: "hook", text: "I honestly didn't think this would work...", visual: "Close up, looking exhausted but relieved" },
          { type: "value", text: `But then it clicked. The real secret to ${typeof trendData === 'string' ? trendData : trendData.topic} isn't what they tell you.`, visual: "Montage of failing then succeeding" },
          { type: "cta", text: "It changes everything. Try it.", visual: "Genuine smile, handheld camera" }
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
             { 
               "type": "hook", 
               "audio_voiceover": "...", 
               "visual_prompt": "General visual description...",
               "visual_gen_prompt": "Cinematic, 8k, hyper-realistic, close-up of [Subject], dramatic lighting, moody atmosphere --ar 9:16"
             },
             { 
               "type": "body", 
               "audio_voiceover": "...", 
               "visual_prompt": "...",
               "visual_gen_prompt": "..."
             },
             { 
               "type": "cta", 
               "audio_voiceover": "...", 
               "visual_prompt": "...",
               "visual_gen_prompt": "..."
             }
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
          visual_gen_prompt: s.visual_gen_prompt || `Cinematic shot of ${s.visual_prompt || s.visual}, 8k, photorealistic --ar 9:16`,
          duration_ms: 3000 // Placeholder, could parse time_range later
        }));
      }
      return data;
    } catch (e) {
      console.error("Gemini Script Gen Failed", e);
      return { error: e.message || "Unknown AI Error", rawResult: "Failed" };
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

🧠 TASK 2 — EMOTIONAL & VIRAL PATTERN DECODING
Analyze the collected videos (titles, timing, velocity) and decode the HUMAN element:
- Emotional Hooks (Fear, Aspiration, Validation)
- Why does this connect at a gut level?
- Title formulas that trigger curiosity vs. clickbait.
- Story Pacing (Hero's Journey vs. listicle).

🧠 TASK 3 — TREND MOMENTUM & TIMING
Identify if this genre is Growing, Peaking, or Declining.
Recommend best posting times based on the 'upload_time' of winning videos.

🧠 TASK 4 — DEEP PSYCHOLOGY
Why do they click? What is the *unspoken* pain point?
What identity is the viewer validating by watching this?

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
        Analyze the given YouTube video and explain the DEEP EMOTIONAL CONNECTION it creates.
        Focus on the *feeling*, not just the metrics.

        INPUT:
        - Title: "${video.title}"
        - Description: "${video.description ? video.description.substring(0, 800) : "No description"}..."
        - Metrics: ${Math.round(video.view_velocity || 0)} views/hour, ${video.viral_ratio}x viral ratio
        - Sample Comments: ${JSON.stringify(comments)}
        - Length: ${video.duration_iso}

        OUTPUT (STRICT JSON). DO NOT INCLUDE MARKDOWN BLOCK formatting.

        {
            "engagement_analysis": {
                "core_content_type": "education | storytelling | shock | curiosity | vulnerability",
                "target_audience": "Who this is for (psychographics)...",
                "hook_analysis": {
                    "tactic": "What grabs attention (0-5s)",
                    "emotional_trigger": "The exact feeling triggered (e.g. 'Injustice', 'Awe')"
                },
                "engagement_drivers": {
                    "emotions": ["Fear", "Joy", "Validation", "Loneliness"],
                    "relatability_score": 1-10,
                    "curiosity_gaps": "What burning question does it create?"
                },
                "comment_sentiment": "positive | negative | debate | questions",
                "why_this_works": "The psychological reason this is unskippable"
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

  static async analyzeUploadTiming(trends, uploadsPerDay = 1) {
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
        Predict the BEST UPLOAD WINDOWS for **${targetDay}** (Tomorrow).
        We need to schedule **${uploadsPerDay}** video(s).
        
        CONTEXT:
        Current Time (IST): ${now.toLocaleString()}
        Today is: ${today}
        Target Prediction Day: ${targetDay}

        INPUT DATA (Normalized Engagement Scores from recent trends):
        ${JSON.stringify(inputs)}

        RULES:
        1. Look for patterns in the input data specifically for **${targetDay}s**.
        2. Find the "Peak Engagement Window" (when high velocity videos are published).
        3. **CRITICAL**: The scheduled time MUST be **5 MINUTES BEFORE** the peak wave starts.
           - Example: If peak starts at 18:00, schedule for 17:55.
           - Example: If peak starts at 14:00, schedule for 13:55.
        4. If ${uploadsPerDay} > 1, spread them out to capture different peaks (e.g., Morning Peak & Evening Peak), or space them by at least 4 hours if only one main peak exists.

        OUTPUT (STRICT JSON):
        {
            "analysis_summary": "Short explanation of the peak pattern.",
            "scheduled_videos": [
                {
                    "video_index": 1,
                    "target_peak": "18:00",
                    "scheduled_time_iso": "ISO 8601 String for tomorrow at 17:55 (calculated as Peak - 5mins)",
                     "reason": "5 mins before evening surge"
                }
                ... (repeat for video_index 2 to ${uploadsPerDay})
            ]
        }
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      const json = JSON.parse(text);

      // Backwards compatibility wrapper
      return {
        daily_analysis: Array.isArray(json) ? json : [json],
        schedule: json.scheduled_videos || [],
        // Legacy field fallback (take first slot)
        scheduled_publish_time: json.scheduled_videos?.[0]?.scheduled_time_iso,
        best_time_human: json.scheduled_videos?.[0]?.target_peak || "Evening"
      };

    } catch (e) {
      console.error("Upload Timing Analysis Failed", e);
      // Fallback
      const fallbackSchedule = [];
      for (let i = 0; i < uploadsPerDay; i++) {
        const d = new Date();
        d.setDate(d.getDate() + 1); // Tomorrow
        d.setHours(17 + (i * 3), 50, 0, 0); // 17:50, 20:50, etc.
        fallbackSchedule.push({
          video_index: i + 1,
          target_peak: `${18 + (i * 3)}:00`,
          scheduled_time_iso: d.toISOString(),
          reason: "Fallback Fallback"
        });
      }

      return {
        schedule: fallbackSchedule,
        scheduled_publish_time: fallbackSchedule[0].scheduled_time_iso
      };
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

  static async optimizeVideoUpload(videoContext, trendContext, uploadsPerDay = 1) {
    if (!API_KEY) return null;

    // Use our new timing analyzer (passing empty trends will rely on its internal fallback or mock for now, 
    // but ensures consistency with the "10 min" rule logic we added there).
    // In a full implementation, we'd pass real trends here.
    const timingAnalysis = await this.analyzeUploadTiming([], uploadsPerDay);

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
        "thumbnail_text_ideas": ["Idea 1", "Idea 2"]
      }
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      const data = JSON.parse(text);

      // Inject our 10-minute-before-peak timing
      data.upload_strategy = {
        best_time_today: timingAnalysis?.best_time_human || "6:00 PM",
        scheduled_publish_time: timingAnalysis?.scheduled_publish_time || new Date().toISOString(),
        community_post_teaser: timingAnalysis?.community_post_teaser || "New video incoming!"
      };

      return data;
    } catch (e) {
      console.error("Upload Optimization Failed", e);
      return null;
    }
  }
  static async analyzeWeeklySchedule(insights) {
    if (!API_KEY) return { error: "Key Missing" };

    const systemPrompt = `
      You are a specialized Schedule Optimizer.
      
      INPUT: ${JSON.stringify(insights)}
      
      TASK: Create a 7-day posting schedule optimized for viral growth.
      
      OUTPUT (JSON):
      {
        "schedule": [
          { "day": "Monday", "time": "18:00", "reason": "High traffic" }
        ]
      }
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Schedule Analysis Failed", e);
      return null;
    }
  }

  static async diagnoseVideoHealth(videoData) {
    if (!API_KEY) return { error: "Key Missing" };

    const systemPrompt = `
      You are a YouTube Algorithm Doctor. 
      
      USER COMPLAINT: "My video is not getting views. Why is YouTube not pushing it? Why can't it find my audience?"

      VIDEO DATA:
      - Title: "${videoData.title}"
      - Avg Duration: ${videoData.duration_iso}
      - Views (1st Hour): ${videoData.views_1h || "Unknown (Assume Low)"}
      - CTR: ${videoData.ctr || "Unknown (Assume Average)"}
      - Description Snippet: "${videoData.description?.substring(0, 300) || "Empty"}"

      TASK:
      Analyze the "Viral Signals" failure points.
      1. **Packaging Failure** (CTR): Is the title boring/confusing?
      2. **Retention Failure** (AVD): Does the structure imply a weak hook?
      3. **Audience Signal Failure**: Is the metadata too broad/vague for the algorithm to categorize?

      OUTPUT (JSON):
      {
        "diagnosis_summary": "1-sentence brutal truth.",
        "algorithm_blocks": [
          { "stage": "Impression", "status": "Blocked", "reason": "Reason..." },
          { "stage": "Click", "status": "Weak", "reason": "Reason..." },
          { "stage": "Retention", "status": "Unknown", "reason": "Reason..." }
        ],
        "why_no_audience": "Explanation of metadata/niche mismatch.",
        "fix_plan": ["Step 1", "Step 2"]
      }
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      console.error("Diagnosis Failed", e);
      return { error: "Diagnosis Failed" };
    }
  }
}
