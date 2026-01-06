/**
 * MODULE G: UPLOAD TIME OPTIMIZER
 * 
 * Purpose: Analytical Engine that determines the best time to upload
 * by analyzing when the "Winning Videos" were published.
 */

export class UploadOptimizer {

    /**
     * Analyzes trends to find the optimal upload window.
     * @param {Array} trends - List of videos from YouTubeService
     * @returns {Object} - { bestDay, bestHour, reasoning }
     */
    static analyze(trends) {
        if (!trends || trends.length === 0) return null;

        const dayScores = {};
        const hourScores = {};
        let bestViralRatio = 0;
        let bestViralVideo = null;

        trends.forEach(trend => {
            const date = new Date(trend.published_at);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            const hour = date.getHours();

            // ALGORITHM v2: Weighted Velocity
            // Instead of just counting "1 upload", we count the *Impact* of that upload.
            // Impact = View Velocity (views per hour).
            // This tells us when the AUDIENCE is consuming, not just when creators are uploading.

            const impactScore = trend.view_velocity || 0;

            dayScores[day] = (dayScores[day] || 0) + impactScore;
            hourScores[hour] = (hourScores[hour] || 0) + impactScore;

            // Deep Research Check (Track the absolute best outlier)
            if (trend.viral_ratio > bestViralRatio) {
                bestViralRatio = trend.viral_ratio;
                bestViralVideo = trend;
            }
        });

        // Find Best Day (Highest Aggregate Velocity)
        const bestDay = Object.keys(dayScores).reduce((a, b) => dayScores[a] > dayScores[b] ? a : b);

        // Find Best Hour (Highest Aggregate Velocity)
        const bestHour = Object.keys(hourScores).reduce((a, b) => hourScores[a] > hourScores[b] ? a : b);
        const bestHourFormatted = `${bestHour}:00`;

        // Format Reasoning
        const reasoning = `Based on weighted audience activity (velocity sum), the peak consumption window is ${bestDay} at ${bestHourFormatted}.`;

        // Evidence for User Verification
        const evidence = trends.slice(0, 5).map(t => ({
            title: t.title.substring(0, 20) + "...",
            day: new Date(t.published_at).toLocaleDateString('en-US', { weekday: 'short' }),
            time: new Date(t.published_at).getHours() + ":00"
        }));

        return {
            best_day: bestDay,
            best_hour: parseInt(bestHour),
            best_hour_formatted: bestHourFormatted,
            viral_outlier: bestViralVideo, // The monster opportunity
            reasoning: reasoning,
            source_evidence: evidence
        };
    }
}
