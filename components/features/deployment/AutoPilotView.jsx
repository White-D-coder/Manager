"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, Terminal, Activity, Zap, ShieldCheck } from "lucide-react";
import { runAutonomousLoopAction } from "@/app/actions/gemini";
import clsx from "clsx";

export default function AutoPilotView() {
    const [status, setStatus] = useState("IDLE"); // IDLE, RUNNING, STOPPING
    const [logs, setLogs] = useState([]);
    const [videoCount, setVideoCount] = useState(2); // Default to user preference
    const [brainState, setBrainState] = useState({
        phase: "WAITING",
        prediction: "--:--",
        uploads_today: 0
    });

    const addLog = (msg) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    };

    const handleStartLoop = async () => {
        setStatus("RUNNING");
        addLog("INITIATING AUTONOMOUS NEURAL LOOP...");

        try {
            // Trigger the server action
            setBrainState(prev => ({ ...prev, phase: "PHASE 1: INTELLIGENCE" }));
            addLog(`PHASE 1: Scanning Trends & Scheduling ${videoCount} Videos...`);

            const result = await runAutonomousLoopAction(parseInt(videoCount));

            if (result.success) {
                const logs = result.logs || [];
                const intelligence = result.result?.intelligence;
                const winner = intelligence?.suggested_niche || "Analzying...";
                const uploadedResults = result.result?.results || [];

                addLog(`✅ CYCLE COMPLETE. Scheduled ${uploadedResults.length} Videos.`);
                uploadedResults.forEach((res, idx) => {
                    addLog(`   > Video ${idx + 1}: ${res.status === 'uploaded' ? 'Scheduled' : 'Failed'} (${res.privacy || 'Error'})`);
                });

                setBrainState(prev => ({
                    ...prev,
                    phase: "SLEEPING (Next Cycle: Tomorrow)",
                    uploads_today: prev.uploads_today + uploadedResults.length,
                    niche: winner
                }));
            } else {
                addLog(`❌ CYCLE FAILED: ${result.error}`);
            }
        } catch (e) {
            addLog(`CRITICAL ERROR: ${e.message}`);
        }

        setStatus("IDLE");
    };

    return (
        <div className="h-full bg-background p-6 flex flex-col gap-6">
            {/* HEADS UP DISPLAY */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface border border-white/10 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">System Status</div>
                        <div className={clsx("text-xl font-mono font-bold flex items-center gap-2",
                            status === "RUNNING" ? "text-green-400" : "text-zinc-400")}>
                            {status === "RUNNING" ? <Activity className="w-4 h-4 animate-pulse" /> : <Square className="w-3 h-3" />}
                            {status}
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-white/10 p-4 rounded-xl">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">Winning Niche</div>
                    <div className="text-sm font-mono text-purple-400 truncate" title={brainState.niche || "Scanning..."}>
                        {brainState.niche || "Scanning..."}
                    </div>
                </div>
                <div className="bg-surface border border-white/10 p-4 rounded-xl">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">Current Phase</div>
                    <div className="text-sm font-mono text-accent">{brainState.phase}</div>
                </div>
                <div className="bg-surface border border-white/10 p-4 rounded-xl">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">Builds Today</div>
                    <div className="text-xl font-mono text-white">{brainState.uploads_today} / {videoCount}</div>
                </div>
                <div className="bg-surface border border-white/10 p-4 rounded-xl">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">Safety Gate</div>
                    <div className="text-xl font-mono text-blue-400 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> ACTIVE
                    </div>
                </div>
            </div>

            {/* MAIN TERMINAL & CONTROLS */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* LEFT: CONTROLS */}
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="bg-surface border border-white/10 p-6 rounded-xl flex-1 flex flex-col items-center justify-center gap-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                            {status === "RUNNING" && (
                                <div className="absolute inset-0 border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                            )}
                            <Zap className={clsx("w-12 h-12", status === "RUNNING" ? "text-accent" : "text-zinc-600")} />
                        </div>

                        {/* CONFIGURATION INPUT */}
                        <div className="w-full">
                            <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block text-center">Videos Per Day</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={videoCount}
                                onChange={(e) => setVideoCount(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-center text-white font-mono focus:border-accent outline-none transition-colors"
                            />
                        </div>

                        <button
                            onClick={handleStartLoop}
                            disabled={status === "RUNNING"}
                            className={clsx("flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all w-full justify-center",
                                status === "RUNNING"
                                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                    : "bg-accent hover:bg-accent-hover text-black shadow-lg shadow-accent/20"
                            )}
                        >
                            <Play className="w-5 h-5" />
                            {status === "RUNNING" ? "SYSTEM BUSY..." : "RUN DAILY CYCLE"}
                        </button>

                        <div className="text-xs text-zinc-500 text-center max-w-xs">
                            Triggers full autonomous loop: Research -> Strategy -> Creation -> Safety -> Simulation Upload for {videoCount} videos.
                        </div>
                    </div>
                </div>

                {/* RIGHT: LIVE TERMINAL */}
                <div className="flex-1 bg-black rounded-xl border border-white/10 p-4 font-mono text-xs overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 text-zinc-500 border-b border-white/10 pb-2 mb-2">
                        <Terminal className="w-4 h-4" />
                        <span>NEURAL_LOG_STREAM // SILLYMEE_CORE_V1</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 mt-2">
                        {logs.map((log, i) => (
                            <div key={i} className="text-zinc-300 border-l-2 border-white/10 pl-2">
                                {log}
                            </div>
                        ))}
                        {logs.length === 0 && <span className="text-zinc-600 italic">Waiting for command...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
