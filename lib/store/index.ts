import { create } from 'zustand';
import { GrowthConfig, SystemLog } from '@/lib/types';

interface AppState {
    // System State
    isSystemActive: boolean;
    activeModuleId: number; // 0-9

    // Configuration (Module 0)
    config: GrowthConfig;
    setConfig: (config: Partial<GrowthConfig>) => void;

    // Logs (Global Console)
    logs: SystemLog[];
    addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;

    // Data Pipeline State
    currentTrends: import('@/lib/types').TrendItem[];
    selectedTrend: import('@/lib/types').TrendItem | null;
    generatedScript: import('@/lib/types').GeneratedScript | null;
    videoAsset: import('@/lib/types').VideoAsset | null;
    strategyProfile: import('@/lib/brain/StrategyAgent').StrategyProfile | null;

    // Actions
    setTrends: (trends: import('@/lib/types').TrendItem[]) => void;
    setSelectedTrend: (trend: import('@/lib/types').TrendItem) => void;
    setScript: (script: import('@/lib/types').GeneratedScript) => void;
    setVideoAsset: (asset: import('@/lib/types').VideoAsset) => void;
    setStrategyProfile: (profile: import('@/lib/brain/StrategyAgent').StrategyProfile) => void;

    startSystem: () => void;
    stopSystem: () => void;
    setModule: (id: number) => void;
}

const defaultConfig: GrowthConfig = {
    account_type: 'personal',
    platforms: ['instagram'],
    language: 'english',
    target_region: 'india',
    initial_genre: '',
    niche_modifiers: [],
    risk_profile: 'low',
    growth_priority: 'reach',
    learning_mode: 'aggressive',
};

export const useAppStore = create<AppState>((set) => ({
    isSystemActive: false,
    activeModuleId: 0,
    config: defaultConfig,
    logs: [],
    currentTrends: [],
    selectedTrend: null,
    generatedScript: null,
    videoAsset: null,
    strategyProfile: null,

    setConfig: (newConfig) => set((state) => ({ config: { ...state.config, ...newConfig } })),

    setTrends: (trends) => set({ currentTrends: trends }),
    setSelectedTrend: (trend) => set({ selectedTrend: trend }),
    setScript: (script) => set({ generatedScript: script }),
    setVideoAsset: (asset) => set({ videoAsset: asset }),
    setStrategyProfile: (profile) => set({ strategyProfile: profile }),

    addLog: (log) => set((state) => {
        const newLog: SystemLog = {
            ...log,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString(),
        };
        // Keep only last 100 logs
        return { logs: [newLog, ...state.logs].slice(0, 100) };
    }),

    startSystem: () => set({ isSystemActive: true, activeModuleId: 1 }),
    stopSystem: () => set({ isSystemActive: false }),
    setModule: (id) => set({ activeModuleId: id }),
}));
