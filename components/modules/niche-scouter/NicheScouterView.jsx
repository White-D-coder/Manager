"use client";

import { useState } from "react";
import { Search, TrendingUp, Users, Play, BarChart3, Clock, Hash, Youtube, ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { nicheScoutAction, channelDeepDiveAction } from "@/app/actions/youtube";
import { suggestNicheIdeasAction } from "@/app/actions/gemini";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import clsx from "clsx";

export default function NicheScouterView() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState(null);

    // AI Suggestions
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const handleSearch = async (e, overrideQuery) => {
        if (e) e.preventDefault();
        const q = overrideQuery || query;
        if (!q.trim()) return;

        if (overrideQuery) setQuery(overrideQuery);

        setIsSearching(true);
        setError(null);
        setSelectedChannel(null);
        setAnalytics(null);

        try {
            const results = await nicheScoutAction(q);
            if (results.error) throw new Error(results.error);
            setChannels(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
            const ideas = await suggestNicheIdeasAction();
            if (ideas && Array.isArray(ideas)) setSuggestions(ideas);
        } catch (e) {
            console.error("Failed to fetch suggestions", e);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleChannelSelect = async (channel) => {
        setSelectedChannel(channel);
        setIsLoadingAnalytics(true);
        setAnalytics(null);

        try {
            const data = await channelDeepDiveAction(channel.id);
            if (data) setAnalytics(data.analytics);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingAnalytics(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header / Search Section */}
            <div className="bg-surface border border-white/10 p-6 rounded-2xl">
                <div className="max-w-xl">
                    <h2 className="text-xl font-bold text-white mb-2">Detailed Niche Scouter</h2>
                    <p className="text-sm text-zinc-400 mb-6">
                        Find high-velocity "Faceless" channels. We verify viral status by comparing Views vs Subscriber count.
                    </p>

                    <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Enter a niche (e.g., 'Scary Stories', 'Tech Facts', 'Luxury Life')..."
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:border-purple-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all"
                        >
                            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scout Niche"}
                        </button>
                    </form>

                    {/* AI Suggestions Chip Cloud */}
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">AI Suggestions</span>
                            {suggestions.length === 0 && !isLoadingSuggestions && (
                                <button onClick={fetchSuggestions} className="text-xs text-purple-400 hover:underline">
                                    (Load Ideas)
                                </button>
                            )}
                        </div>

                        {isLoadingSuggestions && (
                            <div className="flex gap-2">
                                <span className="h-6 w-20 bg-white/5 rounded animate-pulse" />
                                <span className="h-6 w-24 bg-white/5 rounded animate-pulse" />
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((idea, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSearch(null, idea)}
                                    className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/50 rounded-full text-xs text-zinc-300 transition-all"
                                >
                                    {idea}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/10 p-3 rounded-lg border border-red-900/20 text-sm">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 flex gap-6">

                {/* Channel List (Left Panel) */}
                <div className="w-1/3 bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-zinc-500">Top Candidates</span>
                        <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-zinc-400">
                            Sorted by Viral Ratio
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {channels.length === 0 && !isSearching && (
                            <div className="h-40 flex items-center justify-center text-zinc-600 text-xs text-center px-6">
                                Enter a niche to find channels performing strongly right now.
                            </div>
                        )}

                        {channels.map((ch) => (
                            <button
                                key={ch.id}
                                onClick={() => handleChannelSelect(ch)}
                                className={clsx(
                                    "w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group relative overflow-hidden",
                                    selectedChannel?.id === ch.id
                                        ? "bg-purple-900/20 border-purple-500/50"
                                        : "bg-black/20 border-transparent hover:bg-white/5 hover:border-white/5"
                                )}
                            >
                                <img src={ch.thumbnail} className="w-10 h-10 rounded-full bg-zinc-800 object-cover shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-sm font-bold text-white truncate max-w-[120px]">{ch.title}</div>
                                        <div className={clsx("text-xs font-mono font-bold", ch.viralRatio > 5 ? "text-green-400" : "text-zinc-400")}>
                                            {ch.viralRatio.toFixed(1)}x Viral
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(ch.stats.subscribers / 1000).toFixed(1)}k</span>
                                        <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {(ch.stats.avgViews / 1000).toFixed(1)}k avg</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Analytics Panel (Right Panel) */}
                <div className="flex-1 bg-surface border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    {!selectedChannel ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <BarChart3 className="w-8 h-8 opacity-50" />
                            </div>
                            <p>Select a channel to analyze its DNA</p>
                        </div>
                    ) : isLoadingAnalytics ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            <p className="text-sm text-purple-300 font-mono animate-pulse">EXTRACTING CHANNEL DNA...</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-0 overflow-y-auto">

                            {/* Header Stats */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={selectedChannel.thumbnail} className="w-16 h-16 rounded-full border-2 border-white/10" />
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{selectedChannel.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-zinc-400 mt-1">
                                            <span>{selectedChannel.description?.substring(0, 60)}...</span>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={`https://youtube.com/channel/${selectedChannel.id}`}
                                    target="_blank"
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Youtube className="w-4 h-4" /> Open Channel
                                </a>
                            </div>

                            {/* Main Graph: Views vs Subs */}
                            <div className="h-64 bg-black/40 rounded-xl border border-white/5 p-4 relative">
                                <div className="absolute top-4 left-4 z-10">
                                    <h4 className="text-xs font-bold uppercase text-zinc-500 mb-1">Viral Verification</h4>
                                    <p className="text-sm text-white">Views (Live) vs Subscribers (Baseline)</p>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics?.graphData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="publishedAt" hide />
                                        <YAxis stroke="#666" fontSize={10} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                            labelFormatter={() => ''}
                                        />
                                        <ReferenceLine y={selectedChannel.stats.subscribers} stroke="#666" strokeDasharray="5 5" label="Subs Baseline" />
                                        <Line
                                            type="monotone"
                                            dataKey="views"
                                            stroke="#a855f7"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Deep Dive Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Upload Schedule */}
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mb-2">
                                        <Clock className="w-3 h-3" /> Best Upload Time
                                    </div>
                                    <div className="text-xl font-mono font-bold text-white">
                                        {analytics?.bestUploadSchedule?.day}s
                                    </div>
                                    <div className="text-sm text-zinc-400">
                                        at {analytics?.bestUploadSchedule?.hour}
                                    </div>
                                </div>

                                {/* Content DNA */}
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase mb-2">
                                        <Hash className="w-3 h-3" /> Dominant Tags
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {analytics?.topTags?.slice(0, 5).map((t) => (
                                            <span key={t.tag} className="text-xs px-2 py-1 bg-white/10 rounded text-zinc-300">
                                                #{t.tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
