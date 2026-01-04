"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { DecisionEngine } from "@/lib/brain/DecisionEngine";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";
import { analyzeWithGemini } from "@/app/actions/gemini";

export default function DecisionView() {
    const { currentTrends, config, setModule, setSelectedTrend, addLog } = useAppStore();
    const [analyzingIndex, setAnalyzingIndex] = useState(0);
    const [complete, setComplete] = useState(false);
    const [winner, setWinner] = useState(null);

    // Create a scored copy for visualization
    const [scoredTrends, setScoredTrends] = useState([]);

    useEffect(() => {
        if (currentTrends.length === 0) return;

        const runAnalysis = async () => {
            addLog({ module: 'DecisionBrain', level: 'info', message: 'Sending trend vectors to Gemini 1.5 Flash for cultural analysis...' });

            // 1. Local Math Scoring (Baseline)
            const { winner: mathWinner, report: mathReport } = DecisionEngine.analyzeAndSelect(currentTrends, config);

            // Log baseline math analysis
            mathReport.slice(0, 2).forEach(r =>
                addLog({ module: 'DecisionBrain', level: 'info', message: `[Baseline] ${r}` })
            );

            // 2. AI Reasoning (The "True" Brain)
            try {
                // Static import used
                // const { analyzeWithGemini } = await import("@/app/actions/gemini");
                const result = await analyzeWithGemini(currentTrends);

                if (result && result.winnerId) {
                    const aiWinner = currentTrends.find(t => t.id === result.winnerId) || mathWinner;
                    addLog({ module: 'DecisionBrain', level: 'success', message: `Gemini Selected: ${aiWinner.topic}` });
                    addLog({ module: 'DecisionBrain', level: 'info', message: `Reasoning: ${result.reasoning}` });

                    // Override the math winner with the AI winner
                    setTimeout(() => {
                        useAppStore.getState().setSelectedTrend(aiWinner);
                        setWinner(aiWinner);
                        setComplete(true);

                        // Auto-advance
                        setTimeout(() => {
                            addLog({ module: 'System', level: 'info', message: 'Topic Locked. Advancing to Script Brain...' });
                            setModule(3);
                        }, 4000);
                    }, 2000);
                } else {
                    throw new Error("AI Returned Empty");
                }
            } catch (e) {
                console.error("AI Brain Failed", e);
                addLog({ module: 'DecisionBrain', level: 'warning', message: 'AI Connection unstable. Fallback to Algorithm.' });
                setWinner(mathWinner);
                setComplete(true);
                setTimeout(() => setModule(3), 3000);
            }
        };

        runAnalysis();
    }, [currentTrends]);

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="flex items-center gap-2 text-primary font-mono text-xl">
                    <BrainCircuit className="w-6 h-6 animate-pulse-slow" />
                    DECISION_MATRIX // PROCESSING
                </h3>
                <div className="font-mono text-xs text-zinc-500">
                    STRATEGY MODE: <span className="text-white">{config.risk_profile.toUpperCase()}</span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left: The Feed / List */}
                <div className="space-y-4 overflow-hidden relative">
                    <AnimatePresence>
                        {scoredTrends.slice(0, 5).map((trend, i) => {
                            const isCurrent = i === analyzingIndex;
                            const isPast = i < analyzingIndex;
                            const isWinner = complete && trend.id === winner?.id;

                            return (
                                <motion.div
                                    key={trend.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: isPast ? 0.3 : 1 }}
                                    className={clsx(
                                        "p-4 border rounded relative overflow-hidden transition-all duration-300",
                                        isWinner ? "bg-primary/10 border-primary" : "bg-surface border-border",
                                        isCurrent && !complete && "border-white bg-surface-highlight transform scale-105 z-10 shadow-lg"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm md:text-base">{trend.topic}</span>
                                        {isCurrent && !complete && <span className="text-xs font-mono animate-pulse">CALCULATING ROI...</span>}
                                        {isPast && !isWinner && <XCircle className="w-4 h-4 text-zinc-600" />}
                                        {isWinner && <CheckCircle className="w-5 h-5 text-primary" />}
                                    </div>

                                    {/* Progress Bar for Score (Visual only) */}
                                    <div className="mt-2 h-1 bg-black rounded-full overflow-hidden">
                                        <motion.div
                                            className={clsx("h-full", isWinner ? "bg-primary" : "bg-zinc-600")}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(trend.trend_score / 100, 100)}%` }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Right: The Detail / Winner View */}
                <div className="flex flex-col justify-center">
                    {complete && winner ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-8 border-2 border-primary bg-surface/80 rounded-lg text-center space-y-6 shadow-[0_0_50px_rgba(0,255,157,0.1)] relative"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4 text-primary font-mono text-xs tracking-widest border border-primary">
                                OPTIMAL SELECTION
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{winner.topic}</h2>
                                <div className="flex justify-center gap-4 text-xs font-mono text-zinc-400">
                                    <span>VOL: {winner.volume}</span>
                                    <span>VELOCITY: {winner.engagement_velocity}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-left p-4 bg-black/30 rounded border border-white/5">
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Trend Score</div>
                                    <div className="text-2xl font-mono text-primary">{winner.trend_score.toFixed(0)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Growth Potential</div>
                                    <div className="text-2xl font-mono text-secondary">High</div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded opacity-50">
                            <div className="text-center font-mono text-xs text-zinc-500">
                                AWAITING DECISION...
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
