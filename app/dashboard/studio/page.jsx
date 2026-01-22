"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Upload, Search, Activity, Zap, BarChart3, Clock, Globe, FileVideo } from "lucide-react";
import clsx from "clsx";
import { runChannelAuditAction, optimizeUploadAction } from "@/app/actions/agent";
import { uploadVideoAction } from "@/app/actions/youtube";
import NicheScouterView from "@/components/modules/niche-scouter/NicheScouterView";

export default function StudioPage() {
    const [mode, setMode] = useState("growth"); // 'growth' | 'niche'

    return (
        <div className="min-h-full p-6 space-y-8 flex flex-col h-screen">
            <header className="flex items-center justify-between border-b border-white/10 pb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Top Creator Studio
                    </h1>
                    <p className="text-zinc-500 mt-1">AI-Powered Channel Intelligence & Upload Optimization</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setMode("growth")}
                        className={clsx(
                            "px-4 py-2 rounded-md text-sm font-bold transition-all",
                            mode === "growth" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"
                        )}
                    >
                        Growth Mode
                    </button>
                    <button
                        onClick={() => setMode("niche")}
                        className={clsx(
                            "px-4 py-2 rounded-md text-sm font-bold transition-all",
                            mode === "niche" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"
                        )}
                    >
                        Niche Lab (New)
                    </button>
                </div>
            </header>

            {mode === "growth" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto pb-20">
                    <ChannelAuditor />
                    <SmartUploader />
                </div>
            ) : (
                <div className="flex-1 min-h-0 bg-transparent">
                    <NicheScouterView />
                </div>
            )}
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

    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [useSmartSchedule, setUseSmartSchedule] = useState(true);
    const { config } = useAppStore();

    const handleOptimize = async () => {
        if (!topic && !file) return;
        setIsLoading(true);

        const formData = new FormData();
        formData.append("topic", topic || file?.name);
        formData.append("filename", file?.name || "untitled.mp4");
        formData.append("uploadsPerDay", config.targetUploadsPerDay || 1);

        const data = await optimizeUploadAction(formData);
        if (data) setResult(data);

        setIsLoading(false);
    };

    const handlePublish = async () => {
        if (!file || !result) return;
        setIsUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", result.title_options?.[0]?.title || result.title_options?.[0] || "New Video");
            formData.append("description",
                `${result.description_blueprint?.hook_first_line}\n\n${result.description_blueprint?.content_summary}\n\n${result.description_blueprint?.hashtags?.join(" ")}`
            );
            formData.append("tags", result.tags?.join(",") || "");

            if (useSmartSchedule && result.upload_strategy?.scheduled_publish_time) {
                formData.append("publishAt", result.upload_strategy.scheduled_publish_time);
            }

            const response = await uploadVideoAction(formData);
            if (response.error) throw new Error(response.error);
            setUploadResult(response);
            setResult(null);
            setFile(null);
        } catch (e) {
            console.error(e);
            alert("Upload Failed: " + e.message);
        } finally {
            setIsUploading(false);
        }
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
                                    Optimizing Metadata...
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
                            {result.description_blueprint?.content_summary || "[AI is writing summary...]"}
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

                    {/* Scheduling Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-white">Smart Schedule</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={useSmartSchedule} onChange={() => setUseSmartSchedule(!useSmartSchedule)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    <button
                        onClick={handlePublish}
                        disabled={isUploading}
                        className={clsx(
                            "w-full py-4 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-4",
                            useSmartSchedule ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-900/20" : "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20"
                        )}
                    >
                        {isUploading ? (
                            <>
                                <Zap className="w-5 h-5 animate-spin" />
                                {useSmartSchedule ? "Scheduling..." : "Uploading..."}
                            </>
                        ) : (
                            useSmartSchedule ? (
                                <>
                                    <Clock className="w-5 h-5" />
                                    Schedule for {new Date(result.upload_strategy?.scheduled_publish_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    🚀 Publish Now (Private)
                                </>
                            )
                        )}
                    </button>

                </div>
            )}

            {uploadResult && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-8">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-900/20">
                        <Upload className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Upload Complete!</h3>
                    <p className="text-zinc-400 max-w-xs text-center">
                        Your video is now processing on YouTube. It is set to <strong>Private</strong> for safety.
                    </p>
                    <a
                        href={uploadResult.videoUrl}
                        target="_blank"
                        className="text-pink-400 hover:text-pink-300 underline font-mono"
                    >
                        {uploadResult.videoUrl}
                    </a>
                    <button
                        onClick={() => { setUploadResult(null); setFile(null); setTopic(""); }}
                        className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold text-sm transition-all"
                    >
                        Upload Another
                    </button>
                </div>
            )}
        </div>
    );
}
