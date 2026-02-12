import { NextResponse } from "next/server";
import { ReplicateService } from "@/lib/api/replicate";

export async function POST(req) {
    try {
        const { prompt, image, modelType } = await req.json();

        // Delegate to the service layer
        const output = await ReplicateService.generateVideo({
            prompt,
            image,
            modelType: modelType || 'FAST'
        });

        // Normalize output (Some models return string, some array)
        const videoUrl = Array.isArray(output) ? output[0] : output;

        return NextResponse.json({ output: videoUrl });

    } catch (error) {
        console.error("Video generation error:", error);

        let errorMessage = "Failed to generate video";
        if (error.message.includes("API Token")) {
            errorMessage = "Replicate API Token is missing or invalid";
        }

        return NextResponse.json(
            { error: errorMessage, details: error.message },
            { status: 500 }
        );
    }
}
