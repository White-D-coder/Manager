"use server";

import { GeminiBrain } from "@/lib/brain/GeminiBrain";
import { TrendItem, GrowthConfig } from "@/lib/types";

export async function analyzeWithGemini(trends: TrendItem[]) {
    return await GeminiBrain.analyzeTrends(trends);
}

export async function generateScriptWithGemini(trend: string, config: GrowthConfig, tone: string) {
    return await GeminiBrain.generateScript(trend, config, tone);
}
