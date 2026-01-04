/**
 * MODULE B: ENGAGEMENT SCORING MODEL
 * 
 * Purpose: Rank videos not just by views, but by *velocity* and *engagement density*.
 * This identifies "rising stars" rather than just "old giants".
 */

export class EngagementScorer {

    // Default weights for the scoring model
    static WEIGHTS = {
        VELOCITY: 0.4,      // How fast is it growing? (Critical for trends)
        LIKE_RATIO: 0.3,    // Do people love it?
        COMMENT_RATIO: 0.2, // Does it spark discussion?
        RECENCY: 0.1        // Is it fresh?
    };

    /**
     * Analyzes and ranks a list of videos.
     * @param {Array} videos - List of video objects from YouTube API
     * @returns {Array} - List of videos sorted by 'engagement_score' (descending)
     */
    static rank(videos) {
        if (!videos || videos.length === 0) return [];

        // 1. Normalize data for fair comparison
        // We need to find max values to scale everything 0-1
        const maxVelocity = Math.max(...videos.map(v => v.view_velocity)) || 1;
        const maxLikeRatio = Math.max(...videos.map(v => v.like_ratio)) || 0.01;
        const maxCommentRatio = Math.max(...videos.map(v => v.comment_ratio)) || 0.001;

        const scoredVideos = videos.map(video => {
            // Normalize inputs (0 to 1 scale)
            const normVelocity = video.view_velocity / maxVelocity;
            const normLike = video.like_ratio / maxLikeRatio;
            const normComment = video.comment_ratio / maxCommentRatio;

            // Recency Boost: 1.0 for new, decreases for older
            // Simple decay: 1 / (days_old + 1)
            const now = new Date();
            const daysOld = (now - new Date(video.published_at)) / (1000 * 60 * 60 * 24);
            const normRecency = 1 / (Math.max(0, daysOld) + 1);

            // Calculate Final Score (E)
            const score = (
                (normVelocity * this.WEIGHTS.VELOCITY) +
                (normLike * this.WEIGHTS.LIKE_RATIO) +
                (normComment * this.WEIGHTS.COMMENT_RATIO) +
                (normRecency * this.WEIGHTS.RECENCY)
            ) * 100; // Scale to 0-100 for readability

            return {
                ...video,
                // Add the specific "Feature DNA" metrics we need for Module D later
                dna: {
                    velocity_score: normVelocity,
                    engagement_quality: (normLike + normComment) / 2,
                    raw_score: score
                },
                engagement_score: parseFloat(score.toFixed(2))
            };
        });

        // Return sorted descending
        return scoredVideos.sort((a, b) => b.engagement_score - a.engagement_score);
    }
}
