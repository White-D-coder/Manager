"use client";

import LogConsole from "@/components/ui/LogConsole";
import { Cpu, Activity, Video } from "lucide-react";

export default function DashboardLayout({
    children,
}) {
    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            {/* Top Header */}
            <header className="h-14 border-b border-border bg-surface/50 backdrop-blur flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    <span className="font-mono font-bold tracking-widest text-sm">MISSION CONTROL</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>CPU: 12%</span>
                    </div>
                    <span>MEM: 4.2GB</span>
                    <span className="text-secondary">NET: CONNECTED</span>
                </div>
            </header>



            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-border bg-surface/30 backdrop-blur-sm flex flex-col">
                    <nav className="flex-1 p-4 space-y-2">
                        <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                            <Activity className="w-4 h-4" />
                            Overview
                        </a>
                        <a href="/dashboard/director" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                            <Cpu className="w-4 h-4" />
                            Content Director
                        </a>
                        <a href="/dashboard/video" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            <Video className="w-4 h-4" />
                            Video Lab
                        </a>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative scrollbar-thin">
                    {children}
                </main>
            </div>

            {/* Bottom Log Console */}
            <div className="shrink-0 z-50">
                <LogConsole />
            </div>
        </div >
    );
}
