import { NextResponse } from "next/server";
import { ReplicateService } from "@/lib/api/replicate";

export async function POST(req) {
    try {
        const { prompt, aspectRatio } = await req.json();

        // Delegate to ReplicateService
        const output = await ReplicateService.generateImage({
            prompt,
            aspectRatio: aspectRatio || "16:9"
        });

        // Flux returns an array of streams/URLs usually
        const imageUrl = Array.isArray(output) ? output[0] : output;

        return NextResponse.json({ output: imageUrl });

    } catch (error) {
        console.error("Image generation error:", error);

        let errorMessage = "Failed to generate image";
        if (error.message.includes("API Token")) {
            errorMessage = "Replicate API Token is missing or invalid";
        }

        return NextResponse.json(
            { error: errorMessage, details: error.message },
            { status: 500 }
        );
    }
}
