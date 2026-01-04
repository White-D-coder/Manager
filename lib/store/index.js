import { create } from 'zustand';

const defaultConfig = {
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

export const useAppStore = create((set) => ({
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
        const newLog = {
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
