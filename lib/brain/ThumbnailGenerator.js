export class ThumbnailGenerator {

    static generateVariants(script) {
        const baseId = Math.random().toString(36).substr(2, 5);

        const variants = [
            {
                id: `thumb_${baseId}_A`,
                script_id: script.id,
                style: 'emotional',
                prompt: `Close up of human face looking shocked, holding a phone with red chart, title: "${script.title}"`,
                predicted_ctr: 0.12 + (Math.random() * 0.05) // 12-17% CTR
            },
            {
                id: `thumb_${baseId}_B`,
                script_id: script.id,
                style: 'text-heavy',
                prompt: `Solid black background, huge neon green text saying "STOP DOING THIS", arrow pointing down`,
                predicted_ctr: 0.08 + (Math.random() * 0.04) // 8-12% CTR
            },
            {
                id: `thumb_${baseId}_C`,
                script_id: script.id,
                style: 'minimal',
                prompt: `Clean product shot of the interface, white background, single word: "BROKEN"`,
                predicted_ctr: 0.05 + (Math.random() * 0.10) // 5-15% (High variance)
            }
        ];

        return variants.sort((a, b) => b.predicted_ctr - a.predicted_ctr);
    }
}
