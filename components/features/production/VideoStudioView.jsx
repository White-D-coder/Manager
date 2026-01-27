"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { VideoRenderer } from "@/lib/brain/VideoRenderer";
import { motion } from "framer-motion";
import { generateVideoWithVeo } from "@/app/actions/veo";

export default function VideoStudioView() {
    const { generatedScript, setModule, setVideoAsset, addLog } = useAppStore();
    const [asset, setLocalAsset] = useState(null);
    const [progress, setProgress] = useState(0);

    const [sectionVideos, setSectionVideos] = useState({});

    useEffect(() => {
        if (!generatedScript || asset) return;

        const loadAssets = async () => {
            addLog({ module: 'VideoCore', level: 'info', message: 'Initializing Gemini Veo (Generative Video Model)...' });

            // const { searchStockVideos } = await import("@/app/actions/pexels"); // Removed Pexels
            const newVideos = {};

            // Generate a video for each section based on visual cue
            // We prioritize the HEAD section (Hook) first for speed
            for (const section of generatedScript.sections) {
                addLog({ module: 'VideoGen', level: 'info', message: `Synthesizing scene: "${section.visual_cue.substring(0, 30)}..."` });

                const videoUrl = await generateVideoWithVeo(section.visual_cue);

                if (videoUrl) {
                    newVideos[section.id] = videoUrl;
                    addLog({ module: 'VideoGen', level: 'success', message: `SCENE RENDERED: Frame ${section.id}` });
                    // Update state incrementally so user sees progress
                    setSectionVideos(prev => ({ ...prev, [section.id]: videoUrl }));
                }
            }

            // Start Render Simulation after assets are loaded
            // We speed this up slightly now that "Generation" was the time consuming part
            const duration = 2000;
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setLocalAsset(VideoRenderer.initializeRender(generatedScript));
                        return 100;
                    }
                    return prev + 10;
                });
            }, duration / 10);

            return () => clearInterval(interval);
        };

        loadAssets();
    }, [generatedScript]);

    useEffect(() => {
        if (progress === 100) {
            const finalAsset = VideoRenderer.initializeRender(generatedScript);
            // Attach the real video URLs to the asset if we were persisting fully
            setVideoAsset({ ...finalAsset, status: 'ready', render_progress: 100 });
            addLog({ module: 'VideoCore', level: 'success', message: 'Render complete. 4K Mastering finished.' });
            setTimeout(() => setModule(5), 3000);
        }
    }, [progress]);

    if (!asset || !generatedScript) return null;

    return (
        <div className="h-full flex flex-col p-6 gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="flex items-center gap-2 text-warning font-mono text-xl">
                    <Film className="w-6 h-6 animate-pulse" />
                    VIDEO_GENERATION_CORE
                </h3>
                <div className="font-mono text-xs text-zinc-500">
                    EST. DURATION: {(generatedScript.total_duration_ms / 1000).toFixed(1)}s
                </div>
            </div>

            {/* Main Viewport / Preview */}
            <div className="flex-1 bg-black rounded-lg border border-zinc-800 relative overflow-hidden flex items-center justify-center group">

                {/* Real Video Background Logic */}
                {Object.values(sectionVideos).length > 0 ? (
                    <div className="absolute inset-0 opacity-50 contrast-125 saturate-0 group-hover:saturate-100 transition-all duration-700">
                        {/* We just loop a random one or the first one for the preview effect */}
                        <video
                            src={Object.values(sectionVideos)[0]}
                            autoPlay
                            muted
                            loop
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                )}

                <div className="text-center space-y-4 relative z-10 p-8 glass-panel rounded-xl">
                    {progress < 100 ? (
                        <>
                            <div className="text-4xl font-bold text-white tracking-widest font-mono animate-pulse">
                                RENDERING
                            </div>
                            <div className="text-zinc-400 font-mono text-sm">
                                Processing 4K Layers... {progress}%
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                <Play className="w-8 h-8 ml-1" />
                            </div>
                            <div className="text-white font-mono text-sm uppercase tracking-widest">Mastering Complete</div>
                        </motion.div>
                    )}
                </div>

                {/* Timeline Representation */}
                <div className="absolute bottom-4 left-4 right-4 h-16 bg-black/80 backdrop-blur border border-white/10 rounded-lg flex items-center p-2 gap-1 overflow-hidden z-20">
                    {generatedScript.sections.map((section, i) => (
                        <div
                            key={section.id}
                            className="h-full rounded overflow-hidden relative group cursor-pointer border border-white/5 hover:border-white/50 transition-all"
                            style={{ flex: section.duration_ms }}
                        >
                            {/* Miniature video preview if available */}
                            {sectionVideos[section.id] && (
                                <video
                                    src={sectionVideos[section.id]}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100"
                                />
                            )}
                            <div className="absolute bottom-1 left-1 bg-black/50 px-1 py-0.5 rounded text-[8px] text-white uppercase font-mono">
                                {section.type}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
