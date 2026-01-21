"use server";

import { GeminiBrain } from "@/lib/brain/GeminiBrain";
import { YouTubeService } from "@/lib/api/youtube";
import { cookies } from "next/headers";
// Ideally we import a real search tool here.
// Since we don't have one configured in the codebase yet, we will rely on Gemini to "Simulate" the search 
// OR we will impl a basic fetch if possible, but for now we remove the hardcoded strings 
// and ask the AI to generate the context based on its training data if real search isn't available.

export async function runChannelAuditAction() {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) return { error: "No YouTube Connection" };

    try {
        // 1. Fetch Real Channel Data
        const stats = await YouTubeService.getChannelStatistics(token);
        // Fetch *my* videos using the new specific method
        let videos = await YouTubeService.getChannelVideos(token);

        // Filter to ensure reliability (though getChannelVideos handles it)
        if (!videos || videos.length === 0) {
            console.warn("No videos found for channel. Audit might be limited.");
        }

        // 2. Dynamic "Web Context" Generation (No Hardcoding)
        // If we had a SERP API, we would call: const webInsights = await searchWeb(`latest youtube trends for ${stats.title}`);
        // Instead of hardcoding, we will pass a flag to Gemini to "use internal knowledge" or specific queries.
        const webInsights = {
            note: "Real-time search unavailable. Using AI Internal Knowledge for trends.",
            query_context: `Latest viral trends for channel niche: ${stats.title || "General"}`,
            timestamp: new Date().toISOString()
        };

        // 3. AI Analysis
        const audit = await GeminiBrain.performChannelAudit(stats, videos, webInsights);

        return {
            stats,
            audit
        };

    } catch (e) {
        console.error("Audit Action Failed", e);
        return { error: e.message };
    }
}

import fs from "fs/promises";
import path from "path";
import os from "os";

export async function optimizeUploadAction(formData) {
    const topic = formData.get("topic");
    const file = formData.get("file"); // Expecting a File object
    const filename = formData.get("filename") || file?.name || "untitled.mp4";

    if (!topic && !file) return { error: "Topic or File required" };

    let tempFilePath = null;

    try {
        // 1. Handle File (if present)
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const tempDir = os.tmpdir();
            tempFilePath = path.join(tempDir, `upload-${Date.now()}-${filename.replace(/[^a-z0-9.]/gi, '_')}`);
            await fs.writeFile(tempFilePath, buffer);
            console.log("Agent: Temp video saved to", tempFilePath);
        }

        // 2. Dynamic Trend Context
        const trendContext = {
            user_topic: topic || "Analyzed from video",
            request: "Identify current viral formats relevant to this topic dynamically.",
            timestamp: new Date().toISOString()
        };

        // 3. AI Optimization
        const optimizedData = await GeminiBrain.optimizeVideoUpload({
            topic: topic || "Infer from video",
            filename,
            filePath: tempFilePath // Pass the temp path
        }, trendContext);

        return optimizedData;

    } catch (e) {
        console.error("Optimization Action Failed", e);
        return { error: "Failed to process video: " + e.message };
    } finally {
        // 4. Cleanup
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath);
                console.log("Agent: Temp video deleted.");
            } catch (cleanupErr) {
                console.warn("Agent: Failed to delete temp file", cleanupErr);
            }
        }
    }
}
