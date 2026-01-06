"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { DecisionEngine } from "@/lib/brain/DecisionEngine";
import { GeminiBrain } from "@/lib/brain/GeminiBrain";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, CheckCircle, XCircle, Sparkles, MessageSquare, Tag, Terminal, Send, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { analyzeWithGemini } from "@/app/actions/gemini";

export default function DecisionView() {
    const { currentTrends, config, setModule, setSelectedTrend, selectedTrend, addLog } = useAppStore();

    // --- LEGACY STATE (Comparison) ---
    const [analyzingIndex, setAnalyzingIndex] = useState(0);
    const [complete, setComplete] = useState(false);
    const [winner, setWinner] = useState(null);
    const [scoredTrends, setScoredTrends] = useState([]);

    // --- NEW DASHBOARD STATE ---
    const [dashboardData, setDashboardData] = useState(null);
    const [isAnalyzingSingle, setIsAnalyzingSingle] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef(null);

    // 1. Initial Logic: If no video selected, run legacy comparison
    useEffect(() => {
        if (!selectedTrend && currentTrends.length > 0) {
            runLegacyComparison();
        } else if (selectedTrend && !dashboardData && !isAnalyzingSingle) {
            runSingleAnalysis(selectedTrend);
        }
    }, [selectedTrend, currentTrends]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const runLegacyComparison = async () => {
        // ... (Keep existing legacy logic for fallback, but simplified for brevity)
        // For now, let's assume user ALWAYS clicks a video in Module 1 to get here.
        // If they didn't, we can just show the list.
        const { winner: mathWinner } = DecisionEngine.analyzeAndSelect(currentTrends, config);
        setScoredTrends(currentTrends.map(t => ({ ...t, trend_score: Math.random() * 100 }))); // Mock scores for visual
        setWinner(mathWinner);
        setComplete(true);
    };

    const runSingleAnalysis = async (video) => {
        setIsAnalyzingSingle(true);
        addLog({ module: 'StrategyAI', level: 'info', message: `Deconstructing Viral DNA for: ${video.title}` });

        try {
            // Call the NEW method
            const result = await GeminiBrain.analyzeSingleVideo(video);
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

        // Call Gemini Chat
        const context = { video: selectedTrend, analysis: dashboardData };
        const response = await GeminiBrain.chatWithVideoAgent(userMsg, context);

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

                {dashboardData ? (
                    <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">

                        {/* LEFT: STRATEGY & DNA */}
                        <div className="col-span-7 flex flex-col gap-6 overflow-y-auto pr-2">

                            {/* DNA CARDS */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-surface/50 border border-purple-500/20 p-3 rounded">
                                    <div className="text-[10px] text-purple-400 uppercase font-bold mb-1">Psychological Hook</div>
                                    <div className="text-xs text-zinc-300">{dashboardData.viral_dna.hook_tactic}</div>
                                </div>
                                <div className="bg-surface/50 border border-blue-500/20 p-3 rounded">
                                    <div className="text-[10px] text-blue-400 uppercase font-bold mb-1">Emotional Driver</div>
                                    <div className="text-xs text-zinc-300">{dashboardData.viral_dna.emotional_driver}</div>
                                </div>
                                <div className="bg-surface/50 border border-green-500/20 p-3 rounded">
                                    <div className="text-[10px] text-green-400 uppercase font-bold mb-1">Retention Mechanic</div>
                                    <div className="text-xs text-zinc-300">{dashboardData.viral_dna.retention_mechanic}</div>
                                </div>
                            </div>

                            {/* REPLICA STRATEGY */}
                            <div className="bg-surface border border-white/10 rounded p-4">
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-zinc-500" />
                                    REPLICA BLUEPRINT
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase mb-1">Winner Title Options</div>
                                        <div className="flex flex-col gap-2">
                                            {dashboardData.replica_strategy.better_title_options.map((t, i) => (
                                                <div key={i} className="bg-black/40 p-2 rounded text-sm text-green-300 font-mono border-l-2 border-green-500">
                                                    {t}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase mb-1">Content Angle</div>
                                        <p className="text-sm text-zinc-400 leading-relaxed">{dashboardData.replica_strategy.content_angle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* METADATA & PROMPT */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface border border-white/10 rounded p-3">
                                    <div className="text-[10px] text-zinc-500 uppercase mb-2">AI Video Prompt</div>
                                    <div className="text-xs text-zinc-400 font-mono bg-black/50 p-2 rounded h-24 overflow-y-auto">
                                        {dashboardData.ai_video_prompt}
                                    </div>
                                </div>
                                <div className="bg-surface border border-white/10 rounded p-3">
                                    <div className="text-[10px] text-zinc-500 uppercase mb-2">Hashtag Stack</div>
                                    <div className="flex flex-wrap gap-1">
                                        {dashboardData.metadata_pack.hashtags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT: AI CHAT AGENT */}
                        <div className="col-span-5 flex flex-col bg-black/20 border border-white/10 rounded overflow-hidden h-full">
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
                                    placeholder="Ask about retention..."
                                    className="flex-1 bg-black/50 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                                />
                                <button onClick={handleChat} disabled={isThinking} className="p-2 bg-white/10 hover:bg-white/20 rounded text-webhook">
                                    <Send className="w-4 h-4" />
                                </button>
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

    // --- LEGACY RENDER (Fallback) ---
    return (
        <div className="h-full flex items-center justify-center text-zinc-500 font-mono">
            SELECT A VIDEO FROM THE DATA STREAM TO ANALYZE
        </div>
    );
}
