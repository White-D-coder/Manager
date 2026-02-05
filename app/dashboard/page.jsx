"use client";

import { useAppStore } from "@/lib/store";
import OnboardingWizard from "@/components/features/onboarding/OnboardingWizard";
import { motion } from "framer-motion";
import { Activity, Clapperboard, Layers, Video, ArrowRight, Zap, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

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
    const { winningNiche, config } = useAppStore();

    const MODULES = [
        {
            title: "Niche Intelligence",
            desc: "Scout trends & market gaps",
            icon: Layers,
            href: "/dashboard/studio",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: "Creative Director",
            desc: "Generate scripts & viral hooks",
            icon: Clapperboard,
            href: "/dashboard/director",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            title: "Production Lab",
            desc: "Edit videos & thumbnails",
            icon: Video,
            href: "/dashboard/video",
            color: "text-destructive",
            bg: "bg-destructive/10",
            border: "border-destructive/20"
        },
        {
            title: "Growth Audit",
            desc: "Analyze performance & SEO",
            icon: Activity,
            href: "/dashboard/audit",
            color: "text-success",
            bg: "bg-success/10",
            border: "border-success/20"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-12"
        >
            {/* Header / Status */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 font-serif">
                        Command Center
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            System Online
                        </div>
                        <span className="w-1 h-1 rounded-full bg-primary/30" />
                        <div>{config?.account_type === "new" ? "New Account" : "Connected Channel"}</div>
                    </div>
                </div>

                {winningNiche && (
                    <div className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border backdrop-blur-md">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            ACTIVE OPERATION
                        </div>
                        <div className="text-lg font-bold text-primary flex items-center gap-2">
                            <Zap className="w-4 h-4 text-warning fill-warning" />
                            {winningNiche}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Pipeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MODULES.map((mod, i) => (
                    <Link
                        key={i}
                        href={mod.href}
                        className={clsx(
                            "group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
                            "bg-surface/50 hover:bg-surface border-border/50",
                            mod.border
                        )}
                    >
                        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors", mod.bg, mod.color)}>
                            <mod.icon className="w-6 h-6" />
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors font-serif">
                            {mod.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 font-medium">
                            {mod.desc}
                        </p>

                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                            <ArrowRight className={clsx("w-5 h-5", mod.color)} />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-surface/40 border border-border backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-5 h-5 text-success" />
                        <h3 className="font-bold text-foreground">Market Pulse</h3>
                    </div>
                    <div className="h-24 flex items-center justify-center text-xs text-muted-foreground font-mono border border-dashed border-border rounded-lg bg-surface/30">
                        Processing Real-Time Trends...
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/50 border border-border backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold text-foreground">Audience Intel</h3>
                    </div>
                    <div className="h-24 flex items-center justify-center text-xs text-muted-foreground font-mono border border-dashed border-border rounded-lg bg-surface/30">
                        Waiting for upload data...
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/50 border border-border backdrop-blur-sm flex flex-col justify-center items-center text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary mb-1 font-serif">
                        {config?.targetUploadsPerDay || 1}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                        Daily Upload Target
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
