import Replicate from "replicate";

export class VideoRenderer {

    /**
     * Generates a video from a prompt (and optional image) using Replicate.
     * @param {string} prompt - The visual description.
     * @param {string|null} image - Base64 image (optional).
     * @returns {Promise<string>} - The URL of the generated video.
     */
    static async renderVideo(prompt, image = null) {
        // 1. Check for CUSTOM SERVER (College Server / Local GPU)
        if (process.env.CUSTOM_VIDEO_SERVER) {
            console.log("VideoRenderer: Using Custom Server ->", process.env.CUSTOM_VIDEO_SERVER);
            try {
                const response = await fetch(`${process.env.CUSTOM_VIDEO_SERVER}/generate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt, image })
                });

                if (!response.ok) throw new Error("Custom Server Error");

                const data = await response.json();
                console.log("VideoRenderer: Custom Server Output ->", data.video_url);
                return data.video_url;
            } catch (e) {
                console.error("Custom Server Failed:", e);
                return null; // Don't fall back silently, explicit fail for custom setup
            }
        }

        // 2. Fallback to Replicate
        if (!process.env.REPLICATE_API_TOKEN) {
            console.error("VideoRenderer: Missing REPLICATE_API_TOKEN and CUSTOM_VIDEO_SERVER");
            return null;
        }

        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        try {
            console.log(`VideoRenderer: Rendering (Replicate) "${prompt.substring(0, 30)}..."`);
            let output;

            // ... (Existing Replicate Logic)
            if (image) {
                output = await replicate.run(
                    "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816f3afc54a3c532506899f4209fa9c6299f3",
                    {
                        input: {
                            cond_aug: 0.02,
                            decoding_t: 7,
                            input_image: image,
                            video_length: "14 frames_with_svd_xt",
                            sizing_strategy: "maintain_aspect_ratio",
                            motion_bucket_id: 127,
                            frames_per_second: 6
                        }
                    }
                );
            } else {
                output = await replicate.run(
                    "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b8470ac99be7afc77462066d7ad48b88d227db0da493",
                    {
                        input: {
                            prompt: prompt,
                            fps: 24,
                            model: "xl",
                            width: 1024,
                            height: 576,
                            batch_size: 1,
                            num_frames: 24,
                            init_weight: 0.5,
                            guidance_scale: 17.5,
                            negative_prompt: "very blue, dust, noisy, washed out, ugly, distorted, broken",
                            remove_watermark: false,
                            num_inference_steps: 50
                        }
                    }
                );
            }

            const videoUrl = Array.isArray(output) ? output[0] : output;
            console.log("VideoRenderer: Render Complete ->", videoUrl);
            return videoUrl;

        } catch (error) {
            console.error("VideoRenderer: Generation Failed", error);
            return null;
        }
    }
}
