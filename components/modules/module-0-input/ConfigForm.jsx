"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Zap, Target, LayoutGrid, Youtube, Check } from "lucide-react";
import clsx from "clsx";
import { getYouTubeAuthUrl, getRealChannelStats } from "@/app/actions/youtube";
import { generateStrategy } from "@/app/actions/strategy";

export default function ConfigForm() {
    const { config, setConfig, startSystem, addLog, setStrategyProfile } = useAppStore();

    const [isConnected, setIsConnected] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        const checkConnection = async () => {
            // Static import used
            // const { getRealChannelStats } = await import("@/app/actions/youtube");
            const stats = await getRealChannelStats();
            if (stats) {
                setIsConnected(true);
                setChannelName(stats.title);
            }
        };
        checkConnection();
    }, []);

    const handleStart = async () => {
        if (!config.initial_genre) return;
        setIsStarting(true);

        addLog({ module: "System", level: "info", message: "Analyzing genre architecture..." });

        try {
            // Static import used
            // const { generateStrategy } = await import("@/app/actions/strategy");
            const strategy = await generateStrategy(config.initial_genre);
            setStrategyProfile(strategy);
            addLog({ module: "System", level: "success", message: `Strategy Locked: ${strategy.voice_tone} / ${strategy.visual_style}` });
        } catch (e) {
            addLog({ module: "System", level: "warning", message: "Strategy Analysis failed. Using defaults." });
        }

        addLog({ module: "System", level: "success", message: "Configuration confirmed. Initializing Growth Sequence..." });

        // Small delay to let user see "Success" state if we had one, but we transition immediately
        startSystem();
    };

    const connectYouTube = async () => {
        const url = await getYouTubeAuthUrl();
        if (url) window.location.href = url;
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">

            <div className="text-center mb-12 space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-white">Social Growth Machine</h1>
                <p className="text-zinc-400">Autonomous video production & optimization engine.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

                {/* 1. Identity & Niche */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6 rounded-xl space-y-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-white border-b border-border pb-4">
                            <Target className="w-4 h-4 text-zinc-400" />
                            Target Architecture
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium">Account Type</label>
                                <select
                                    className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-white focus:border-white transition-all outline-none"
                                    value={config.account_type}
                                    onChange={(e) => setConfig({ account_type: e.target.value })}
                                >
                                    <option value="personal">Personal Brand</option>
                                    <option value="brand">Company / Business</option>
                                    <option value="client">Client Account</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium">Growth Goal</label>
                                <select
                                    className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-white focus:border-white transition-all outline-none"
                                    value={config.growth_priority}
                                    onChange={(e) => setConfig({ growth_priority: e.target.value })}
                                >
                                    <option value="reach">Viral Reach (Views)</option>
                                    <option value="retention">Community (Subs)</option>
                                    <option value="conversion">Conversion (Sales)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-xs text-zinc-500 font-medium flex justify-between">
                                <span>Primary Niche (Be Specific)</span>
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        if (!isConnected) {
                                            alert("Connect YouTube first to scan trends!");
                                            return;
                                        }
                                        const btn = e.currentTarget;
                                        const originalText = btn.innerText;
                                        btn.innerText = "Scanning...";
                                        try {
                                            const { identifyWinningNicheAction } = await import("@/app/actions/gemini");
                                            const winner = await identifyWinningNicheAction();
                                            if (winner && !winner.error) {
                                                setConfig({ initial_genre: winner });
                                            } else {
                                                alert(winner?.error || "Scan failed");
                                            }
                                        } catch (err) { console.error(err); }
                                        btn.innerText = originalText;
                                    }}
                                    className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                    ✨ AI Suggest High-Growth Niche
                                </button>
                            </label>
                            <input
                                type="text"
                                value={config.initial_genre}
                                onChange={(e) => setConfig({ initial_genre: e.target.value })}
                                placeholder="e.g. Minimalist Home Office Setup"
                                className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-white focus:border-white transition-all outline-none placeholder:text-zinc-600"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Connections & Risk */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-xl space-y-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-white border-b border-border pb-4">
                            <LayoutGrid className="w-4 h-4 text-zinc-400" />
                            Integrations
                        </div>

                        <button
                            onClick={connectYouTube}
                            disabled={isConnected}
                            className={clsx(
                                "w-full flex items-center justify-between p-4 rounded-lg border transition-all group",
                                isConnected
                                    ? "bg-primary/10 border-primary cursor-default"
                                    : "border-border hover:bg-surface-highlight cursor-pointer"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={clsx("p-2 rounded-md", isConnected ? "bg-primary text-black" : "bg-red-600/10 text-red-500")}>
                                    {isConnected ? <Check className="w-5 h-5" /> : <Youtube className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-medium text-white">{isConnected ? "Connected" : "YouTube"}</div>
                                    <div className="text-xs text-zinc-500 group-hover:text-zinc-400">
                                        {isConnected ? channelName : "Connect Channel"}
                                    </div>
                                </div>
                            </div>

                            <div className={clsx("w-2 h-2 rounded-full transition-colors", isConnected ? "bg-primary shadow-[0_0_10px_white]" : "bg-zinc-700 group-hover:bg-green-500")} />
                        </button>

                        {/* Disconnect Option */}
                        {isConnected && (
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const { disconnectYouTube } = await import("@/app/actions/youtube");
                                    await disconnectYouTube();
                                    window.location.reload();
                                }}
                                className="w-full text-xs text-red-500 hover:text-red-400 text-center hover:bg-red-500/10 p-2 rounded transition-colors"
                            >
                                Disconnect Account
                            </button>
                        )}

                        {/* Studio Link */}
                        <a href="/dashboard/studio" className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-surface-highlight hover:border-purple-500/50 transition-all group cursor-pointer text-decoration-none">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-purple-900/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-colors">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-medium text-white">Growth Studio</div>
                                    <div className="text-xs text-zinc-500 group-hover:text-zinc-400">
                                        AI Auditor & Optimizer
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div className="glass-panel p-6 rounded-xl space-y-4">
                        <label className="text-xs text-zinc-500 font-medium">AI Risk Profile</label>
                        <div className="flex bg-surface border border-border rounded-lg p-1">
                            {['low', 'medium', 'high'].map(risk => (
                                <button
                                    key={risk}
                                    onClick={() => setConfig({ risk_profile: risk })}
                                    className={clsx(
                                        "flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all",
                                        config.risk_profile === risk ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    {risk}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div >

            <div className="mt-12">
                <button
                    onClick={handleStart}
                    disabled={!config.initial_genre || isStarting}
                    className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide flex items-center gap-2"
                >
                    {isStarting ? (
                        <>
                            <Zap className="w-4 h-4 animate-spin fill-black" />
                            Initializing Deep Brain...
                        </>
                    ) : (
                        "Start Machine"
                    )}
                </button>
            </div>

        </div >
    );
}
