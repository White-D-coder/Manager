import Replicate from "replicate";

export class ReplicateService {
    static client = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
    });

    // Model Registry
    static MODELS = {
        FAST: "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b8470ac99be7afc77462066d7ad48b88d227db0da493",
        QUALITY: "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816f3afc54a3c532506899f4209fa9c6299f3",
        IMAGE: "black-forest-labs/flux-schnell", // Fast, High Quality, Good Text
    };

    static async generateImage({ prompt, aspectRatio = "16:9" }) {
        if (!process.env.REPLICATE_API_TOKEN) throw new Error("Missing Replicate API Token");

        console.log(`[Replicate] Generating Thumbnail (${aspectRatio})...`);

        return await this.client.run(this.MODELS.IMAGE, {
            input: {
                prompt,
                aspect_ratio: aspectRatio, // Flux supports "16:9", "1:1", "9:16" directly
                output_format: "webp",
                output_quality: 90
            }
        });
    }

    static async generateVideo({ prompt, image, modelType = 'FAST' }) {
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error("Missing Replicate API Token");
        }

        try {
            console.log(`[Replicate] Starting generation with ${modelType} model...`);

            let output;

            if (modelType === 'QUALITY' && image) {
                // SVD (Image-to-Video)
                output = await this.client.run(this.MODELS.QUALITY, {
                    input: {
                        cond_aug: 0.02,
                        decoding_t: 7,
                        input_image: image,
                        video_length: "25 frames_with_svd_xt", // Longer context
                        sizing_strategy: "maintain_aspect_ratio",
                        motion_bucket_id: 127,
                        frames_per_second: 6
                    }
                });
            } else {
                // Zeroscope (Text-to-Video) - Fallback for Prompt-only or Fast mode
                output = await this.client.run(this.MODELS.FAST, {
                    input: {
                        prompt: prompt,
                        fps: 24,
                        model: "xl",
                        width: 1024,
                        height: 576,
                        num_frames: 24,
                        guidance_scale: 17.5,
                        negative_prompt: "distorted, low quality, jittery, grainy, watermark, text",
                        remove_watermark: true,
                        num_inference_steps: 50
                    }
                });
            }

            console.log("[Replicate] Generation complete:", output);
            return output;

        } catch (error) {
            console.error("[Replicate] Generation Failed:", error);
            throw error;
        }
    }
}
