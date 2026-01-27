import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

export const useAppStore = create(
    persist(
        (set) => ({
            isSystemActive: false,
            activeModuleId: 0,
            config: defaultConfig,
            logs: [],
            currentTrends: [],
            selectedTrend: null,
            generatedScript: null,
            videoAsset: null,
            strategyProfile: null,
            winningNiche: null,

            setConfig: (newConfig) => set((state) => ({ config: { ...state.config, ...newConfig } })),

            setTrends: (trends) => set({ currentTrends: trends }),
            setSelectedTrend: (trend) => set({ selectedTrend: trend }),
            setScript: (script) => set({ generatedScript: script }),
            setVideoAsset: (asset) => set({ videoAsset: asset }),
            setStrategyProfile: (profile) => set({ strategyProfile: profile }),
            setWinningNiche: (niche) => set({ winningNiche: niche }),

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
        }),
        {
            name: 'social-growth-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({
                isSystemActive: state.isSystemActive,
                activeModuleId: state.activeModuleId,
                config: state.config,
                winningNiche: state.winningNiche,
                currentTrends: state.currentTrends,
                selectedTrend: state.selectedTrend,
                generatedScript: state.generatedScript,
                videoAsset: state.videoAsset,
                strategyProfile: state.strategyProfile,
                logs: state.logs
            }),
        }
    )
);
