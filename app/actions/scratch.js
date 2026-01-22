"use server";

import { GeminiBrain } from "@/lib/brain/GeminiBrain";
import { ViralManager } from "@/lib/brain/ViralManager";
import { cookies } from "next/headers";

export async function generateScratchIdeasAction() {
    return await GeminiBrain.generateTrendIdeas();
}

export async function generateScratchScriptAction(topic) {
    const config = {
        risk_profile: 'medium',
        voice_tone: 'Engaging',
    };
    // Passing string topic is supported by existing GenerateScript
    return await GeminiBrain.generateScript(topic, config, "Engaging");
}

export async function finalizeScratchUploadAction(formData, scriptContext) {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) return { error: "Please log in to YouTube first." };

    const file = formData.get("file");
    if (!file) return { error: "No file provided" };

    // Convert file to ArrayBuffer for uploading (YouTubeService expects Readable or similiar, but we can handle buffer)
    // Actually YouTubeService.uploadVideo expects a stream or buffer. Let's pass the file object directly if node environment supports it,
    // or convert to buffer.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await ViralManager.processUserUpload(buffer, scriptContext, token);
}

export async function getWeeklyScheduleAction() {
    // In a real app we would pass recent trends to be more accurate
    // For now we rely on the Brain's general knowledge + generic trend simulation
    return await GeminiBrain.analyzeWeeklySchedule([]);
}
