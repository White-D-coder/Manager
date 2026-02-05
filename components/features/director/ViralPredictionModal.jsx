"use client";

import { Activity, AlertTriangle, CheckCircle, Flame, Lock, Shield, Sparkles, TrendingUp, X } from "lucide-react";
import clsx from "clsx";

export default function ViralPredictionModal({ result, onClose }) {
    if (!result) return null;

    const { viral_score, prediction_level, reasoning, strengths, weaknesses, missing_ingredients, audience_health } = result;

    const scoreColor = viral_score > 80 ? "text-green-500" : viral_score > 50 ? "text-yellow-500" : "text-red-500";
    const scoreBg = viral_score > 80 ? "bg-green-500/10 border-green-500/20" : viral_score > 50 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-start bg-zinc-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="text-accent w-6 h-6" />
                            Viral Oracle Prediction
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">AI Probability Analysis based on Real-Time Trends</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8">

                    {/* TOP SECTION: SCORE & AUDIENCE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* VIRAL SCORE */}
                        <div className={clsx("col-span-2 p-6 rounded-xl border flex items-center gap-6", scoreBg)}>
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Simple Gauge Replaced by Text for Simplicity/Reliability */}
                                <div className="text-center">
                                    <div className={clsx("text-4xl font-black", scoreColor)}>{viral_score}%</div>
                                    <div className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Viral Odd</div>
                                </div>
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-black/20" />
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className={scoreColor}
                                        strokeDasharray={351} strokeDashoffset={351 - (351 * viral_score) / 100} strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-white font-bold text-lg">
                                    {prediction_level === 'Viral Outbreak' && <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />}
                                    {prediction_level}
                                </div>
                                <p className="text-zinc-300 text-sm italic">"{reasoning}"</p>
                                <div className="pt-2 flex gap-2 flex-wrap">
                                    {strengths?.slice(0, 2).map((s, i) => (
                                        <span key={i} className="text-xs bg-black/20 px-2 py-1 rounded text-zinc-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3 text-green-500" /> {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* AUDIENCE HEALTH */}
                        <div className="bg-surface border border-white/5 rounded-xl p-6 flex flex-col justify-center space-y-4">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Audience Authenticity
                            </h3>

                            <div className="text-center">
                                <div className={clsx("text-2xl font-bold", audience_health.level.includes("Bot") ? "text-red-500" : "text-blue-400")}>
                                    {audience_health.level}
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">Score: {audience_health.score}/100</div>
                            </div>

                            <div className="text-xs text-zinc-400 bg-black/30 p-2 rounded">
                                {audience_health.reasoning}
                            </div>
                        </div>

                    </div>

                    {/* MISSING INGREDIENTS */}
                    {missing_ingredients && missing_ingredients.length > 0 && (
                        <div>
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                Missing Viral Triggers
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {missing_ingredients.map((item, i) => (
                                    <div key={i} className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg text-red-200 text-sm flex items-start gap-2">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ACTION BAR */}
                    <div className="bg-accent/5 border border-accent/10 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <div className="text-accent font-bold text-sm">Optimization Suggestion</div>
                            <div className="text-zinc-400 text-xs text-balance">
                                Fix the missing ingredients and re-run prediction to increase your odds.
                            </div>
                        </div>
                        <button onClick={onClose} className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200">
                            Got it
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
