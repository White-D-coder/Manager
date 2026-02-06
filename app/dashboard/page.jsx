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

import DashboardPipeline from "@/components/features/dashboard/DashboardPipeline";

function CentralCommand() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
        >
            <DashboardPipeline />
        </motion.div>
    );
}
