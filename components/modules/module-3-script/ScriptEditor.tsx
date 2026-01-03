"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { ScriptGenerator } from "@/lib/brain/ScriptGenerator";
import { GeneratedScript } from "@/lib/types";
import { motion } from "framer-motion";
import { FileText, AlertTriangle, Check, Mic } from "lucide-react";
import clsx from "clsx";

export default function ScriptEditor() {
    const { selectedTrend, config, setModule, setScript, addLog } = useAppStore();
    const [script, setLocalScript] = useState<GeneratedScript | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [stage, setStage] = useState<'generating' | 'validating' | 'approved' | 'error'>('generating');
    const [selectedTone, setSelectedTone] = useState<string>("Educational");

    const generate = async (tone: string) => {
        if (!selectedTrend) return;
        setStage('generating');
        setLocalScript(null);

        addLog({ module: 'ScriptBrain', level: 'info', message: `Consulting Gemini 1.5 Flash [Tone: ${tone}]...` });

        try {
            // 1. Try AI Generation
            const { generateScriptWithGemini } = await import("@/app/actions/gemini");
            const aiResult = await generateScriptWithGemini(selectedTrend.topic, config, tone);

            if (aiResult && aiResult.sections) {
                addLog({ module: 'ScriptBrain', level: 'success', message: 'Gemini generated unique viral structure.' });

                const newScript: GeneratedScript = {
                    id: Math.random().toString(36).substr(2, 9),
                    trend_id: selectedTrend.id,
                    title: `${selectedTrend.topic} (AI Version)`,
                    sections: aiResult.sections.map((s: any, i: number) => ({
                        id: i.toString(),
                        type: s.type,
                        text: s.text,
                        visual_cue: s.visual,
                        duration_ms: 3000 // default
                    })),
                    total_duration_ms: 15000,
                    tone: tone,
                    target_platform: 'reels',
                    created_at: new Date().toISOString()
                };

                setLocalScript(newScript);
                setScript(newScript);
                setStage('validating');
                verifyScript(newScript);
                return;
            }
        } catch (e) {
            console.error("AI Script Gen Failed", e);
            addLog({ module: 'ScriptBrain', level: 'error', message: 'Gemini Connection Failed.' });
            setStage('error'); // Start showing error UI
        }
    };

    const verifyScript = (s: GeneratedScript) => {
        setTimeout(() => {
            const errors = ScriptGenerator.validate(s);
            setValidationErrors(errors);
            if (errors.length === 0) {
                setStage('approved');
                addLog({ module: 'ScriptBrain', level: 'success', message: 'Script verified.' });
            } else {
                setStage('approved');
            }
        }, 1000);
    };
    useEffect(() => {
        generate(selectedTone);
    }, [selectedTrend]); // Run on first load

    const handleApprove = () => {
        addLog({ module: 'System', level: 'info', message: "Script Approved. Initializing Video Core..." });
        setModule(4);
    }

    if (stage === 'error') return (
        <div className="h-full flex flex-col items-center justify-center text-destructive font-mono space-y-4">
            <AlertTriangle className="w-12 h-12" />
            <p>AI SIGNAL LOST. UNABLE TO GENERATE SCRIPT.</p>
            <button
                onClick={() => generate(selectedTone)}
                className="px-4 py-2 bg-destructive/10 border border-destructive rounded hover:bg-destructive/20 transition-colors"
            >
                RETRY CONNECTION
            </button>
        </div>
    );

    if (!script) return (
        <div className="h-full flex items-center justify-center text-accent animate-pulse font-mono">
            WRITING NEURAL DRAFT...
        </div>
    );

    return (
        <div className="h-full flex flex-col p-6 gap-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="flex items-center gap-2 text-accent font-mono text-xl">
                    <FileText className="w-6 h-6" />
                    SCRIPT_ENGINE // {stage.toUpperCase()}
                </h3>
                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex bg-black rounded p-1 border border-zinc-800">
                        {['Educational', 'Aggressive'].map(t => (
                            <button
                                key={t}
                                onClick={() => { setSelectedTone(t); generate(t); }}
                                className={clsx(
                                    "px-3 py-1 rounded transition-colors",
                                    selectedTone === t ? "bg-accent/20 text-accent" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {stage === 'approved' && (
                        <button
                            onClick={handleApprove}
                            className="flex items-center gap-2 bg-success/10 text-success border border-success/30 px-3 py-1 rounded hover:bg-success/20 transition-colors"
                        >
                            <Check className="w-3 h-3" /> APPROVE & RENDER
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-surface border border-border rounded-lg p-6 overflow-y-auto space-y-6 font-mono relative">
                {/* Paper Texture overlay if desired, keeping it clean for now */}

                {script.sections.map((section, i) => (
                    <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.5 }}
                        className="border-l-2 border-accent/20 pl-4 py-2 hover:border-accent transition-colors"
                    >
                        <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                            <span>{section.type}</span>
                            <span>{(section.duration_ms / 1000).toFixed(1)}s</span>
                        </div>
                        <div className="text-lg text-white font-medium leading-relaxed">
                            {section.text}
                        </div>
                        <div className="text-xs text-secondary mt-2 italic opacity-60">
                            [Visual: {section.visual_cue}]
                        </div>
                    </motion.div>
                ))}
            </div>

            {validationErrors.length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded flex items-center gap-4 text-destructive text-sm font-mono">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                        <div className="font-bold">OPTIMIZATION REQUIRED</div>
                        {validationErrors.map((e, i) => <div key={i}>{e}</div>)}
                    </div>
                </div>
            )}
        </div>
    );
}
