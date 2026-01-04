"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Wifi, Search, ArrowUpRight } from "lucide-react";

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
            const { fetchRealYouTubeTrends } = await import("@/app/actions/youtube");
            const realTrends = await fetchRealYouTubeTrends(query || config.initial_genre);
            if (realTrends && realTrends.length > 0) {
                addLog({ module: "DataCapture", level: "success", message: `RECEIVED LIVE PACKET FROM YOUTUBE API: ${realTrends.length} items.` });
                data = realTrends;
            }
        } catch (e) {
            console.warn("Real API failed, falling back to sim", e);
        }

        // NO FALLBACK - User requested Pure Real Data
        // If data is empty after real API try, it stays empty so user knows something is wrong.

        setTrends(data);
        setLoading(false);

        addLog({ module: "DataCapture", level: "success", message: `Captured ${data.length} potential trend vectors.` });
        useAppStore.getState().setTrends(data);
    };

    useEffect(() => {
        addLog({ module: "DataCapture", level: "info", message: `Scanning signal frequencies for: ${config.initial_genre}` });
        scan();

        // Auto-advance
        setTimeout(() => {
            if (!useAppStore.getState().selectedTrend) { // Only auto-advance if user hasn't intervened (simple check)
                addLog({ module: "System", level: "info", message: "Handing off to Decision Brain (Module 2)..." });
                setModule(2);
            }
        }, 8000); // Increased delay to allow interaction
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        scan(searchQuery);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-surface border-b border-border">
                <h3 className="flex items-center gap-2 text-secondary font-mono">
                    <Wifi className="w-4 h-4 animate-pulse" />
                    DATA_CAPTURE_STREAM // ACTIVE
                </h3>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH LIVE DATA..."
                        className="bg-black border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-white focus:border-secondary outline-none w-48"
                    />
                    <button type="submit" className="bg-secondary/20 text-secondary border border-secondary p-1 rounded hover:bg-secondary/40">
                        <ArrowUpRight className="w-3 h-3" />
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <Search className="w-12 h-12 text-secondary animate-bounce" />
                    <p className="font-mono text-secondary animate-pulse">SCANNING GLOBAL NETWORKS...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                    {trends.length === 0 ? (
                        <div className="col-span-4 flex flex-col items-center justify-center p-12 opacity-50 space-y-2">
                            <Wifi className="w-8 h-8" />
                            <p>NO DATA SIGNAL. CHECK YOUTUBE CONNECTION.</p>
                        </div>
                    ) : (
                        trends.map((trend, i) => (
                            <motion.div
                                key={trend.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 bg-surface-highlight border border-border rounded hover:border-secondary transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 text-[10px] font-mono text-zinc-600 group-hover:text-secondary">
                                    SRC: {trend.source.toUpperCase()}
                                </div>
                                <div className="mt-4 font-bold text-white mb-2 line-clamp-2">{trend.topic}</div>

                                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400">
                                    <div>VOL: {trend.volume}</div>
                                    <div className={trend.growth_rate > 0 ? "text-success" : "text-destructive"}>
                                        {trend.growth_rate > 0 ? "+" : ""}{trend.growth_rate}%
                                    </div>
                                </div>

                                {/* Decorative scan line */}
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-secondary/50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                            </motion.div>
                        )))}
                </div>
            )}
        </div>
    );
}
