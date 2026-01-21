"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Upload, Search, Activity, Zap, BarChart3, Clock, Globe, FileVideo } from "lucide-react";
import clsx from "clsx";
import { runChannelAuditAction, optimizeUploadAction } from "@/app/actions/agent";

export default function StudioPage() {
    return (
        <div className="min-h-full p-6 space-y-8">
            <header className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Growth Studio
                    </h1>
                    <p className="text-zinc-500 mt-1">AI-Powered Channel Intelligence & Upload Optimization</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChannelAuditor />
                <SmartUploader />
            </div>
        </div>
    );
}

function ChannelAuditor() {
    const [auditData, setAuditData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const runAudit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await runChannelAuditAction();
            if (data.error) throw new Error(data.error);
            setAuditData(data.audit);
        } catch (e) {
            setError(e.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group min-h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">Channel Pulse</h2>
            </div>

            {!auditData && !isLoading ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-surface-highlight flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-zinc-500" />
                    </div>
                    <p className="text-zinc-400 max-w-sm">
                        Scan your recent performance, compare against viral trends, and find "missed opportunities".
                    </p>
                    <button
                        onClick={runAudit}
                        className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4" />
                        Run Deep Audit
                    </button>
                    {error && <p className="text-red-400 text-sm mt-4 bg-red-900/20 px-4 py-2 rounded">{error}</p>}
                </div>
            ) : isLoading ? (
                <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <div className="text-sm font-mono text-purple-300 animate-pulse">
                        ANALYZING VELOCITY...
                    </div>
                </div>
            ) : (
                <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Card */}
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider">AI Verdict</h3>
                        <p className="text-white leading-relaxed">
                            {auditData.audit_summary}
                        </p>
                    </div>

                    {/* Timing & Velocity Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Velocity Insight */}
                        <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-2">
                            <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase">
                                <BarChart3 className="w-3 h-3" /> Top Performer
                            </div>
                            <div className="text-sm font-medium text-white truncate">
                                {auditData.velocity_analysis?.best_performer}
                            </div>
                            <p className="text-xs text-zinc-500 leading-snug">
                                Why: {auditData.velocity_analysis?.why_it_won}
                            </p>
                        </div>

                        {/* Quick Timing Verdict */}
                        <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-2">
                            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase">
                                <Clock className="w-3 h-3" /> Strategic Shift
                            </div>
                            <div className="text-sm font-medium text-white">
                                {auditData.timing_analysis?.recommended_upload_time || "N/A"}
                            </div>
                            <p className="text-xs text-zinc-500 leading-snug">
                                {auditData.timing_analysis?.reason}
                            </p>
                        </div>
                    </div>

                    {/* Weekly Schedule */}
                    {auditData.timing_analysis?.weekly_schedule && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-400">
                                <Clock className="w-3 h-3" /> 7-Day Viral Forecast
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Object.entries(auditData.timing_analysis.weekly_schedule).map(([day, time]) => (
                                    <div key={day} className="flex flex-col items-center justify-center p-2 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                            {day.slice(0, 3)}
                                        </div>
                                        <div className="text-xs font-mono font-bold text-white">
                                            {time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missed Opportunities */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-orange-400">
                            <Globe className="w-3 h-3" /> Viral Gaps (Web Trends)
                        </div>
                        {auditData.missed_opportunities?.map((opp, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                <div>
                                    <div className="text-sm font-medium text-white">{opp.topic}</div>
                                    <div className="text-xs text-zinc-500">{opp.why_viral}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SmartUploader() {
    const [file, setFile] = useState(null);
    const [topic, setTopic] = useState("");
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleOptimize = async () => {
        if (!topic && !file) return; // Allow just file to be enough if topics can be inferred (future)
        setIsLoading(true);

        const formData = new FormData();
        formData.append("topic", topic || ""); // Allow empty topic if file exists
        if (file) formData.append("file", file); // Send the actual file
        formData.append("filename", file?.name || "untitled.mp4");

        const data = await optimizeUploadAction(formData);
        if (data) setResult(data);

        setIsLoading(false);
    };

    return (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col min-h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-bl from-pink-900/10 to-transparent pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                    <Upload className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">Neural Upload</h2>
            </div>

            {!result ? (
                <div className="flex-1 flex flex-col space-y-6 relative z-10">
                    {/* Drag Zone */}
                    <div
                        onClick={triggerFileInput}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className={clsx(
                            "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer group",
                            file ? "border-green-500/50 bg-green-500/5" : "border-white/10 hover:border-pink-500/50 hover:bg-white/5"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="video/*"
                        />

                        {file ? (
                            <>
                                <FileVideo className="w-10 h-10 text-green-400 mb-4" />
                                <p className="text-green-400 font-medium">{file.name}</p>
                                <p className="text-xs text-zinc-500 mt-2">{(file.size / (1024 * 1024)).toFixed(1)} MB Ready</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-zinc-600 mb-4 group-hover:text-pink-400 transition-colors" />
                                <p className="text-zinc-400 font-medium group-hover:text-white">Drag Video File Here</p>
                                <p className="text-xs text-zinc-600 mt-2">MP4, MOV (Max 2GB)</p>
                                <button className="mt-4 text-xs bg-white/10 group-hover:bg-pink-500/20 group-hover:text-pink-200 px-3 py-1.5 rounded transition-all">
                                    Browse Files
                                </button>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-zinc-500">Video Context / Topic</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={file ? "What happens in this video?" : "e.g. 'Day in the life'"}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white placeholder:text-zinc-700 focus:border-pink-500 outline-none transition-colors"
                            />
                        </div>

                        <button
                            onClick={handleOptimize}
                            disabled={(!topic && !file) || isLoading}
                            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Zap className="w-4 h-4 animate-spin" />
                                    {file ? "Watching & Analyzing..." : "Optimizing Metadata..."}
                                </>
                            ) : (
                                "Generate Viral Metadata"
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <button
                        onClick={() => setResult(null)}
                        className="text-xs text-zinc-500 hover:text-white mb-2"
                    >
                        ← Start Over
                    </button>

                    {/* Titles */}
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Viral Title Options</div>
                        {result.title_options?.map((t, i) => (
                            <div key={i} className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-pink-500/30 transition-all cursor-pointer">
                                <span className="text-sm text-white font-medium">{t.title}</span>
                                <span className={clsx(
                                    "text-xs px-2 py-0.5 rounded font-bold",
                                    t.score > 90 ? "bg-green-900/40 text-green-400" : "bg-yellow-900/40 text-yellow-400"
                                )}>
                                    {t.score}%
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Smart Description</div>
                        <div className="p-3 bg-black/50 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {result.description_blueprint?.hook_first_line}
                            {"\n\n"}
                            {/* Simulate content */}
                            [Content Summary...]
                            {"\n\n"}
                            {result.description_blueprint?.hashtags?.join(" ")}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Optimized Tags</div>
                        <div className="flex flex-wrap gap-2">
                            {result.tags?.map((tag, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-400">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Advice */}
                    <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-white/10 rounded-lg flex items-start gap-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Zap className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Upload Strategy</h4>
                            <p className="text-xs text-zinc-400">
                                Post today at <span className="text-white font-bold">{result.upload_strategy?.best_time_today}</span>.
                                <br />
                                Tease in community tab with: "{result.upload_strategy?.community_post_teaser}"
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
