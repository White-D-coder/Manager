import { GeminiBrain } from "./GeminiBrain";
import { YouTubeService } from "../api/youtube";
import { MemorySystem } from "./MemorySystem";
import { VideoRenderer } from "./VideoRenderer";

export class ViralManager {
    static config = {
        genre: "SillyMee Style",
        region: "IN",
        timezone: "IST"
    };

    /**
     * PHASE 0: FACELESS NICHE DISCOVERY (Dynamic)
     * Scans multiple niches to find the one with highest current velocity.
     */
    static async identifyWinningNiche(accessToken) {
        console.log("ViralManager: Phase 0 - Generating Dynamic Niche Candidates...");

        // 1. Ask Gemini for FRESH Trend Ideas (No hardcoding)
        const facelessNiches = await GeminiBrain.generateTrendIdeas();
        console.log("ViralManager: AI Suggested Candidates ->", facelessNiches);

        let bestNiche = "SillyMee Style"; // Default
        let maxVelocity = 0;

        // 2. Scan Youtube for Real Data Validation
        const results = [];

        for (const niche of facelessNiches) {
            try {
                // Quick scan: Top 5 videos only
                const trends = await YouTubeService.searchVideos(niche, accessToken);
                if (trends && trends.length > 0) {
                    // Calculate Avg Velocity of top 3
                    const top3 = trends.slice(0, 3);
                    const avgVel = top3.reduce((sum, t) => sum + (t.view_velocity || 0), 0) / top3.length;

                    results.push({ niche, velocity: avgVel });
                    console.log(`   > Analyzed '${niche}': ${Math.round(avgVel)} views/hr`);
                }
            } catch (e) {
                console.warn(`   > Failed to scan '${niche}'`);
            }
        }

        // Find Winner
        if (results.length > 0) {
            results.sort((a, b) => b.velocity - a.velocity);
            bestNiche = results[0].niche;
            maxVelocity = results[0].velocity;
        }

        console.log(`ViralManager: Winning Niche Detected -> '${bestNiche}' (Vel: ${Math.round(maxVelocity)}/hr)`);
        return bestNiche;
    }

    /**
     * PHASE 1-3: INTELLIGENCE & STRATEGY
     * Runs the daily research loop.
     */
    static async runDailyIntelligence(accessToken) {
        console.log("ViralManager: Starting Phase 1 (Intelligence)...");

        // 0. Niche Discovery
        const winningNiche = await this.identifyWinningNiche(accessToken);
        this.config.genre = winningNiche; // Dynamically update config

        // 1. Fetch Trends
        const trends = await YouTubeService.searchVideos(this.config.genre, accessToken);
        if (!trends || trends.length === 0) throw new Error("No trends found.");

        // 2. Engagement & Retention Proxy Calculation
        const scoredTrends = trends.map(t => {
            const retentionScore = (t.like_ratio * 0.4) + (t.comment_ratio * 0.4) + (t.view_velocity / 1000 * 0.2); // Normalized
            return { ...t, retention_proxy: retentionScore };
        });

        // 3. Analyze Metadata & Timing
        const [packaging, timing] = await Promise.all([
            GeminiBrain.analyzeViralMetadata(scoredTrends),
            GeminiBrain.analyzeUploadTiming(scoredTrends)
        ]);

        console.log(`ViralManager: Intelligence Complete. Next Peak: ${timing?.next_hot_window?.time}`);

        return {
            trends: scoredTrends,
            packaging,
            timing,
            suggested_niche: winningNiche
        };
    }

    /**
     * PHASE 4-6: CREATION
     * Plans and Generates the Content.
     */
    static async generateDailyContent(intelligenceData) {
        console.log("ViralManager: Starting Phase 4 (Creation)...");

        // 4. Fatigue Check
        // We want to avoid using the same emotion if it was used recently
        const recentEmotion = MemorySystem.state.uploads[MemorySystem.state.uploads.length - 1]?.script_meta?.emotion;
        const fatigue = MemorySystem.checkFatigue('emotion', recentEmotion);

        // 5. Format Decision & Prompt Engineering
        const targetTime = intelligenceData.timing?.recommendation?.action || "18:00";
        const topTopic = intelligenceData.trends[0]; // Use top trend as seed

        const config = {
            risk_profile: 'low',
            voice_tone: 'SillyMee Authentic',
            avoid_emotion: fatigue ? recentEmotion : null // Force variation
        };

        // 6. Generate Script (SillyMee Persona)
        const script = await GeminiBrain.generateScript(topTopic, config, "Authentic");

        if (!script) throw new Error("Script generation failed.");

        console.log(`ViralManager: Script Generated: "${script.title}"`);
        return { script, targetTime };
    }

    /**
     * PHASE 7-8: SAFETY & EXECUTION
     */
    static async executeUploadCycle(contentPacket, accessToken) {
        console.log("ViralManager: Starting Phase 7 (Execution)...");
        const { script, targetTime } = contentPacket;

        // 7. Safety Gate (Simple heuristic for MVP)
        if (script.title.toLowerCase().includes("banned_word")) {
            console.warn("ViralManager: SAFETY BLOCK. Content rejected.");
            return false;
        }

        // 8. Auto Upload (Simulation)
        // We calculate delay until target time
        // For MVP, we just run it immediate or with slight delay

        const metadata = {
            title: script.title,
            description: "Generated by SillyMee AI.\n\n" + (script.meta?.concept || ""),
            tags: ["#SillyMee", "#Shorts", ...(script.meta?.hashtags || [])]
        };

        const uploadResult = await YouTubeService.uploadVideo("mock_asset", metadata, accessToken);

        // 9. Record Memory
        MemorySystem.recordUpload({
            id: uploadResult.id,
            title: script.title,
            meta: script.meta
        });

        console.log("ViralManager: CYCLE COMPLETE. Video Uploaded.");
        return uploadResult;
    }

    /**
     * MASTER LOOP
     * The main entry point for the autonomous agent.
     */
    static async runFullCycle(accessToken) {
        try {
            const intelligence = await this.runDailyIntelligence(accessToken);
            const content = await this.generateDailyContent(intelligence);
            const result = await this.executeUploadCycle(content, accessToken);
            return { success: true, result };
        } catch (e) {
            console.error("ViralManager: CYCLE FAILED", e);
            return { success: false, error: e.message };
        }
    }
}
