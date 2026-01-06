
import dotenv from 'dotenv';
import { GeminiBrain } from '../lib/brain/GeminiBrain.js';

dotenv.config({ path: '.env.local' });

const mockVideos = [
    {
        title: "How I Built a SAAS in 2 Days",
        duration_iso: "PT10M",
        view_velocity: 500,
        published_at: new Date(Date.now() - 86400000).toISOString(),
        creator_size: "Small",
        like_ratio: 0.05,
        comment_ratio: 0.01
    },
    {
        title: "Stop Using Next.js (Use This Instead)",
        duration_iso: "PT8M",
        view_velocity: 1200,
        published_at: new Date(Date.now() - 172800000).toISOString(),
        creator_size: "Medium",
        like_ratio: 0.08,
        comment_ratio: 0.02
    },
    {
        title: "AI Agent Tutorial 2024",
        duration_iso: "PT15M",
        view_velocity: 200,
        published_at: new Date(Date.now() - 432000000).toISOString(),
        creator_size: "Large",
        like_ratio: 0.03,
        comment_ratio: 0.005
    }
];

async function runTest() {
    console.log("Running Viral Analysis Test...");
    try {
        const result = await GeminiBrain.performViralAnalysis(mockVideos, "Coding/Tech", "YouTube");
        console.log("--- RESULT ---");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

runTest();
