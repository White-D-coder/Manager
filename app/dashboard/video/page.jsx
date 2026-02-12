"use client";

import { useState } from "react";
import { Loader2, Video, Upload, Sparkles, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function VideoGeneratorPage() {
    const [prompt, setPrompt] = useState("");
    const [image, setImage] = useState(null);
    const [modelType, setModelType] = useState('FAST'); // 'FAST' or 'QUALITY'
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState('video'); // 'video' | 'thumbnail'

    // Thumbnail State
    const [thumbPrompt, setThumbPrompt] = useState("");
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [thumbUrl, setThumbUrl] = useState(null);
    const [thumbLoading, setThumbLoading] = useState(false);

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
                body: JSON.stringify({ prompt, image, modelType }),
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

    const generateThumbnail = async () => {
        if (!thumbPrompt) return;
        setThumbLoading(true);
        setError(null);
        setThumbUrl(null);

        try {
            const response = await fetch("/api/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: thumbPrompt, aspectRatio }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed");

            console.log("Image Output:", data.output);
            setThumbUrl(data.output);

        } catch (e) {
            setError(e.message);
        } finally {
            setThumbLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Video className="w-8 h-8 text-primary" />
                        Creative Studio
                    </h1>
                    <p className="text-muted-foreground">
                        Generate cinematic videos and viral thumbnails with AI.
                    </p>
                </div>

                <div className="flex bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('video')}
                        className={clsx(
                            "px-6 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'video' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Video
                    </button>
                    <button
                        onClick={() => setActiveTab('thumbnail')}
                        className={clsx(
                            "px-6 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'thumbnail' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Thumbnail
                    </button>
                </div>
            </div>

            {activeTab === 'video' ? (
                // VIDEO INTERFACE
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm h-fit">

                        {/* Model Selector */}
                        <div className="p-1 bg-muted rounded-lg flex gap-1">
                            <button
                                onClick={() => setModelType('FAST')}
                                className={clsx(
                                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                    modelType === 'FAST' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                ⚡ Fast Draft
                            </button>
                            <button
                                onClick={() => setModelType('QUALITY')}
                                className={clsx(
                                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                    modelType === 'QUALITY' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                ✨ Pro Quality
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex justify-between">
                                <span>Text Prompt</span>
                                {modelType === 'QUALITY' && <span className="text-[10px] text-primary uppercase font-bold tracking-wider">High Fidelity</span>}
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={modelType === 'QUALITY'
                                    ? "Describe a cinematic scene with detailed lighting and movement..."
                                    : "A cyberpunk city with neon rain..."}
                                className="w-full h-32 p-3 rounded-md bg-background border focus:ring-2 focus:ring-primary outline-none resize-none transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reference Image {modelType === 'QUALITY' && <span className="text-muted-foreground">(Highly Recommended)</span>}</label>
                            <div className="relative group cursor-pointer border-2 border-dashed border-border rounded-lg p-8 transition-colors hover:border-primary/50 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />

                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="mx-auto max-h-40 rounded shadow-md object-contain" />
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
                                    className="text-xs text-destructive hover:underline"
                                >
                                    Clear Image
                                </button>
                            )}
                        </div>

                        <button
                            onClick={generateVideo}
                            disabled={loading || (!prompt && !image)}
                            className={clsx(
                                "w-full py-3 font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                                modelType === 'QUALITY' ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" : "bg-primary text-primary-foreground"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {modelType === 'QUALITY' ? "Rendering Cinematic..." : "Dreaming..."}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    {modelType === 'QUALITY' ? "Generate Pro Video" : "Generate Draft"}
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
            ) : (
                // THUMBNAIL INTERFACE
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm h-fit">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Thumbnail Concept</label>
                            <textarea
                                value={thumbPrompt}
                                onChange={(e) => setThumbPrompt(e.target.value)}
                                placeholder="A shocked YouTuber pointing at a flying car, vibrant colors, 4k..."
                                className="w-full h-32 p-3 rounded-md bg-background border focus:ring-2 focus:ring-primary outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Aspect Ratio</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['16:9', '9:16', '1:1'].map((ratio) => (
                                    <button
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={clsx(
                                            "py-2 text-sm font-medium rounded-md border transition-all",
                                            aspectRatio === ratio
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-background border-border hover:bg-muted"
                                        )}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={generateThumbnail}
                            disabled={thumbLoading || !thumbPrompt}
                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {thumbLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Painting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Thumbnail
                                </>
                            )}
                        </button>
                    </div>

                    {/* Thumbnail Preview */}
                    <div className="bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center min-h-[400px] relative overflow-hidden group">
                        {thumbUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <img
                                    src={thumbUrl}
                                    alt="Generated Thumbnail"
                                    className="max-w-full max-h-full rounded shadow-2xl"
                                />
                                <a
                                    href={thumbUrl}
                                    download="thumbnail.webp"
                                    target="_blank"
                                    className="absolute bottom-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 backdrop-blur-md"
                                >
                                    <Upload className="w-4 h-4 rotate-180" /> Download
                                </a>
                            </div>
                        ) : (
                            <div className="text-center space-y-3 text-zinc-700">
                                {thumbLoading ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                        <div className="w-16 h-16 rounded-full bg-zinc-800 mb-4" />
                                        <p>Rendering pixels...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Sparkles className="w-16 h-16 mx-auto opacity-20" />
                                        <p className="font-mono text-sm">Canvas Empty</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
