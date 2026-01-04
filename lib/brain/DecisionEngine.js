export class DecisionEngine {

    static analyzeAndSelect(trends, config) {
        const report = [];

        // 1. Scoring Logic
        const scoredTrends = trends.map(t => {
            // Avoid division by zero
            const safeCompetition = t.competition_density || 1;

            // Formula: (Volume * Growth * Engagement) / Competition
            // We normalize meaningfulness by dividing by 100 or 1000 typically
            const rawScore = (t.volume * t.growth_rate * (t.engagement_velocity + 1)) / (safeCompetition * 1.5);

            const isRisky = config.risk_profile === 'low' && t.competition_density > 70;
            const finalScore = isRisky ? rawScore * 0.5 : rawScore;

            return { ...t, trend_score: finalScore };
        });

        // 2. Sorting
        scoredTrends.sort((a, b) => b.trend_score - a.trend_score);

        // 3. Generate Report
        scoredTrends.forEach((t, i) => {
            if (i < 3) {
                report.push(`Analyzed "${t.topic}": Score ${t.trend_score.toFixed(1)} - ${t.trend_score > 1000 ? 'HIGH POTENTIAL' : 'MODERATE'}`);
            }
        });

        const winner = scoredTrends[0];
        report.push(`WINNER SELECTED: "${winner.topic}" (Score: ${winner.trend_score.toFixed(1)})`);

        return { winner, report };
    }
}
