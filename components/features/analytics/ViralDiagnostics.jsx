"use client";

import { useState } from "react";
import { runViralDiagnosisAction } from "@/app/actions/gemini";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Activity, BrainCircuit } from "lucide-react";

export default function ViralDiagnostics() {
    const [videoId, setVideoId] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!videoId) return;
        setLoading(true);
        setReport(null);
        try {
            // New Action to bridge UI -> GeminiBrain.diagnoseVideoHealth
            const result = await runViralDiagnosisAction(videoId);
            setReport(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="text-red-500" />
                    Algorithm Auditor
                </h2>
                <div className="text-xs text-zinc-500 font-mono">
                    DIAGNOSTIC_MODE_ACTIVE
                </div>
            </div>

            <div className="bg-surface border border-white/10 rounded-xl p-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Paste YouTube Video ID (e.g., dQw4w9WgXcQ)"
                            value={videoId}
                            onChange={(e) => setVideoId(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-red-500 transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !videoId}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? "Scanning..." : "Diagnose"}
                    </button>
                </div>
            </div>

            {report && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* Diagnosis Card */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 col-span-2">
                        <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            CRITICAL DIAGNOSIS
                        </h3>
                        <p className="text-xl font-medium text-white mb-4">
                            "{report.diagnosis_summary}"
                        </p>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            {report.algorithm_blocks?.map((block, i) => (
                                <div key={i} className="bg-black/30 p-4 rounded-lg text-center border border-white/5">
                                    <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{block.stage}</div>
                                    <div className="text-lg font-bold text-white mb-2">{block.status}</div>
                                    <div className="text-xs text-zinc-400 leading-relaxed">{block.reason}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deep Analysis */}
                    <div className="bg-surface border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-purple-400" />
                            Why No Audience?
                        </h3>
                        <p className="text-zinc-300 leading-relaxed">
                            {report.why_no_audience}
                        </p>
                    </div>

                    {/* Action Plan */}
                    <div className="bg-surface border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Immediate Fixes</h3>
                        <ul className="space-y-3">
                            {report.fix_plan?.map((step, i) => (
                                <li key={i} className="flex gap-3 text-zinc-300">
                                    <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
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
