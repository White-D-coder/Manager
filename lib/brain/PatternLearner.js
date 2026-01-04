/**
 * MODULE D: PATTERN LEARNING ENGINE
 * 
 * Purpose: Analyzes "winning" videos to extract their DNA.
 * Instead of copying one video, we find the *average successful traits* 
 * (Duration, Keywords, Pacing).
 */

export class PatternLearner {

    /**
     * Extracts a "Winning Pattern Profile" from the top N videos.
     * @param {Array} topVideos - The highest scoring videos from EngagementScorer
     * @returns {Object} - A profile object describing the winning constraints.
     */
    static extractProfile(topVideos) {
        if (!topVideos || topVideos.length === 0) return null;

        const sampleSize = Math.min(topVideos.length, 5); // Analyze top 5
        const winners = topVideos.slice(0, sampleSize);

        // 1. Calculate Optimal Duration
        // ISO Duration to Seconds (Simplified parser)
        const getSeconds = (iso) => {
            // Very basic parser for PT#M#S
            // For production use a library like iso8601-duration
            const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            const hours = (parseInt(match[1]) || 0);
            const minutes = (parseInt(match[2]) || 0);
            const seconds = (parseInt(match[3]) || 0);
            return (hours * 3600) + (minutes * 60) + seconds;
        };

        const durations = winners.map(v => getSeconds(v.duration_iso));
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        // 2. Keyword Density (DNA) in Titles
        const allTitles = winners.map(v => v.title).join(" ").toLowerCase();
        const words = allTitles.match(/\b\w+\b/g) || [];
        const frequency = {};
        const stopWords = new Set(['the', 'and', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'with', 'video', 'how']);

        words.forEach(w => {
            if (!stopWords.has(w) && w.length > 2) frequency[w] = (frequency[w] || 0) + 1;
        });

        const topKeywords = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);

        // 3. Construct the Profile
        return {
            target_duration_sec: Math.round(avgDuration),
            pacing_style: avgDuration < 60 ? "Fast / Viral Shorts" : "Deep Dive / Longform",
            keywords: topKeywords,
            visual_mood: "High Contrast (Inferred)", // Placeholder for V2 CV
            hook_style: "Direct Question or Shock", // Rule-based assumption for high-velocity items
            reference_videos: winners.map(w => ({ title: w.title, id: w.video_id }))
        };
    }
}
