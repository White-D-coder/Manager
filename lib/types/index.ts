export type Platform = 'youtube' | 'instagram';
export type TargetRegion = 'india' | 'usa' | 'global';
export type GrowthPriority = 'reach' | 'retention' | 'conversion';
export type ContentFormat = 'reel' | 'short' | 'carousel';

export interface GrowthConfig {
    account_type: 'personal' | 'brand' | 'client';
    platforms: Platform[];
    language: 'english' | 'hinglish' | 'hindi';
    target_region: TargetRegion;
    initial_genre: string;
    niche_modifiers: string[]; // e.g., ["luxury", "fast-paced"]
    risk_profile: 'low' | 'medium' | 'high'; // low = safe trends, high = experimental
    growth_priority: GrowthPriority;
    learning_mode: 'aggressive' | 'balanced' | 'conservative';
}

export interface TrendItem {
    id: string;
    topic: string;
    source: 'twitter' | 'google_trends' | 'competitor' | 'internal_prediction';
    volume: number; // 0-100
    growth_rate: number; // % increase per hour
    engagement_velocity: number; // likes per second (mocked)
    competition_density: number; // 0-100 (high is bad)
    trend_score: number; // The calculated detailed score
    timestamp: string;
}

export interface ScriptSection {
    id: string;
    type: 'hook' | 'curiosity' | 'value' | 'reinforcement' | 'cta';
    duration_ms: number;
    text: string;
    visual_cue: string; // Description for video generator
}

export interface GeneratedScript {
    id: string;
    trend_id: string;
    title: string;
    sections: ScriptSection[];
    total_duration_ms: number;
    tone: string;
    target_platform: Platform;
    created_at: string;
}

export interface ThumbnailVariant {
    id: string;
    script_id: string;
    prompt: string;
    style: 'emotional' | 'minimal' | 'text-heavy' | 'shock';
    predicted_ctr: number; // 0.0 to 1.0
    image_url?: string; // Placeholder or generated
}

export interface VideoAsset {
    id: string;
    script_id: string;
    thumbnail_id: string;
    status: 'rendering' | 'ready' | 'uploaded' | 'failed';
    render_progress: number; // 0-100
    file_path?: string;
    upload_url?: string;
    deployed_at?: string;
}

export interface SystemLog {
    id: string;
    module: string; // "DataCapture", "DecisionBrain", etc.
    level: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
    meta?: any;
}
