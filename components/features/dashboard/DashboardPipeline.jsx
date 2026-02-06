"use client";

import { motion } from "framer-motion";
import { Layers, Clapperboard, Video, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const PIPELINE_STEPS = [
    {
        id: 1,
        title: "Market Intelligence",
        subtitle: "Find High-Velocity Topics",
        icon: Layers,
        href: "/dashboard/studio",
        description: "Start here. AI scans YouTube to find what audiences are craving right now.",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100"
    },
    {
        id: 2,
        title: "Creative Director",
        subtitle: "Generate Viral Scripts",
        icon: Clapperboard,
        href: "/dashboard/director",
        description: "Turn your topic into a psychological hook and engaging script.",
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100"
    },
    {
        id: 3,
        title: "Production Lab",
        subtitle: "Upload & Optimize",
        icon: Video,
        href: "/dashboard/video",
        description: "Process your video file and publish it to YouTube with SEO metadata.",
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-100"
    },
    {
        id: 4,
        title: "Growth Audit",
        subtitle: "Analyze Performance",
        icon: Activity,
        href: "/dashboard/audit",
        description: "Check your video's health score and fix algorithm blockers.",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100"
    }
];

export default function DashboardPipeline() {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-primary mb-3">
                    Content Production Pipeline
                </h2>
                <p className="text-muted-foreground flex items-center justify-center gap-2">
                    Follow these 4 steps to launch your viral video.
                </p>
            </div>

            <div className="space-y-4 relative">
                {/* Connecting Line (Vertical) - Hidden on mobile, visible on desktop */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border hidden md:block -z-10" />

                {PIPELINE_STEPS.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        <Link href={step.href} className="block group">
                            <div className={clsx(
                                "flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-xl border transition-all duration-200",
                                "bg-surface hover:shadow-lg hover:border-primary/20 hover:-translate-y-1",
                                step.border
                            )}>
                                {/* Step Number Indicator */}
                                <div className={clsx(
                                    "w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2",
                                    "bg-white z-10 shadow-sm transition-colors group-hover:scale-105",
                                    step.border,
                                    step.color
                                )}>
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">Step</span>
                                    <span className="text-2xl font-bold">{step.id}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                            {step.title}
                                        </h3>
                                        <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white border", step.border, step.color)}>
                                            {step.subtitle}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Action Arrow */}
                                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-secondary/50 rounded-xl border border-dashed border-border text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>System Ready: Complete steps 1-4 sequentially for best results.</span>
                </div>
            </div>
        </div>
    );
}
