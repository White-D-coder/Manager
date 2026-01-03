import { TrendItem, GrowthConfig } from "@/lib/types";

const TOPIC_TEMPLATES: Record<string, string[]> = {
    "tech": [
        "AI Agents vs Humans", "The End of Coding?", "Nvidia's New Chip", "iPhone 17 Leaks",
        "OpenAI's Secret Model", "Web3 is Dead", "Rust vs C++", "10x Developer Myth"
    ],
    "finance": [
        "Crypto Crash Incoming", "Passive Income 2026", "inflation Hedges", "Real Estate vs Stocks",
        "Bitcoin to 100k", "Side Hustles that Work", "Tax Loopholes", "Recession Proofing"
    ],
    "fitness": [
        "5 Min Abs Truth", "Supplements You Don't Need", "Sleep vs Gains", "Carnivore Diet Results",
        "HIIT vs LISS", "Protein Myths", "Squat Depth", "Recovery Hacks"
    ],
    "default": [
        "The Truth About [Niche]", "Stop Doing This in 2026", "Top 5 [Niche] Tools",
        "How to Master [Niche]", "[Niche] Mistakes to Avoid", "Why [Niche] is Hard"
    ]
};

export class DataSimulator {

    static async fetchTrends(config: GrowthConfig): Promise<TrendItem[]> {
        // Simulate network latency
        await new Promise(r => setTimeout(r, 1500));

        const genre = config.initial_genre.toLowerCase();
        const templates = this.getTemplates(genre);

        return templates.map((topic, i) => {
            const volume = Math.floor(Math.random() * 100);
            const growth = Math.floor(Math.random() * 500) - 50; // -50% to +450%

            // Calculate a raw trend score (this will be refined by Module 2)
            // High volume + High growth = High Score
            const score = (volume * 0.4) + (growth * 0.1);

            return {
                id: `trend_${Math.random().toString(36).substr(2, 9)}`,
                topic: topic.replace("[Niche]", config.initial_genre),
                source: Math.random() > 0.5 ? 'twitter' : 'google_trends',
                volume,
                growth_rate: growth,
                engagement_velocity: Math.floor(Math.random() * 50),
                competition_density: Math.floor(Math.random() * 100),
                trend_score: score, // Raw score
                timestamp: new Date().toISOString()
            };
        });
    }

  static async fetchSmartTrends(query: string): Promise<TrendItem[]> {
    await new Promise(r => setTimeout(r, 1000));
    return this.generateSmartTrends(query);
  }

  private static generateSmartTrends(query: string): TrendItem[] {
    const baseTopics = [
      `Why ${query} is broken`,
      `The future of ${query} in 2026`,
      `Stop doing this in ${query}`,
      `Top 5 ${query} tools`,
      `How to master ${query} fast`,
      `${query} vs Competitors`,
      `Hidden ${query} features`,
      `Is ${query} dead?`
    ];
    
    return baseTopics.map(topic => {
      const volume = Math.floor(Math.random() * 90) + 10;
      const growth = Math.floor(Math.random() * 500) - 50; 
      const score = (volume * 0.4) + (growth * 0.1); 

      return {
        id: `trend_${Math.random().toString(36).substr(2, 9)}`,
        topic: topic,
        source: Math.random() > 0.5 ? 'twitter' : 'google_trends',
        volume,
        growth_rate: growth,
        engagement_velocity: Math.floor(Math.random() * 50),
        competition_density: Math.floor(Math.random() * 100),
        trend_score: score,
        timestamp: new Date().toISOString()
      };
    });
  }

    private static getTemplates(genre: string): string[] {
        if (genre.includes("tech") || genre.includes("code") || genre.includes("ai")) return TOPIC_TEMPLATES["tech"];
        if (genre.includes("money") || genre.includes("finance") || genre.includes("invest")) return TOPIC_TEMPLATES["finance"];
        if (genre.includes("gym") || genre.includes("fit") || genre.includes("health")) return TOPIC_TEMPLATES["fitness"];
        return TOPIC_TEMPLATES["default"];
    }
}
