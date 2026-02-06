"use client";

import LogConsole from "@/components/ui/LogConsole";
import MissionGuide from "@/components/features/dashboard/MissionGuide";
import { Cpu, Activity, Video, Clapperboard, Layers, Zap, Command } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const navigation = [
    { name: 'Mission Control', href: '/dashboard', icon: Command },
    { name: 'Content Director', href: '/dashboard/director', icon: Clapperboard },
    { name: 'Niche Studio', href: '/dashboard/studio', icon: Layers },
    { name: 'Video Lab', href: '/dashboard/video', icon: Video },
    { name: 'Audit', href: '/dashboard/audit', icon: Activity },
];

export default function DashboardLayout({ children }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-screen bg-surface text-foreground overflow-hidden font-sans">
            {/* Top Header - Minimal */}
            <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-foreground text-background flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <span className="font-semibold tracking-tight text-sm">Social Growth Machine</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span>Online</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar - Clean & Functional */}
                <aside className="w-60 border-r border-border bg-background flex flex-col">
                    <div className="p-3">
                        <nav className="space-y-0.5">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            isActive
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className={cn("w-4 h-4", isActive ? "text-foreground" : "text-muted-foreground")} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-3 border-t border-border">
                        <div className="flex items-center gap-3 px-2 py-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Zap className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                                <div className="text-xs font-medium">Pro Plan</div>
                                <div className="text-[10px] text-muted-foreground">70% Used</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area - Solid Surface */}
                <main className="flex-1 overflow-y-auto relative bg-surface p-6 md:p-8">
                    {children}
                </main>
            </div>

            {/* Bottom Log Console */}
            <div className="shrink-0 z-50 border-t border-border bg-background">
                <LogConsole />
            </div>

            {/* Floating Mission Guide */}
            <MissionGuide />
        </div>
    );
}
