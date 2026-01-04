"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Wifi, Search, ArrowUpRight } from "lucide-react";
import { fetchRealYouTubeTrends } from "@/app/actions/youtube";
import { EngagementScorer } from "@/lib/brain/EngagementScorer";

export default function DataStreamView() {
    const { config, addLog, setModule } = useAppStore();
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const scan = async (query) => {
        setLoading(true);
        if (query) {
            addLog({ module: "DataCapture", level: "info", message: `Initiating targeted search vector: [${query.toUpperCase()}]` });
        }

        // TRY REAL API FIRST
        let data = [];
        try {
            // Static import used
            // const { fetchRealYouTubeTrends } = await import("@/app/actions/youtube");
            const rawThreads = await fetchRealYouTubeTrends(query || config.initial_genre);

            if (rawThreads && rawThreads.length > 0) {
                // MODULE B: RUN ENGAGEMENT SCORING
                const rankedTrends = EngagementScorer.rank(rawThreads);

                addLog({ module: "DataCapture", level: "success", message: `CAPTURED & RANKED ${rankedTrends.length} SIGNALS.` });

                // Map to UI format
                data = rankedTrends.map(t => ({
                    id: t.video_id,
                    topic: t.title,
                    source: 'youtube_real',
                    volume: t.views,
                    growth_rate: Math.round(t.view_velocity || 0),
                    trend_score: t.engagement_score
                }));
            }
        } catch (e) {
            // ...
        }

        console.error(e);
        addLog({ module: 'DataStream', level: 'error', message: 'Signal Capture Failed.' });
    }
    setIsScanning(false);
};

const handleSelect = (trend) => {
    setSelectedTrend(trend);
    addLog({ module: 'System', level: 'info', message: `Locked target: ${trend.topic}` });
    setModule(2); // Move to Strategy/Decision
};

useEffect(() => {
    scan();
}, []);

return (
    <div className="h-full flex flex-col p-6 gap-6 relative">
        <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-accent font-mono text-xl">
                <Radio className={clsx("w-6 h-6", isScanning && "animate-pulse")} />
                DATA_STREAM_NODE // {config.niche.toUpperCase()}
            </h3>
            <button
                onClick={scan}
                disabled={isScanning}
                className="flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-2 rounded hover:bg-accent/20 transition-all disabled:opacity-50"
            >
                <Radar className={clsx("w-4 h-4", isScanning && "animate-spin")} />
                {isScanning ? 'SCANNING ETHER...' : 'START MACHINE'}
            </button>
        </div>

        {/* DEEP RESEARCH HUD */}
        {deepResearch && (
            <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-surface/50 border border-success/30 p-3 rounded flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">OPTIMAL UPLOAD WINDOW</span>
                    <div className="text-xl text-success font-bold font-mono mt-1">
                        {deepResearch.best_day} <span className="text-white">@</span> {deepResearch.best_hour_formatted}
                    </div>
                </div>
                {deepResearch.viral_outlier && (
                    <div className="bg-surface/50 border border-warning/30 p-3 rounded flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">VIRAL OUTLIER DETECTED</span>
                        <div className="text-sm text-zinc-300 font-mono mt-1 truncate">
                            <span className="text-warning font-bold">{deepResearch.viral_outlier.viral_ratio.toFixed(1)}x Ratio</span> by {deepResearch.viral_outlier.channelTitle}
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="flex-1 bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
            <div className="grid grid-cols-12 bg-black/40 p-3 text-xs text-zinc-500 font-mono border-b border-border uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-1">Ratio</div> {/* New Column */}
                <div className="col-span-5">Signal Topic</div>
                <div className="col-span-2 text-right">Velocity</div>
                <div className="col-span-2 text-right">Engagement</div>
                <div className="col-span-1"></div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {streamData.map((item, i) => (
                    <div key={item.id} className="grid grid-cols-12 p-3 border-b border-white/5 hover:bg-white/5 transition-colors items-center group text-sm">
                        <div className="col-span-1 font-mono text-zinc-500">#{i + 1}</div>

                        {/* Viral Ration Badge */}
                        <div className="col-span-1 font-mono">
                            <span className={clsx(
                                "px-1.5 py-0.5 rounded text-[10px]",
                                item.viral_ratio > 2 ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-zinc-600"
                            )}>
                                {item.viral_ratio ? `${item.viral_ratio.toFixed(1)}x` : '-'}
                            </span>
                        </div>

                        <div className="col-span-5 font-medium text-zinc-300 truncate pr-4">
                            {item.topic}
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 flex gap-2">
                                <span>{item.channelTitle}</span>
                                <span>•</span>
                                <span>{(item.duration_sec / 60).toFixed(1)}m</span>
                            </div>
                        </div>

                        <div className="col-span-2 text-right font-mono text-accent">
                            {item.velocity_score}
                            <span className="text-[10px] text-zinc-600 ml-1">v/h</span>
                        </div>

                        <div className="col-span-2 text-right font-mono text-zinc-400">
                            {item.engagement_score}
                        </div>

                        <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleSelect(item)}
                                className="p-1.5 bg-accent text-black rounded hover:bg-accent-highlight"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {streamData.length === 0 && !isScanning && (
                    <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm">
                        Waiting for Signal Scan...
                    </div>
                )}
            </div>
        </div>
    </div>
);
}
