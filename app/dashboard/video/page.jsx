"use client";

import { useState } from "react";
import { Loader2, Video, Upload, Sparkles, AlertCircle } from "lucide-react";

export default function VideoGeneratorPage() {
    const [prompt, setPrompt] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result); // Base64 string
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateVideo = async () => {
        if (!prompt && !image) return;

        setLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const response = await fetch("/api/video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, image }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate video");
            }

            // Replicate returns an array or string depending on the model, handle both
            console.log("Video output:", data.output);
            const output = data.output;

            if (Array.isArray(output)) {
                setVideoUrl(output[0]);
            } else {
                setVideoUrl(output);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Video className="w-8 h-8 text-primary" />
                    Neural Video Studio
                </h1>
                <p className="text-muted-foreground">
                    Turn your text or images into cinematic videos using AI.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Text Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A cyberpunk city with neon rain..."
                            className="w-full h-32 p-3 rounded-md bg-background border focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reference Image (Optional)</label>
                        <div className="relative group cursor-pointer border-2 border-dashed border-border rounded-lg p-8 transition-colors hover:border-primary/50 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="mx-auto max-h-40 rounded shadow-md" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="w-8 h-8" />
                                    <span className="text-xs">Drop an image or click to upload</span>
                                </div>
                            )}
                        </div>
                        {imagePreview && (
                            <button
                                onClick={() => { setImage(null); setImagePreview(null); }}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Clear Image
                            </button>
                        )}
                    </div>

                    <button
                        onClick={generateVideo}
                        disabled={loading || (!prompt && !image)}
                        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Dreaming...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Video
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center min-h-[400px] relative overflow-hidden">
                    {videoUrl ? (
                        <video
                            src={videoUrl}
                            controls
                            autoPlay
                            loop
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-center space-y-3 text-zinc-700">
                            {loading ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="w-16 h-16 rounded-full bg-zinc-800 mb-4" />
                                    <p>Generating frames...</p>
                                </div>
                            ) : (
                                <>
                                    <Video className="w-16 h-16 mx-auto opacity-20" />
                                    <p className="font-mono text-sm">Output Monitor</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
