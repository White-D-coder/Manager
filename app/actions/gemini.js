"use server";

import { GeminiBrain } from "@/lib/brain/GeminiBrain";

export async function analyzeWithGemini(trends) {
    return await GeminiBrain.analyzeTrends(trends);
}

export async function generateScriptWithGemini(trend, config, tone) {
    return await GeminiBrain.generateScript(trend, config, tone);
}
