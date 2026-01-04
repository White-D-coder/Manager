import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
            <div className="max-w-2xl space-y-8">
                <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-primary/10 ring-1 ring-primary/50 animate-pulse-slow">
                        <Terminal className="w-12 h-12 text-primary" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl font-bold tracking-tight text-white font-mono">
                        SOCIAL GROWTH <span className="text-primary">MACHINE</span>
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Autonomous AI System. Closed-loop organic growth pipeline.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-left bg-surface p-6 rounded-lg border border-border font-mono text-sm">
                    <div className="flex flex-col gap-2">
                        <span className="text-zinc-500">SYSTEM STATUS</span>
                        <span className="text-success">● ONLINE</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-zinc-500">MODULES</span>
                        <span className="text-secondary">9 ACTIVE</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-2 px-8 py-4 bg-primary text-black font-bold text-lg rounded-sm hover:bg-primary/90 transition-all font-mono"
                    >
                        ENTER MISSION CONTROL
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-xs text-zinc-600 font-mono">
                SYSTEM ID: 71d4838f-93b6 // V1.0.0
            </div>
        </div>
    );
}
