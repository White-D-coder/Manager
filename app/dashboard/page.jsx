"use client";

import { useAppStore } from "@/lib/store";
import ConfigForm from "@/components/modules/module-0-input/ConfigForm";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const { isSystemActive } = useAppStore();

    return (
        <div className="min-h-full p-6">
            {!isSystemActive ? (
                <div className="h-full flex items-center justify-center">
                    <ConfigForm />
                </div>
            ) : (
                <ActiveSystemView />
            )}
        </div>
    );
}

function ActiveSystemView() {
    const { activeModuleId, winningNiche } = useAppStore();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full rounded-lg border border-border bg-black/50 overflow-hidden relative flex flex-col"
        >
            {/* Global Niche Banner */}
            {winningNiche && (
                <div className="bg-purple-900/30 border-b border-purple-500/30 p-2 px-6 flex items-center justify-between backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-xs font-bold text-purple-200 tracking-wider">WINNING STRATEGY DEPLOYED:</span>
                        <span className="text-sm font-mono font-bold text-purple-100 ml-2">{winningNiche}</span>
                    </div>

                    <a href="/dashboard/studio" className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded text-xs font-medium text-purple-300 transition-colors">
                        <Zap className="w-3 h-3" />
                        Studio
                    </a>
                </div>
            )}

            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at center, #00ff9d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            {activeModuleId === 1 && <DataStreamView />}

            {activeModuleId === 2 && <DecisionView />}

            {activeModuleId === 3 && <ScriptEditor />}

            {activeModuleId === 4 && <VideoStudioView />}

            {activeModuleId === 5 && <ThumbnailLab />}

            {activeModuleId >= 6 && <DeploymentCenter />}

            {activeModuleId === 0 && (
                <div className="h-full flex items-center justify-center text-zinc-500 font-mono">
                    SYSTEM STANDBY.
                </div>
            )}
        </motion.div>
    );
}

// Dynamic Imports to avoid SSR issues if needed, but for now direct import is fine.
// Dynamic Imports to avoid SSR issues if needed, but for now direct import is fine.
import DataStreamView from "@/components/modules/module-1-data/DataStreamView";
import DecisionView from "@/components/modules/module-2-trend/DecisionView";
import ScriptEditor from "@/components/modules/module-3-script/ScriptEditor";
import VideoStudioView from "@/components/modules/module-4-video/VideoStudioView";
import ThumbnailLab from "@/components/modules/module-5-thumb/ThumbnailLab";
import DeploymentCenter from "@/components/modules/module-6-schedule/DeploymentCenter";
