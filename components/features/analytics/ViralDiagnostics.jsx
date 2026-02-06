"use client";

import { useState } from "react";
import { runViralDiagnosisAction } from "@/app/actions/gemini";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Activity, BrainCircuit, XCircle } from "lucide-react";
import clsx from "clsx";

export default function ViralDiagnostics() {
    const [videoId, setVideoId] = useState("");
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!videoId) return;
        setLoading(true);
        setReport(null);
        setError(null);
        try {
            const result = await runViralDiagnosisAction(videoId);
            if (result.error) {
                setError(result.error);
            } else if (!result.diagnosis_summary) {
                setError("Could not analyze video. Please check the ID.");
            } else {
                setReport(result);
            }
        } catch (e) {
            console.error(e);
            setError("System Error: Failed to run diagnosis.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                    <Activity className="text-destructive" />
                    Algorithm Auditor
                </h2>
                <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    DIAGNOSTIC_MODE_ACTIVE
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Paste YouTube Video ID (e.g., dQw4w9WgXcQ)"
                            value={videoId}
                            onChange={(e) => setVideoId(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-black/5 transition-all text-black placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !videoId}
                        className="bg-destructive hover:bg-destructive/90 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {loading ? "Scanning..." : "Diagnose"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {report && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* Diagnosis Card */}
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 col-span-2">
                        <h3 className="text-destructive font-bold mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            CRITICAL DIAGNOSIS
                        </h3>
                        <p className="text-xl font-medium text-foreground mb-6">
                            "{report.diagnosis_summary}"
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {report.algorithm_blocks?.map((block, i) => (
                                <div key={i} className="bg-background p-4 rounded-lg text-center border border-border shadow-sm">
                                    <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-bold">{block.stage}</div>
                                    <div className={clsx(
                                        "text-lg font-bold mb-2",
                                        block.status === "Blocked" || block.status === "Weak" ? "text-destructive" : "text-success"
                                    )}>
                                        {block.status}
                                    </div>
                                    <div className="text-xs text-muted-foreground leading-relaxed">{block.reason}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deep Analysis */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                            <BrainCircuit className="w-5 h-5 text-primary" />
                            Why No Audience?
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            {report.why_no_audience}
                        </p>
                    </div>

                    {/* Action Plan */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 text-foreground">Immediate Fixes</h3>
                        <ul className="space-y-4">
                            {report.fix_plan?.map((step, i) => (
                                <li key={i} className="flex gap-3 text-sm text-foreground">
                                    <span className="bg-secondary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-secondary-foreground">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
