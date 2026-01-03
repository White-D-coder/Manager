"use server";

import { StrategyAgent, StrategyProfile } from "@/lib/brain/StrategyAgent";

export async function generateStrategy(niche: string): Promise<StrategyProfile> {
    return await StrategyAgent.analyzeNiche(niche);
}
