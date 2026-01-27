"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Upload, Play, CheckCircle, Video, Copy, MonitorPlay, Calendar } from "lucide-react";
import { generateScratchIdeasAction, generateScratchScriptAction, finalizeScratchUploadAction, getWeeklyScheduleAction } from "@/app/actions/scratch";
import clsx from "clsx";

export default function ScratchStudio() {
    const [step, setStep] = useState(1); // 1: Topic, 2: Blueprint, 3: Upload, 4: Done
    const [topic, setTopic] = useState("");
    const [ideas, setIdeas] = useState([]);
    const [weeklySchedule, setWeeklySchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [script, setScript] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, done
    const [finalData, setFinalData] = useState(null);

    useEffect(() => {
        // Load schedule immediately for context
        getWeeklyScheduleAction().then(res => setWeeklySchedule(res));
    }, []);

    const handleGetIdeas = async () => {
        setLoading(true);
        const res = await generateScratchIdeasAction();
        setIdeas(res);
        setLoading(false);
    };

    const handleGenerateBlueprint = async () => {
        if (!topic) return;
        setLoading(true);
        const res = await generateScratchScriptAction(topic);
        setScript(res);
        setStep(2);
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadStatus("uploading");
        setStep(3); // Visual transition

        const formData = new FormData();
        formData.append("file", file);

        const result = await finalizeScratchUploadAction(formData, { topic, title: script?.title }); // Pass context

        if (result.success) {
            setFinalData(result);
            setStep(4);
            setUploadStatus("done");
        } else {
            alert("Upload Failed: " + result.error);
            setUploadStatus("idle");
            setStep(2); // Go back
        }
    };

    return (
        <div className="h-full bg-background p-8 flex flex-col max-w-5xl mx-auto">

            {/* PROGRESS HEADER */}
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-accent" />
                    AI Director Mode
                </h1>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={clsx("w-3 h-3 rounded-full transition-all",
                            step >= s ? "bg-accent" : "bg-zinc-800"
                        )} />
                    ))}
                </div>
            </div>

            {/* STEP 1: IDEATION */}
            {step === 1 && (
                <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center space-y-2 py-10">
                        <h2 className="text-4xl font-bold text-white">What should we create?</h2>
                        <p className="text-zinc-400">Enter a niche or let the AI suggest a viral winner.</p>
                    </div>

                    <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
                        <div className="flex gap-2">
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Psychology Facts, Dark History..."
                                className="flex-1 bg-zinc-900 border border-white/10 p-4 rounded-xl text-lg outline-none focus:border-accent"
                            />
                            <button
                                onClick={handleGenerateBlueprint}
                                disabled={!topic || loading}
                                className="bg-accent text-black px-6 rounded-xl font-bold hover:bg-accent-hover disabled:opacity-50"
                            >
                                {loading ? "Thinking..." : <ArrowRight />}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleGetIdeas}
                                className="col-span-2 text-xs text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-1 py-2"
                            >
                                <Sparkles className="w-3 h-3" /> Note sure? Ask AI for ideas
                            </button>

                            {ideas.map((idea, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTopic(idea)}
                                    className="bg-surface border border-white/5 p-3 rounded-lg text-sm text-zinc-300 hover:bg-white/5 text-left"
                                >
                                    {idea}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: BLUEPRINT & PRODUCTION */}
            {step === 2 && script && (
                <div className="flex-1 flex gap-6 animate-in fade-in slide-in-from-bottom-4 min-h-0">
                    {/* SCRIPT COL */}
                    <div className="w-1/2 bg-surface rounded-xl border border-white/10 p-6 overflow-y-auto">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4">Script Blueprint</h3>
                        <div className="space-y-6">
                            {script.sections.map((sec, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="text-xs font-mono text-accent">{sec.type.toUpperCase()}</div>
                                    <p className="text-lg font-medium text-white">{sec.text}</p>
                                    <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                                        <div className="text-[10px] text-zinc-500 mb-1 flex items-center gap-1">
                                            <Video className="w-3 h-3" /> VISUAL PROMPT
                                        </div>
                                        <p className="text-zinc-400 text-sm italic">{sec.visual}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTIONS COL */}
                    <div className="w-1/2 flex flex-col gap-4">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 flex-1">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4 flex items-center gap-2">
                                <MonitorPlay className="w-4 h-4" />
                                Generative Directives
                            </h3>
                            <div className="space-y-4">
                                {script.sections.map((sec, i) => (
                                    <div key={i} className="group relative">
                                        <div className="text-[10px] text-accent mb-1">SCENE {i + 1} PROMPT</div>
                                        <div className="bg-black p-3 rounded-lg border border-white/10 text-xs text-zinc-300 font-mono break-all pr-8">
                                            {sec.visual_gen_prompt}
                                        </div>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(sec.visual_gen_prompt)}
                                            className="absolute right-2 top-6 text-zinc-600 hover:text-white"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-surface rounded-xl border border-white/10 p-6">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4">Ready to Launch?</h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                Once you have generated the video using these prompts, verify it and drop it here.
                                We will handle metadata and schedule it <b>5 mins before peak</b>.
                            </p>

                            <label className={clsx("flex items-center justify-center gap-3 w-full p-4 rounded-xl border-dashed border-2 cursor-pointer transition-all",
                                uploadStatus === 'uploading'
                                    ? "bg-zinc-900 border-accent/20 text-accent"
                                    : "bg-accent border-accent text-black hover:bg-accent-hover"
                            )}>
                                <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} disabled={uploadStatus === 'uploading'} />
                                {uploadStatus === 'uploading' ? (
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Upload className="w-5 h-5" />
                                )}
                                <span className="font-bold">
                                    {uploadStatus === 'uploading' ? "PROCESSING & SCHEDULING..." : "UPLOAD FINAL VIDEO"}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && finalData && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in zoom-in-95">
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Mission Accomplished</h2>
                    <div className="bg-surface border border-white/10 p-6 rounded-xl max-w-lg w-full space-y-4">
                        <div>
                            <div className="text-xs text-zinc-500 uppercase">Scheduled For</div>
                            <div className="text-xl font-mono text-accent">{new Date(finalData.scheduledTime).toLocaleString()}</div>
                            <div className="text-xs text-zinc-500 mt-1">Reason: {finalData.metadata?.scheduleReason || "Peak Optimization"} (5 mins before peak)</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-zinc-500 uppercase">Title</div>
                                <div className="text-sm text-white line-clamp-2">{finalData.metadata.title}</div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 uppercase">Tags</div>
                                <div className="text-sm text-white line-clamp-1">{finalData.metadata.tags.slice(0, 3).join(", ")}</div>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => { setStep(1); setTopic(""); setScript(null); }} className="text-zinc-500 hover:text-white">
                        Start New Project
                    </button>
                </div>
            )}
        </div>
    );
}
