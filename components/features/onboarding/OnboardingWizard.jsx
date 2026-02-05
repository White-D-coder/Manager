"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Sparkles, Youtube, Target, Zap, Search } from "lucide-react";
import clsx from "clsx";
import { getYouTubeAuthUrl, getRealChannelStats } from "@/app/actions/youtube";
import { suggestNicheIdeasAction } from "@/app/actions/gemini";

const STEPS = {
    WELCOME: 0,
    CHANNEL_CONTEXT: 1,
    NICHE_SELECTION: 2,
    GOALS: 3,
    COMPLETE: 4
};

export default function OnboardingWizard() {
    const { config, setConfig, startSystem, addLog } = useAppStore();
    const [step, setStep] = useState(STEPS.WELCOME);
    const [isConnected, setIsConnected] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [aiNicheIdeas, setAiNicheIdeas] = useState([]);
    const [isScanning, setIsScanning] = useState(false);

    // Initial Connection Check
    useEffect(() => {
        const checkConnection = async () => {
            const stats = await getRealChannelStats();
            if (stats) {
                setIsConnected(true);
                setChannelName(stats.title);
            }
        };
        checkConnection();
    }, []);

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleGenerateNiches = async () => {
        setIsScanning(true);
        try {
            const ideas = await suggestNicheIdeasAction();
            if (ideas && Array.isArray(ideas)) {
                setAiNicheIdeas(ideas);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsScanning(false);
        }
    };

    const handleFinalStart = () => {
        addLog({ module: "System", level: "success", message: "Onboarding Complete. Initializing..." });
        startSystem();
    };

    return (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-2xl bg-surface/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-8 shadow-2xl relative z-10">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-border/50">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step + 1) / 5) * 100}%` }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 0: WELCOME */}
                    {step === STEPS.WELCOME && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center space-y-8 py-8"
                        >
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif">Welcome to Social Growth</h1>
                                <p className="text-zinc-500 max-w-md mx-auto">
                                    Your autonomous AI partner for YouTube growth. Let's set up your custom strategy engine.
                                </p>
                            </div>
                            <button onClick={nextStep} className="btn-primary px-8 py-3 rounded-full text-lg">
                                Begin Setup <ArrowRight className="w-5 h-5 ml-2 inline" />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1: CHANNEL CONTEXT */}
                    {step === STEPS.CHANNEL_CONTEXT && (
                        <motion.div
                            key="context"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold">Connect Your Channel</h2>
                                <p className="text-zinc-400 text-sm">We need to analyze your past data (or start fresh).</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={isConnected ? null : async () => {
                                        const url = await getYouTubeAuthUrl();
                                        if (url) window.location.href = url;
                                    }}
                                    className={clsx(
                                        "p-6 rounded-xl border transition-all text-left space-y-4 group",
                                        isConnected
                                            ? "bg-success/10 border-success/50"
                                            : "bg-surface border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center text-white">
                                        <Youtube className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-foreground">Connect YouTube</h3>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {isConnected ? `Connected: ${channelName}` : "Link your Google Brand Account"}
                                        </p>
                                    </div>
                                    {isConnected && <div className="text-xs text-success font-mono flex items-center gap-1"><Check className="w-3 h-3" /> VERIFIED</div>}
                                </button>

                                <button
                                    onClick={() => setConfig({ account_type: "new" })}
                                    className={clsx(
                                        "p-6 rounded-xl border transition-all text-left space-y-4",
                                        config.account_type === "new"
                                            ? "bg-primary/10 border-primary"
                                            : "bg-surface border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Start Fresh</h3>
                                        <p className="text-xs text-zinc-400 mt-1">I don't have a channel yet</p>
                                    </div>
                                </button>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={prevStep} className="text-zinc-500 hover:text-white px-4">Back</button>
                                <button
                                    onClick={nextStep}
                                    className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: NICHE SELECTION */}
                    {step === STEPS.NICHE_SELECTION && (
                        <motion.div
                            key="niche"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold">Define Your Battleground</h2>
                                <p className="text-zinc-400 text-sm">What is your winning niche? Be specific.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Primary Niche</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={config.initial_genre}
                                            onChange={(e) => setConfig({ initial_genre: e.target.value })}
                                            placeholder="e.g. Faceless Finance Tips"
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:border-primary outline-none transition-colors"
                                        />
                                        <button
                                            onClick={handleGenerateNiches}
                                            disabled={isScanning}
                                            className="px-4 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                                        >
                                            {isScanning ? <Zap className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {aiNicheIdeas.length > 0 && (
                                    <div className="bg-black/20 rounded-lg p-4 border border-white/5 max-h-48 overflow-y-auto">
                                        <h4 className="text-xs font-semibold text-zinc-500 mb-2">AI SUGGESTIONS</h4>
                                        <div className="space-y-2">
                                            {aiNicheIdeas.map((idea, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setConfig({ initial_genre: idea })}
                                                    className="block w-full text-left p-2 rounded hover:bg-white/5 text-sm transition-colors text-zinc-300 hover:text-white"
                                                >
                                                    {idea}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={prevStep} className="text-zinc-500 hover:text-white px-4">Back</button>
                                <button
                                    onClick={nextStep}
                                    disabled={!config.initial_genre}
                                    className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: GOALS */}
                    {step === STEPS.GOALS && (
                        <motion.div
                            key="goals"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold">Mission Parameters</h2>
                                <p className="text-zinc-400 text-sm">Set your automated targets.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-zinc-500">GROWTH PRIORITY</label>
                                    <select
                                        value={config.growth_priority}
                                        onChange={(e) => setConfig({ growth_priority: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 outline-none"
                                    >
                                        <option value="reach">Max Reach (Views)</option>
                                        <option value="retention">Community (Subs)</option>
                                        <option value="conversion">Sales (Conversion)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-zinc-500">RISK PROFILE</label>
                                    <select
                                        value={config.risk_profile}
                                        onChange={(e) => setConfig({ risk_profile: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 outline-none"
                                    >
                                        <option value="low">Safe & Steady</option>
                                        <option value="medium">Balanced</option>
                                        <option value="high">Aggressive / Viral</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500">DAILY UPLOAD TARGET</label>
                                <div className="flex items-center gap-4 bg-black/20 border border-white/10 rounded-lg p-3">
                                    <Target className="w-5 h-5 text-zinc-500" />
                                    <input
                                        type="number"
                                        min="1" max="10"
                                        value={config.targetUploadsPerDay || 1}
                                        onChange={(e) => setConfig({ targetUploadsPerDay: parseInt(e.target.value) || 1 })}
                                        className="w-16 bg-transparent font-bold text-center outline-none"
                                    />
                                    <span className="text-sm text-zinc-400">videos / day</span>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={prevStep} className="text-zinc-500 hover:text-white px-4">Back</button>
                                <button
                                    onClick={handleFinalStart}
                                    className="bg-primary text-black px-8 py-2 rounded-lg font-bold hover:bg-white transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                >
                                    Activate System
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}
