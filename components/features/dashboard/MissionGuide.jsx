"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ChevronRight, CheckCircle, Target, Lock, PlayCircle, Map, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const MISSIONS = [
    {
        id: 0,
        title: "Intel Gathering",
        description: "Identify a high-velocity trend to ride.",
        action: "Go to Niche Studio",
        href: "/dashboard/studio",
        icon: Target
    },
    {
        id: 1,
        title: "Strategy Formulation",
        description: "Generate a script blueprint for your video.",
        action: "Go to Creator",
        href: "/dashboard/director",
        icon: Map
    },
    {
        id: 2,
        title: "Viral Prediction",
        description: "Test your concept against the AI Oracle.",
        action: "Check Probability",
        href: "/dashboard/director", // Same page, different action
        icon: Sparkles
    },
    {
        id: 3,
        title: "Production & Launch",
        description: "Generate/Upload video and verify schedule.",
        action: "Upload Video",
        href: "/dashboard/director",
        icon: PlayCircle
    },
    {
        id: 4,
        title: "Performance Review",
        description: "Audit your growth metrics.",
        action: "Audit Channel",
        href: "/dashboard/audit",
        icon: AlertCircle
    }
];

export default function MissionGuide() {
    const { activeMissionStep, setMissionStep, completeMissionStep } = useAppStore();
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);

    // Auto-collapse when inactive, expand on hover? 
    // For now, toggle button.

    // Auto-advance logic simulation (In reality, this would be triggered by specific actions in those components)
    // Here we just allow manual override or simple path detection for demo
    useEffect(() => {
        // Example: If we visit the page relevant to the step, maybe highlight it?
        // We won't auto-complete steps just by visiting, but we can guide them.
    }, [pathname]);

    const currentMission = MISSIONS[activeMissionStep] || MISSIONS[MISSIONS.length - 1];
    const isComplete = activeMissionStep >= MISSIONS.length;

    if (isComplete) {
        return (
            <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-10">
                <div className="bg-green-500/10 border border-green-500/20 backdrop-blur-md p-4 rounded-xl shadow-2xl flex items-center gap-4">
                    <div className="bg-green-500 text-black p-2 rounded-full">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-green-500">Daily Mission Complete</h3>
                        <p className="text-xs text-green-200">System is optimized for growth.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-20 right-6 z-40 flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-2">
                {/* Minimized / Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="bg-zinc-900/90 backdrop-blur border border-white/10 p-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-zinc-800 transition-all group"
                >
                    <div className={clsx("w-3 h-3 rounded-full animate-pulse",
                        activeMissionStep === 0 ? "bg-blue-500" : "bg-accent"
                    )} />
                    <span className="text-xs font-bold font-mono text-zinc-300 group-hover:text-white">
                        STEP {activeMissionStep + 1}/{MISSIONS.length}: {currentMission.title}
                    </span>
                    <ChevronRight className={clsx("w-4 h-4 transition-transform", isExpanded ? "rotate-90" : "")} />
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl w-80 shadow-2xl origin-top-right"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-accent/10 rounded-xl border border-accent/20">
                                        <currentMission.icon className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-sm">{currentMission.title}</h3>
                                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                                            {currentMission.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent transition-all duration-500 ease-out"
                                        style={{ width: `${((activeMissionStep) / MISSIONS.length) * 100}%` }}
                                    />
                                </div>

                                <Link
                                    href={currentMission.href}
                                    onClick={() => {
                                        // Optional: Auto-collapse on click or keep open
                                    }}
                                    className="flex items-center justify-between w-full bg-white text-black py-2.5 px-4 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-[1.02] shadow-lg active:scale-95"
                                >
                                    <span>{currentMission.action}</span>
                                    <div className="w-5 h-5 bg-black/10 rounded-full flex items-center justify-center">
                                        <ChevronRight className="w-3 h-3" />
                                    </div>
                                </Link>

                                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                    <button
                                        onClick={() => setMissionStep(Math.max(0, activeMissionStep - 1))}
                                        className="text-[10px] text-zinc-600 hover:text-zinc-400 uppercase font-bold tracking-wider"
                                    >
                                        Prev Step
                                    </button>
                                    <button
                                        onClick={() => completeMissionStep(activeMissionStep)}
                                        className="text-[10px] text-zinc-500 hover:text-green-400 uppercase font-bold tracking-wider flex items-center gap-1"
                                    >
                                        Skip / Mark Done <CheckCircle className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export { MISSIONS }; // Export for sidebar sync usage if needed
