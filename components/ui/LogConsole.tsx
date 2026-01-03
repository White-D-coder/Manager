"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function LogConsole() {
    const { logs } = useAppStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="w-full h-48 bg-black border-t border-border font-mono text-xs overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-surface border-b border-border flex justify-between items-center text-zinc-500 text-[10px] tracking-wider uppercase">
                <span>System Log // Real-time Telemetry</span>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    LIVE
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={log.id}
                            className="flex gap-3"
                        >
                            <span className="text-zinc-600 shrink-0">[{log.timestamp.split("T")[1].split(".")[0]}]</span>
                            <span className={clsx(
                                "uppercase font-bold shrink-0 w-24",
                                log.level === 'info' && "text-blue-400",
                                log.level === 'success' && "text-primary",
                                log.level === 'warning' && "text-warning",
                                log.level === 'error' && "text-destructive"
                            )}>
                                {log.module}
                            </span>
                            <span className="text-zinc-300">{log.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
