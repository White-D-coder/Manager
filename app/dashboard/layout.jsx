"use client";

import LogConsole from "@/components/ui/LogConsole";
import { Cpu, Activity } from "lucide-react";

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

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative scrollbar-thin">
                {children}
            </main>

            {/* Bottom Log Console */}
            <div className="shrink-0 z-50">
                <LogConsole />
            </div>
        </div>
    );
}
