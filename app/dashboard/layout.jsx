"use client";

import LogConsole from "@/components/ui/LogConsole";
import { Cpu, Activity, Video, Clapperboard, Layers, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const navigation = [
    { name: 'Mission Control', href: '/dashboard', icon: Activity },
    { name: 'Content Director', href: '/dashboard/director', icon: Clapperboard },
    { name: 'Niche Studio', href: '/dashboard/studio', icon: Layers },
    { name: 'Video Lab', href: '/dashboard/video', icon: Video },
    { name: 'Audit', href: '/dashboard/audit', icon: Activity },
];

export default function DashboardLayout({ children }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
            {/* Top Header - Glassmorphic */}
            <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-40 relative">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <Cpu className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-bold tracking-tight text-sm leading-none">SOCIAL GROWTH</h1>
                        <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase mt-0.5">Automated Systems</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono text-zinc-500">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-highlight border border-border">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span className="text-zinc-400">SYS: <span className="text-emerald-500">ONLINE</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <span>CPU: 12%</span>
                        <span>MEM: 4.2GB</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar - Modern & Clean */}
                <aside className="w-64 border-r border-border bg-surface/50 backdrop-blur-sm flex flex-col z-30">
                    <div className="p-4">
                        <div className="text-xs font-semibold text-zinc-600 mb-4 px-2 tracking-wider">MODULES</div>
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                                        )}
                                    >
                                        <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300")} />
                                        {item.name}
                                        {isActive && (
                                            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-4 border-t border-border/50">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-950 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-3 h-3 text-warning" />
                                <span className="text-xs font-medium text-zinc-300">Pro Plan</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full w-[70%] bg-primary/50" />
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-2">70% Resources Used</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative scrollbar-thin bg-gradient-to-b from-background to-[#050505]">
                    {children}
                </main>
            </div>

            {/* Bottom Log Console */}
            <div className="shrink-0 z-50 border-t border-border bg-background">
                <LogConsole />
            </div>
        </div>
    );
}
