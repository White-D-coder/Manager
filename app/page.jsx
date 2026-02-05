import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <div className="max-w-2xl space-y-8">
                <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-surface-highlight border border-border shadow-sm animate-pulse-slow">
                        <Terminal className="w-12 h-12 text-primary" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-bold tracking-tight text-foreground font-display">
                        SOCIAL GROWTH <span className="text-primary">MACHINE</span>
                    </h1>
                    <p className="text-2xl text-muted-foreground font-serif italic">
                        Autonomous AI System. Closed-loop organic growth pipeline.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-left bg-surface/80 backdrop-blur-sm p-8 rounded-xl border border-border/50 shadow-lg font-sans text-sm">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">SYSTEM STATUS</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ONLINE
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">MODULES</span>
                        <span className="text-primary font-bold">9 ACTIVE</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-3 px-10 py-5 bg-primary text-white font-bold text-lg rounded-full hover:bg-primary/90 transition-all font-display shadow-xl shadow-primary/20"
                    >
                        ENTER MISSION CONTROL
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-xs text-muted-foreground/50 font-sans tracking-widest">
                SYSTEM ID: 71d4838f-93b6 // V1.0.0
            </div>
        </div>
    );
}
