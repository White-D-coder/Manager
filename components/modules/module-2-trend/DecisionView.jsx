"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { DecisionEngine } from "@/lib/brain/DecisionEngine";

import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, CheckCircle, XCircle, Sparkles, MessageSquare, Tag, Terminal, Send, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { analyzeWithGemini, analyzeSingleVideoAction, chatWithVideoAgentAction, analyzeUploadTimingAction } from "@/app/actions/gemini";

export default function DecisionView() {
    const { currentTrends, config, setModule, setSelectedTrend, selectedTrend, addLog } = useAppStore();

    // --- LEGACY STATE (Comparison) ---
    const [analyzingIndex, setAnalyzingIndex] = useState(0);
    const [complete, setComplete] = useState(false);
    const [winner, setWinner] = useState(null);
    const [scoredTrends, setScoredTrends] = useState([]);

    // --- NEW DASHBOARD STATE ---
    const [dashboardData, setDashboardData] = useState(null);
    const [momentumData, setMomentumData] = useState(null); // Global Analysis State
    const [isAnalyzingSingle, setIsAnalyzingSingle] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef(null);

    // 1. Initial Logic: If no video selected, run legacy comparison
    useEffect(() => {
        if (!selectedTrend && currentTrends.length > 0 && !momentumData) {
            runMomentumAnalysis(currentTrends);
        } else if (selectedTrend && !dashboardData && !isAnalyzingSingle) {
            runSingleAnalysis(selectedTrend);
        }
    }, [selectedTrend, currentTrends]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const runMomentumAnalysis = async (trends) => {
        setIsAnalyzingSingle(true); // Reuse loading state
        try {
            const result = await analyzeUploadTimingAction(trends);
            if (result) setMomentumData(result);
        } catch (e) { console.error(e); }
        setIsAnalyzingSingle(false);
    };

    const runSingleAnalysis = async (video) => {
        setIsAnalyzingSingle(true);
        addLog({ module: 'StrategyAI', level: 'info', message: `Deconstructing Viral DNA for: ${video.title}` });

        try {
            // Call the NEW method (Server Action)
            const result = await analyzeSingleVideoAction(video);
            if (result) {
                setDashboardData(result);
                addLog({ module: 'StrategyAI', level: 'success', message: 'Viral Strategy Generated.' });
                // Initialize Chat
                setChatHistory([
                    { role: 'ai', text: `I've analyzed "${video.title}". I found a ${result.viral_dna?.emotional_driver?.toLowerCase()} driver. What would you like to refine?` }
                ]);
            }
        } catch (e) {
            console.error("Dashboard Error", e);
        }
        setIsAnalyzingSingle(false);
    };

    const handleChat = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
        setChatInput("");
        setIsThinking(true);

        // Call Gemini Chat (Server Action)
        const context = { video: selectedTrend, analysis: dashboardData };
        const response = await chatWithVideoAgentAction(userMsg, context);

        setChatHistory(prev => [...prev, { role: "ai", text: response }]);
        setIsThinking(false);
    };

    // --- RENDER DASHBOARD (If Selected) ---
    if (selectedTrend) {
        return (
            <div className="h-full flex flex-col p-6 gap-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                        <h3 className="flex items-center gap-2 text-accent font-mono text-xl">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            VIRAL_INTELLIGENCE // {selectedTrend.title.substring(0, 30)}...
                        </h3>
                        <div className="flex gap-4 mt-1 text-xs font-mono text-zinc-500">
                            <span>VELOCITY: <span className="text-white">{Math.round(selectedTrend.view_velocity)} v/h</span></span>
                            <span>RATIO: <span className="text-white">{selectedTrend.viral_ratio}x</span></span>
                        </div>
                    </div>
                    <button onClick={() => setModule(3)} className="bg-primary/20 text-primary border border-primary/50 px-4 py-2 rounded font-mono text-xs hover:bg-primary/30 flex items-center gap-2">
                        GENERATE SCRIPT <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                {/* INTELLIGENCE HEADER */}
                <div className="bg-surface border border-white/10 p-4 rounded-lg flex gap-6 text-sm text-zinc-400">
                    <div className="flex-1 space-y-2">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-2">
                            <Tag className="w-3 h-3" /> CONTENT INTELLIGENCE
                        </div>
                        <div className="text-white font-medium leading-relaxed">
                            {dashboardData?.content_intelligence?.brief || "Analyzing video content..."}
                        </div>
                        <div className="flex gap-4 text-xs mt-2">
                            <span className="bg-black/40 px-2 py-1 rounded text-zinc-300">📅 {new Date(selectedTrend.published_at).toLocaleDateString()} {new Date(selectedTrend.published_at).toLocaleTimeString()}</span>
                            <span className="bg-black/40 px-2 py-1 rounded text-zinc-300">👥 {parseInt(selectedTrend.subscriber_count).toLocaleString()} Subs</span>
                            <span className="bg-black/40 px-2 py-1 rounded text-zinc-300">👀 {parseInt(selectedTrend.views).toLocaleString()} Views</span>
                            <span className="bg-black/40 px-2 py-1 rounded text-zinc-300">👍 {parseInt(selectedTrend.likes).toLocaleString()} Likes</span>
                        </div>
                    </div>
                    <div className="w-1/3 border-l border-white/10 pl-6 space-y-2">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">AI DESCRIPTION ANALYSIS</div>
                        <div className="text-xs italic text-zinc-400">
                            "{dashboardData?.content_intelligence?.description_analysis || "checking..."}"
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mt-2">ORIGINAL DESC</div>
                        <div className="text-[10px] bg-black/40 p-2 rounded max-h-16 overflow-y-auto font-mono text-zinc-500">
                            {selectedTrend.description || "No description provided."}
                        </div>
                    </div>
                </div>

                {/* ENGAGEMENT ANALYST DEEP DIVE */}
                {dashboardData?.engagement_analysis && (
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1 bg-surface border border-blue-500/20 p-4 rounded-lg">
                            <div className="text-[10px] text-blue-400 uppercase font-bold mb-2">Core Content Type</div>
                            <div className="text-sm text-white font-medium capitalize">{dashboardData.engagement_analysis.core_content_type}</div>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mt-4 mb-2">Target Audience</div>
                            <div className="text-xs text-zinc-300 leading-relaxed">{dashboardData.engagement_analysis.target_audience}</div>
                        </div>
                        <div className="col-span-1 bg-surface border border-purple-500/20 p-4 rounded-lg">
                            <div className="text-[10px] text-purple-400 uppercase font-bold mb-2">Hook Psychology (0-5s)</div>
                            <div className="text-xs text-zinc-300 mb-2"><span className="text-purple-300">Tactic:</span> {dashboardData.engagement_analysis.hook_analysis?.tactic}</div>
                            <div className="text-xs text-zinc-400 italic">"{dashboardData.engagement_analysis.hook_analysis?.why_it_works}"</div>
                        </div>
                        <div className="col-span-1 bg-surface border border-green-500/20 p-4 rounded-lg">
                            <div className="text-[10px] text-green-400 uppercase font-bold mb-2">Engagement Drivers</div>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {dashboardData.engagement_analysis.engagement_drivers?.emotions?.map(e => (
                                    <span key={e} className="text-[10px] bg-green-500/10 text-green-300 px-1.5 py-0.5 rounded">{e}</span>
                                ))}
                            </div>
                            <div className="text-[10px] text-zinc-500">Curiosity: <span className="text-zinc-300">{dashboardData.engagement_analysis.engagement_drivers?.curiosity_gaps}</span></div>
                        </div>
                        <div className="col-span-1 bg-surface border border-white/10 p-4 rounded-lg">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Community Sentiment</div>
                            <div className="text-sm text-white capitalize mb-1">{dashboardData.engagement_analysis.comment_sentiment}</div>
                            <div className="text-[10px] text-zinc-400 leading-snug">"{dashboardData.engagement_analysis.why_this_works}"</div>
                        </div>
                    </div>
                )}

                {dashboardData ? (
                    <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">

                        {/* LEFT: DIRECTOR'S BLUEPRINT */}
                        <div className="col-span-7 flex flex-col gap-6 overflow-y-auto pr-2">

                            {/* 1. CONCEPT & GAP */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface border border-primary/20 p-4 rounded-lg">
                                    <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> VIRAL GAP ANALYSIS
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="text-[10px] text-zinc-500 uppercase">Opportunity</div>
                                        <div className="text-sm text-zinc-300 font-medium">{dashboardData.viral_gap_analysis?.opportunity || "Analyzing..."}</div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {dashboardData.viral_gap_analysis?.current_flaws?.map((flaw, i) => (
                                                <span key={i} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                                                    Fix: {flaw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-surface border border-white/10 p-4 rounded-lg">
                                    <h4 className="text-xs font-bold text-white mb-2">CORE EMOTIONAL PROMISE</h4>
                                    <div className="text-sm text-zinc-300 italic">"{dashboardData.video_concept?.emotional_promise || "Defining..."}"</div>
                                    <div className="mt-3 flex gap-2">
                                        {dashboardData.video_concept?.primary_emotion && (
                                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                                Emotion: {dashboardData.video_concept.primary_emotion}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 2. SCRIPT STRUCTURE */}
                            <div className="bg-surface border border-white/10 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-zinc-500" />
                                    SECOND-BY-SECOND SCRIPT
                                </h4>
                                {dashboardData.script_structure && (
                                    <div className="space-y-4">
                                        {/* Hook */}
                                        <div className="border-l-2 border-primary pl-3">
                                            <div className="flex justify-between text-[10px] text-primary font-bold uppercase mb-1">
                                                <span>0-3s HOOK</span>
                                                <span>{dashboardData.script_structure.hook_0_3s?.emotion}</span>
                                            </div>
                                            <div className="text-sm text-white font-mono bg-black/40 p-2 rounded mb-1">
                                                "{dashboardData.script_structure.hook_0_3s?.words}"
                                            </div>
                                            <div className="text-[10px] text-zinc-500 flex gap-4">
                                                <span>🎥 {dashboardData.script_structure.hook_0_3s?.camera_angle}</span>
                                                <span>🙂 {dashboardData.script_structure.hook_0_3s?.facial_expression}</span>
                                            </div>
                                        </div>

                                        {/* Engagement */}
                                        <div className="border-l-2 border-blue-500 pl-3">
                                            <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">3-15s ENGAGEMENT</div>
                                            <div className="text-xs text-zinc-300 grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-zinc-500 block text-[9px]">VISUAL PACING</span>
                                                    {dashboardData.script_structure.engagement_3_15s?.visual_pacing}
                                                </div>
                                                <div>
                                                    <span className="text-zinc-500 block text-[9px]">SOUND DESIGN</span>
                                                    {dashboardData.script_structure.engagement_3_15s?.sound_design}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Value & Payoff */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border-l-2 border-zinc-700 pl-3">
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">CORE VALUE</div>
                                                <div className="text-xs text-zinc-400">{dashboardData.script_structure.core_value}</div>
                                            </div>
                                            <div className="border-l-2 border-green-500 pl-3">
                                                <div className="text-[10px] text-green-400 font-bold uppercase mb-1">PAYOFF</div>
                                                <div className="text-xs text-zinc-400">{dashboardData.script_structure.payoff}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. PRODUCTION GUIDE */}
                            {dashboardData.production_guide && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-black/20 p-3 rounded border border-white/5">
                                        <div className="text-[10px] text-zinc-500 uppercase mb-2">Camera Logic</div>
                                        <div className="text-xs text-zinc-300 space-y-1">
                                            <div className="flex justify-between"><span>Angle:</span> <span className="text-white">{dashboardData.production_guide.camera?.angle}</span></div>
                                            <div className="flex justify-between"><span>Move:</span> <span className="text-white">{dashboardData.production_guide.camera?.movement}</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded border border-white/5">
                                        <div className="text-[10px] text-zinc-500 uppercase mb-2">Lighting</div>
                                        <div className="text-xs text-zinc-300 space-y-1">
                                            <div><span className="text-zinc-500">Key:</span> {dashboardData.production_guide.lighting?.key_light}</div>
                                            <div><span className="text-zinc-500">Mood:</span> {dashboardData.production_guide.lighting?.emotional_impact}</div>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded border border-white/5">
                                        <div className="text-[10px] text-zinc-500 uppercase mb-2">Audio Direction</div>
                                        <div className="text-xs text-zinc-300">
                                            {dashboardData.production_guide.audio?.voice_pace}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* RIGHT: CHAT & METADATA */}
                        <div className="col-span-5 flex flex-col gap-4 h-full">

                            {/* Metadata Card */}
                            <div className="bg-surface border border-white/10 p-3 rounded shrink-0">
                                <div className="text-[10px] text-zinc-500 uppercase mb-2">Winning Title Options</div>
                                <div className="space-y-2">
                                    {dashboardData.packaging?.title_options?.map((t, i) => (
                                        <div key={i} className="text-xs text-green-400 font-mono bg-green-500/5 p-2 rounded border border-green-500/10 hover:border-green-500/30 transition-colors cursor-copy">
                                            {t}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chat Interface (Preserved) */}
                            <div className="flex-1 flex flex-col bg-black/20 border border-white/10 rounded overflow-hidden min-h-0">
                                <div className="bg-white/5 p-3 border-b border-white/10 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-accent" />
                                    <span className="text-xs font-mono text-zinc-300">VIRAL_STRATEGIST_BOT</span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={clsx("flex flex-col max-w-[90%]", msg.role === 'user' ? "ml-auto items-end" : "items-start")}>
                                            <div className={clsx("p-2 rounded text-xs leading-relaxed",
                                                msg.role === 'user' ? "bg-accent text-black rounded-tr-none" : "bg-white/10 text-zinc-300 rounded-tl-none")}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isThinking && (
                                        <div className="flex items-start">
                                            <div className="bg-white/10 p-2 rounded text-xs text-zinc-500 italic animate-pulse">Thinking...</div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-3 border-t border-white/10 flex gap-2">
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                        placeholder="Discuss lighting..."
                                        className="flex-1 bg-black/50 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                                    />
                                    <button onClick={handleChat} disabled={isThinking} className="p-2 bg-white/10 hover:bg-white/20 rounded text-webhook">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <BrainCircuit className="w-12 h-12 text-accent animate-pulse" />
                        <div className="font-mono text-sm text-zinc-400">DECONSTRUCTING VIRAL DNA...</div>
                    </div>
                )}
            </div>
        );
    }

    // --- GLOBAL MOMENTUM ANALYSIS (No Video Selected) ---
    return (
        <div className="h-full flex flex-col p-6 gap-6">
            <div className="flex items-center gap-2 text-accent font-mono text-xl border-b border-white/10 pb-4">
                <BrainCircuit className="w-6 h-6" />
                GLOBAL_MOMENTUM_ANALYSIS
            </div>

            {momentumData ? (
                <div className="flex-1 grid grid-cols-2 gap-6">
                    {/* LEFT: RECOMMENDATION */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-surface border border-primary/40 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-4">
                            <div className="text-xs text-primary font-bold uppercase tracking-widest">Recommended Action</div>
                            <div className="text-3xl text-white font-mono font-bold">{momentumData.recommendation?.action}</div>
                            <div className="text-sm text-zinc-400 max-w-md">"{momentumData.recommendation?.reason}"</div>
                        </div>
                        <div className="bg-surface border border-white/10 p-4 rounded-lg flex-1">
                            <div className="text-xs text-zinc-500 font-bold uppercase mb-4">Upcoming Hot Window</div>
                            <div className="text-xl text-white font-mono mb-1">{momentumData.next_hot_window?.day} @ {momentumData.next_hot_window?.time}</div>
                            <div className="text-xs text-orange-400 border border-orange-500/20 bg-orange-500/10 px-2 py-1 inline-block rounded">High Intensity Predicted</div>
                        </div>
                    </div>

                    {/* RIGHT: DATA GRID */}
                    <div className="bg-surface border border-white/10 p-6 rounded-lg overflow-y-auto">
                        <div className="text-xs text-zinc-500 font-bold uppercase mb-4">Peak Windows Per Day</div>
                        <div className="space-y-3">
                            {momentumData.peak_windows?.map((w, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-zinc-300 font-mono text-sm w-24">{w.day}</span>
                                    <span className="text-accent text-sm">{w.window}</span>
                                    <span className="text-[10px] text-zinc-500">{w.intensity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8">
                            <div className="text-xs text-zinc-500 font-bold uppercase mb-4">Best Time by Weekday</div>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(momentumData.best_times_by_day || {}).map(([day, time]) => (
                                    <div key={day} className="bg-black/20 p-2 rounded flex justify-between">
                                        <span className="text-zinc-400 text-xs">{day}</span>
                                        <span className="text-white text-xs font-mono">{time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    {isAnalyzingSingle ? (
                        <>
                            <BrainCircuit className="w-12 h-12 text-accent animate-pulse" />
                            <div className="font-mono text-sm text-zinc-400">ANALYZING UPLOAD MOMENTUM...</div>
                        </>
                    ) : (
                        <div className="text-zinc-500 font-mono">WAITING FOR TREND DATA...</div>
                    )}
                </div>
            )}
        </div>
    );
}
