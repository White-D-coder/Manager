"use server";

import { StrategyAgent } from "@/lib/brain/StrategyAgent";

export async function generateStrategy(niche) {
    return await StrategyAgent.analyzeNiche(niche);
}
