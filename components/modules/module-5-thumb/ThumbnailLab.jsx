"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { ThumbnailGenerator } from "@/lib/brain/ThumbnailGenerator";
import { motion } from "framer-motion";
import { Image as ImageIcon, BarChart, CheckCircle } from "lucide-react";
import clsx from "clsx";

export default function ThumbnailLab() {
    const { generatedScript, setModule, addLog } = useAppStore();
    const [variants, setVariants] = useState([]);
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        if (!generatedScript) return;

        // Generate
        const generated = ThumbnailGenerator.generateVariants(generatedScript);
        setVariants(generated);
        addLog({ module: 'ThumbEngine', level: 'info', message: 'Generated 3 psych-validated concepts.' });

        // Simulate "Predicting"
        setTimeout(() => {
            setComplete(true);
            addLog({ module: 'ThumbEngine', level: 'success', message: `Winner identified: Style ${generated[0].style.toUpperCase()} (CTR: ${(generated[0].predicted_ctr * 100).toFixed(1)}%)` });

            // Auto advance to Final Phase
            setTimeout(() => {
                addLog({ module: 'System', level: 'info', message: 'Entering Final Deployment Phase (Modules 6-9)...' });
                setModule(6);
            }, 4000);
        }, 3000);

    }, [generatedScript]);

    if (variants.length === 0) return null;

    return (
        <div className="h-full flex flex-col p-6 gap-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="flex items-center gap-2 text-pink-500 font-mono text-xl">
                    <ImageIcon className="w-6 h-6 animate-pulse-slow" />
                    THUMBNAIL_LAB // A/B PREDICTION
                </h3>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {variants.map((v, i) => {
                    const isWinner = complete && i === 0;
                    return (
                        <motion.div
                            key={v.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: complete && !isWinner ? 0.3 : 1, scale: complete && isWinner ? 1.05 : 1 }}
                            className={clsx(
                                "aspect-[9/16] rounded-lg border-2 relative overflow-hidden flex flex-col",
                                isWinner ? "border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]" : "border-border bg-black"
                            )}
                        >
                            {/* Visual Placeholder */}
                            <div className={clsx(
                                "flex-1 flex items-center justify-center p-4 text-center font-bold text-lg",
                                v.style === 'emotional' && "bg-gradient-to-br from-red-900 to-black text-white",
                                v.style === 'text-heavy' && "bg-black text-green-400 font-black text-2xl uppercase",
                                v.style === 'minimal' && "bg-zinc-100 text-zinc-900"
                            )}>
                                {v.style === 'text-heavy' ? "STOP DOING THIS" : `[${v.style.toUpperCase()} VISUAL]`}
                            </div>

                            {/* Prediction Overlay */}
                            <div className="h-24 bg-surface border-t border-border p-3 space-y-2">
                                <div className="flex justify-between items-center text-[10px] uppercase text-zinc-500 font-mono">
                                    <span>Style: {v.style}</span>
                                    <BarChart className="w-3 h-3" />
                                </div>

                                {!complete ? (
                                    <div className="text-center text-xs font-mono animate-pulse text-zinc-400 mt-4">
                                        CALCULATING CTR...
                                    </div>
                                ) : (
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-[10px] text-zinc-500">PREDICTED CTR</div>
                                            <div className={clsx("text-xl font-mono font-bold", isWinner ? "text-pink-500" : "text-zinc-600")}>
                                                {(v.predicted_ctr * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        {isWinner && <CheckCircle className="w-6 h-6 text-pink-500" />}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
