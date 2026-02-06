"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import OnboardingWizard from "@/components/features/onboarding/OnboardingWizard";
import { motion } from "framer-motion";
import { Activity, Clapperboard, Layers, Video, ArrowRight, Zap, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import DashboardPipeline from "@/components/features/dashboard/DashboardPipeline";
import { getYouTubeAuthUrl, checkConnectionStatus, disconnectYouTube } from "@/app/actions/youtube";

export default function DashboardPage() {
    const { isSystemActive } = useAppStore();

    return (
        <div className="min-h-full p-8 md:p-12">
            {!isSystemActive ? (
                <div className="h-full flex items-center justify-center">
                    <OnboardingWizard />
                </div>
            ) : (
                <CentralCommand />
            )}
        </div>
    );
}



function CentralCommand() {
    const { winningNiche, config, setConfig } = useAppStore();
    const [authUrl, setAuthUrl] = useState(null);

    useEffect(() => {
        // Prefetch auth URL for the button
        getYouTubeAuthUrl().then(url => setAuthUrl(url));

        // Verify real connection status from server cookie
        checkConnectionStatus().then(isConnected => {
            if (isConnected !== config?.connected) {
                setConfig({ connected: isConnected });
            }
        });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full space-y-8"
        >
            {/* Restored Connection Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl border border-border bg-surface shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center border-2",
                        config?.connected ? "border-success bg-success/10" : "border-muted bg-muted/50"
                    )}>
                        <Zap className={clsx("w-6 h-6", config?.connected ? "text-success fill-success" : "text-muted-foreground")} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            {config?.connected ? "Channel Connected" : "Connect Your Channel"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {config?.connected
                                ? "System is fully operational and ready to publish."
                                : "Link your YouTube account to enable auto-upload and deep auditing."}
                        </p>
                    </div>
                </div>

                {!config?.connected && authUrl && (
                    <a
                        href={authUrl}
                        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Users className="w-5 h-5" />
                        Connect YouTube
                    </a>
                )}

                {config?.connected && (
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-lg bg-background border border-border text-sm font-bold text-success flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            Online
                        </div>
                        <button
                            onClick={async () => {
                                // 1. Server disconnect
                                await disconnectYouTube();

                                // 2. Client-side cleanup (Nuclear option)
                                document.cookie = "yt_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                                localStorage.removeItem('social-growth-storage'); // Clear persisted store

                                // 3. State reset
                                setConfig({ connected: false, channelName: null });

                                // 4. Hard Reload
                                window.location.href = "/dashboard";
                            }}
                            className="px-4 py-2 rounded-lg bg-surface hover:bg-muted border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Switch Account
                        </button>
                    </div>
                )}
            </div>

            <DashboardPipeline />
        </motion.div>
    );
}
