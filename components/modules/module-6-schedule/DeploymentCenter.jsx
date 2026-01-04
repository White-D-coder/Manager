"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Calendar, UploadCloud, Activity, RefreshCw, Zap, Brain } from "lucide-react";
import clsx from "clsx";
import { MemorySystem } from "@/lib/brain/MemorySystem";

export default function DeploymentCenter() {
    const { videoAsset, config, setModule, addLog } = useAppStore();
    const [stage, setStage] = useState(6);
    const [views, setViews] = useState(0);
    const [engagement, setEngagement] = useState(0);

    // Module 6: Scheduling
    useEffect(() => {
        if (stage === 6) {
            addLog({ module: 'Scheduler', level: 'info', message: 'Analyzing audience activity patterns...' });
            setTimeout(() => {
                addLog({ module: 'Scheduler', level: 'success', message: 'Optimal slot found: TODAY @ 18:45 UTC.' });
                setStage(7);
            }, 2000);
        }
    }, [stage]);

    // Module 7: Upload
    useEffect(() => {
        if (stage === 7) {
            addLog({ module: 'AutoDeploy', level: 'warning', message: 'Initiating specific platform handshake...' });
            setTimeout(() => {
                addLog({ module: 'AutoDeploy', level: 'success', message: 'Asset #8843 deployed successfully.' });
                setStage(8);
            }, 2000);
        }
    }, [stage]);

    // Stage 8: Performance (Real Telemetry)
    useEffect(() => {
        if (stage === 8) {
            const fetchStats = async () => {
                try {
                    const { getRealChannelStats } = await import("@/app/actions/youtube");
                    const stats = await getRealChannelStats();
                    if (stats) {
                        addLog({ module: 'Analytics', level: 'success', message: `CHANNEL CONNECTED: ${stats.title}` });
                        addLog({ module: 'Analytics', level: 'info', message: `REAL METRICS: ${stats.viewCount} Views • ${stats.subscriberCount} Subs` });
                        // In a real app we would store this in state to display
                    } else {
                        addLog({ module: 'Analytics', level: 'warning', message: 'No YouTube Connection. Simulation Active.' });
                    }
                } catch (e) {
                    console.error("Stats Fetch Failed", e);
                }

                // Auto-complete cycle
                setTimeout(() => {
                    setStage(9);
                    addLog({ module: 'System', level: 'success', message: 'Cycle Complete. Updating Memory...' });
                }, 5000);
            };
            fetchStats();
        }
    }, [stage]);

    // Stage 9: Feedback Loop
    useEffect(() => {
        if (stage === 9 && videoAsset) {
            const ctr = 0.12 + (Math.random() * 0.05); // Still simulated CTR as we just posted
            const mem = MemorySystem.recordSuccess(videoAsset.script_id, ctr);
            addLog({ module: 'DeepLearn', level: 'success', message: `Memory Updated. Total Knowledge Cycles: ${mem.total_cycles}` });
        }
    }, [stage]);


    const handleRestart = () => {
        addLog({ module: 'System', level: 'info', message: 'RESTARTING LOOP...' });
        setModule(1);
    };

    return (
        <div className="h-full flex flex-col p-6 gap-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="flex items-center gap-2 text-white font-mono text-xl">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    DEPLOYMENT_NEXUS
                </h3>
                <div className="flex gap-4 font-mono text-xs">
                    <span className={clsx("transition-colors", stage === 6 ? "text-primary" : "text-zinc-600")}>06_SCHED</span>
                    <span className={clsx("transition-colors", stage === 7 ? "text-primary" : "text-zinc-600")}>07_UPLOAD</span>
                    <span className={clsx("transition-colors", stage === 8 ? "text-primary" : "text-zinc-600")}>08_ANALYTICS</span>
                    <span className={clsx("transition-colors", stage === 9 ? "text-primary" : "text-zinc-600")}>09_LEARN</span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Live Monitor */}
                <div className="bg-black border border-zinc-800 rounded-lg p-6 relative overflow-hidden flex flex-col justify-center items-center">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                    {stage >= 8 ? (
                        <div className="text-center space-y-2 z-10">
                            <div className="text-zinc-500 font-mono text-xs uppercase">Live Impressions</div>
                            <div className="text-6xl font-black text-white tabular-nums tracking-tighter">
                                {views.toLocaleString()}
                            </div>
                            <div className="text-success font-mono text-sm flex justify-center gap-2">
                                <Activity className="w-4 h-4" />
                                {engagement} Interactions
                            </div>
                        </div>
                    ) : (
                        <div className="text-zinc-600 font-mono text-sm animate-pulse">
                            WAITING FOR SIGNAL...
                        </div>
                    )}
                </div>

                {/* Status & Controls */}
                <div className="space-y-6">
                    <div className="p-4 bg-surface border border-border rounded space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={clsx("p-2 rounded", stage >= 6 ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-600")}>
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-zinc-500 uppercase">Scheduling</div>
                                <div className="text-white font-mono">{stage > 6 ? "OPTIMIZED: 18:45 UTC" : "CALCULATING..."}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={clsx("p-2 rounded", stage >= 7 ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-600")}>
                                <UploadCloud className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-zinc-500 uppercase">Upload Status</div>
                                <div className="text-white font-mono">{stage > 7 ? "DEPLOYED" : (stage === 7 ? "UPLOADING..." : "PENDING")}</div>
                            </div>
                        </div>
                    </div>

                    {stage === 9 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border border-primary/50 bg-primary/10 rounded flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-2 text-primary font-mono text-sm font-bold">
                                <Brain className="w-4 h-4" />
                                <span>SYSTEM IQ INCREASED.</span>
                            </div>
                            <div className="text-xs text-zinc-400 font-mono">
                                Total Cycles: {MemorySystem.load().total_cycles}
                            </div>
                            <button
                                onClick={handleRestart}
                                className="w-full py-3 bg-primary text-black font-bold font-mono rounded hover:bg-white transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                START NEW CYCLE
                            </button>
                        </motion.div>
                    )}
                </div>

            </div>
        </div>
    );
}
