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

        const dayCounts = {};
        const hourCounts = {};
        let bestViralRatio = 0;
        let bestViralVideo = null;

        trends.forEach(trend => {
            const date = new Date(trend.published_at);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            const hour = date.getHours();

            // Frequency Analysis (When do successful creators upload?)
            dayCounts[day] = (dayCounts[day] || 0) + 1;
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;

            // Deep Research Check (Track the absolute best outlier)
            if (trend.viral_ratio > bestViralRatio) {
                bestViralRatio = trend.viral_ratio;
                bestViralVideo = trend;
            }
        });

        // Find Best Day
        const bestDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);

        // Find Best Hour
        const bestHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);
        const bestHourFormatted = `${bestHour}:00`;

        // Format Reasoning
        const reasoning = `Based on ${trends.length} top videos, the most active upload window is ${bestDay} at ${bestHourFormatted}. The highest viral signal comes from "${bestViralVideo?.channelTitle}" (Ratio: ${bestViralRatio.toFixed(1)}x).`;

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
