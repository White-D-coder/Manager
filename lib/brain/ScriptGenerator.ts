import { TrendItem, GrowthConfig, GeneratedScript, ScriptSection } from "@/lib/types";

export class ScriptGenerator {
    // Legacy Template Generator Removed. 
    // We only serve fresh AI-cooked scripts now.

    static validate(script: GeneratedScript): string[] {
        const errors: string[] = [];
        const forbidden = ["in this video", "hope you like", "today i will", "welcome back"];

        const fullText = script.sections.map(s => s.text.toLowerCase()).join(" ");

        forbidden.forEach(word => {
            if (fullText.includes(word)) {
                errors.push(`Detected filler: "${word}"`);
            }
        });

        return errors;
    }
}

    static validate(script: GeneratedScript): string[] {
    const errors: string[] = [];
    const forbidden = ["in this video", "hope you like", "today i will", "welcome back"];

    const fullText = script.sections.map(s => s.text.toLowerCase()).join(" ");

    forbidden.forEach(word => {
        if (fullText.includes(word)) {
            errors.push(`Detected filler: "${word}"`);
        }
    });

    return errors;
}
}
