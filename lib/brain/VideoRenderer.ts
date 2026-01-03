import { GeneratedScript, VideoAsset } from "@/lib/types";

export class VideoRenderer {

    static initializeRender(script: GeneratedScript): VideoAsset {
        return {
            id: `vid_${Math.random().toString(36).substr(2, 9)}`,
            script_id: script.id,
            thumbnail_id: '', // To be filled by Module 5
            status: 'rendering',
            render_progress: 0,
            deployed_at: undefined
        };
    }

    // Purely simulating the decision of "Style"
    static determineStyle(script: GeneratedScript): 'stock' | 'animation' | 'mixed' {
        if (script.title.toLowerCase().includes('agent') || script.title.toLowerCase().includes('future')) {
            return 'animation';
        }
        return 'mixed';
    }
}
